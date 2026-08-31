/**
 * SahakarSeva Fair-Match Engine
 * 
 * The single most important piece — transparent, explainable job matching.
 * 
 * Algorithm:
 * 1. Build candidate pool (verified, online, skilled, nearby)
 * 2. Score each candidate (proximity 0.4, rating 0.3, fairness 0.3)
 * 3. Offer to top candidate, cascade on decline/expiry
 * 4. All scores are stored for transparency
 */

const OFFER_TIMEOUT_SECONDS = 90;
const EXPIRY_CHECK_INTERVAL_MS = 10000; // 10 seconds

/**
 * Haversine distance between two lat/lng points in kilometers.
 */
function haversineDistance(lat1, lng1, lat2, lng2) {
  const R = 6371; // Earth's radius in km
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a = Math.sin(dLat / 2) ** 2 +
            Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
            Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(deg) {
  return deg * (Math.PI / 180);
}

/**
 * Step 1 — Build candidate pool.
 * Returns workers who are verified, online, have the right skill, and are within radius.
 */
async function getCandidatePool(prisma, booking, maxRadiusKm) {
  // Get all verified, online workers
  const allWorkers = await prisma.workerProfile.findMany({
    where: {
      kyc_status: 'verified',
      availability_status: 'online',
      current_lat: { not: null },
      current_lng: { not: null },
    },
    include: {
      user: true,
      cooperative: true,
    }
  });

  // Get the service category name for skill matching
  const category = await prisma.serviceCategory.findUnique({
    where: { id: booking.category_id }
  });

  if (!category) return [];

  // Filter by skill and distance
  const candidates = [];
  for (const worker of allWorkers) {
    // Parse skill_categories JSON array
    let skills = [];
    try {
      skills = JSON.parse(worker.skill_categories);
    } catch (e) {
      skills = [];
    }

    // Check skill match
    if (!skills.includes(category.name)) continue;

    // Check distance
    const distance = haversineDistance(
      booking.lat, booking.lng,
      worker.current_lat, worker.current_lng
    );

    if (distance <= maxRadiusKm) {
      candidates.push({ ...worker, distance_km: distance });
    }
  }

  return candidates;
}

/**
 * Step 2 — Score each candidate.
 * Returns candidates with computed scores.
 */
function scoreCandidates(candidates, cooperative) {
  const maxRadiusKm = cooperative.max_radius_km || 5.0;
  const fairnessCapHours = cooperative.fairness_cap_hours || 72;
  const wProximity = cooperative.weight_proximity || 0.4;
  const wRating = cooperative.weight_rating || 0.3;
  const wFairness = cooperative.weight_fairness || 0.3;

  return candidates.map(worker => {
    // Proximity score: 1 = very close, 0 = at max radius
    const proximityScore = Math.max(0, Math.min(1, 1 - (worker.distance_km / maxRadiusKm)));

    // Rating score: normalized 0-1
    const ratingScore = (worker.rating_avg || 5.0) / 5.0;

    // Fairness score: how long since last job (idle workers get priority)
    let idleHours = fairnessCapHours; // default: max fairness if never completed a job
    if (worker.last_job_completed_at) {
      idleHours = (Date.now() - new Date(worker.last_job_completed_at).getTime()) / (1000 * 60 * 60);
    }
    const fairnessScore = Math.min(idleHours / fairnessCapHours, 1);

    // Weighted total
    const totalScore = (wProximity * proximityScore) +
                       (wRating * ratingScore) +
                       (wFairness * fairnessScore);

    return {
      ...worker,
      proximity_score: Math.round(proximityScore * 1000) / 1000,
      rating_score: Math.round(ratingScore * 1000) / 1000,
      fairness_score: Math.round(fairnessScore * 1000) / 1000,
      total_score: Math.round(totalScore * 1000) / 1000,
    };
  }).sort((a, b) => b.total_score - a.total_score);
}

/**
 * Step 3 — Create an offer for the top-ranked candidate.
 * Returns the created match offer, or null if no candidates remain.
 */
async function createOfferForTopCandidate(prisma, bookingId, scoredCandidates, startIndex = 0) {
  // Find the next candidate who hasn't already been offered this booking
  const existingOffers = await prisma.matchOffer.findMany({
    where: { booking_id: bookingId },
    select: { worker_id: true }
  });
  const alreadyOffered = new Set(existingOffers.map(o => o.worker_id));

  for (let i = startIndex; i < scoredCandidates.length; i++) {
    const candidate = scoredCandidates[i];
    if (alreadyOffered.has(candidate.user_id)) continue;

    const now = new Date();
    const expiresAt = new Date(now.getTime() + OFFER_TIMEOUT_SECONDS * 1000);

    const offer = await prisma.matchOffer.create({
      data: {
        booking_id: bookingId,
        worker_id: candidate.user_id,
        proximity_score: candidate.proximity_score,
        rating_score: candidate.rating_score,
        fairness_score: candidate.fairness_score,
        total_score: candidate.total_score,
        offered_at: now,
        expires_at: expiresAt,
        response: 'pending',
      }
    });

    console.log(`📨 Match offer created: worker=${candidate.user_id}, booking=${bookingId}, score=${candidate.total_score}, expires=${expiresAt.toISOString()}`);

    return offer;
  }

  // No more candidates — mark booking as cancelled (no workers available)
  await prisma.booking.update({
    where: { id: bookingId },
    data: { status: 'cancelled' }
  });
  console.log(`❌ No candidates available for booking ${bookingId}, marked as cancelled`);

  return null;
}

/**
 * Main entry point: find candidates, score them, and create the first offer.
 * Called when a new booking is created.
 */
async function findAndOffer(prisma, bookingId) {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { category: true }
  });

  if (!booking) {
    console.error(`Booking ${bookingId} not found`);
    return null;
  }

  // Get the cooperative config (use the first cooperative for now — in production, derive from service area)
  const cooperative = await prisma.cooperative.findFirst();
  if (!cooperative) {
    console.error('No cooperative found. Run the seed script first.');
    return null;
  }

  const maxRadiusKm = cooperative.max_radius_km || 5.0;

  // Step 1: Candidate pool
  const candidates = await getCandidatePool(prisma, booking, maxRadiusKm);
  console.log(`🔍 Found ${candidates.length} candidates for booking ${bookingId}`);

  if (candidates.length === 0) {
    await prisma.booking.update({
      where: { id: bookingId },
      data: { status: 'cancelled' }
    });
    return null;
  }

  // Step 2: Score
  const scored = scoreCandidates(candidates, cooperative);

  // Update booking status to matching
  await prisma.booking.update({
    where: { id: bookingId },
    data: { status: 'matching' }
  });

  // Step 3: Offer to top candidate
  const offer = await createOfferForTopCandidate(prisma, bookingId, scored);

  return offer;
}

/**
 * Handle offer decline — cascade to the next candidate.
 */
async function cascadeToNextCandidate(prisma, bookingId) {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { category: true }
  });

  if (!booking || booking.status !== 'matching') return null;

  const cooperative = await prisma.cooperative.findFirst();
  if (!cooperative) return null;

  const maxRadiusKm = cooperative.max_radius_km || 5.0;
  const candidates = await getCandidatePool(prisma, booking, maxRadiusKm);
  const scored = scoreCandidates(candidates, cooperative);

  return await createOfferForTopCandidate(prisma, bookingId, scored);
}

/**
 * Accept an offer — assign the worker to the booking.
 */
async function acceptOffer(prisma, offerId, workerId) {
  // Mark this offer as accepted
  const offer = await prisma.matchOffer.update({
    where: { id: offerId },
    data: {
      response: 'accepted',
      responded_at: new Date(),
    }
  });

  // Assign worker to booking
  const booking = await prisma.booking.update({
    where: { id: offer.booking_id },
    data: {
      status: 'assigned',
      assigned_worker_id: workerId,
    },
    include: {
      category: true,
      customer: true,
    }
  });

  // Expire any other pending offers for this booking
  await prisma.matchOffer.updateMany({
    where: {
      booking_id: offer.booking_id,
      id: { not: offerId },
      response: 'pending',
    },
    data: {
      response: 'expired',
      responded_at: new Date(),
    }
  });

  console.log(`✅ Offer ${offerId} accepted by worker ${workerId} for booking ${offer.booking_id}`);

  return booking;
}

/**
 * Decline an offer — cascade to next candidate.
 */
async function declineOffer(prisma, offerId) {
  const offer = await prisma.matchOffer.update({
    where: { id: offerId },
    data: {
      response: 'declined',
      responded_at: new Date(),
    }
  });

  console.log(`⏭️ Offer ${offerId} declined, cascading to next candidate`);

  // Cascade
  const nextOffer = await cascadeToNextCandidate(prisma, offer.booking_id);
  return { offer, nextOffer };
}

/**
 * Background job: check for expired offers and cascade.
 * Runs every EXPIRY_CHECK_INTERVAL_MS.
 */
function startOfferExpiryChecker(prisma) {
  setInterval(async () => {
    try {
      // Find all expired pending offers
      const expiredOffers = await prisma.matchOffer.findMany({
        where: {
          response: 'pending',
          expires_at: { lt: new Date() }
        }
      });

      for (const offer of expiredOffers) {
        // Mark as expired
        await prisma.matchOffer.update({
          where: { id: offer.id },
          data: {
            response: 'expired',
            responded_at: new Date(),
          }
        });

        console.log(`⏰ Offer ${offer.id} expired, cascading to next candidate`);

        // Cascade to next candidate
        await cascadeToNextCandidate(prisma, offer.booking_id);
      }
    } catch (err) {
      console.error('Error in offer expiry checker:', err);
    }
  }, EXPIRY_CHECK_INTERVAL_MS);

  console.log(`⏱️  Offer expiry checker running every ${EXPIRY_CHECK_INTERVAL_MS / 1000}s`);
}

module.exports = {
  findAndOffer,
  acceptOffer,
  declineOffer,
  cascadeToNextCandidate,
  startOfferExpiryChecker,
  haversineDistance,
  scoreCandidates,
  getCandidatePool,
};
