const express = require('express');
const { authenticate } = require('../middleware/auth');
const { roleGuard } = require('../middleware/roleGuard');
const router = express.Router();

/**
 * POST /workers/kyc
 * Submit KYC documents for verification.
 */
router.post('/kyc', authenticate, roleGuard('worker'), async (req, res, next) => {
  try {
    const { doc_type, doc_number, doc_image_url } = req.body;
    if (!doc_type || !doc_number) {
      return res.status(400).json({ error: 'doc_type and doc_number are required' });
    }

    const prisma = req.app.locals.prisma;
    const profile = await prisma.workerProfile.update({
      where: { user_id: req.user.id },
      data: {
        kyc_doc_type: doc_type,
        kyc_doc_number: doc_number,
        kyc_doc_image_url: doc_image_url || null,
        kyc_status: 'pending',
      }
    });

    res.json({ kyc_status: profile.kyc_status });
  } catch (err) {
    next(err);
  }
});

/**
 * PUT /workers/me/availability
 * Toggle online/offline and update location.
 */
router.put('/me/availability', authenticate, roleGuard('worker'), async (req, res, next) => {
  try {
    const { status, lat, lng } = req.body;
    if (!status || !['online', 'offline'].includes(status)) {
      return res.status(400).json({ error: 'status must be "online" or "offline"' });
    }

    const prisma = req.app.locals.prisma;
    const profile = await prisma.workerProfile.update({
      where: { user_id: req.user.id },
      data: {
        availability_status: status,
        ...(lat != null && { current_lat: lat }),
        ...(lng != null && { current_lng: lng }),
      }
    });

    res.json({ worker_profile: profile });
  } catch (err) {
    next(err);
  }
});

/**
 * PUT /workers/me/skills
 * Update worker's skill categories.
 */
router.put('/me/skills', authenticate, roleGuard('worker'), async (req, res, next) => {
  try {
    const { skill_categories } = req.body;
    if (!Array.isArray(skill_categories)) {
      return res.status(400).json({ error: 'skill_categories must be an array' });
    }

    const prisma = req.app.locals.prisma;
    const profile = await prisma.workerProfile.update({
      where: { user_id: req.user.id },
      data: {
        skill_categories: JSON.stringify(skill_categories),
      }
    });

    res.json({ worker_profile: { ...profile, skill_categories: JSON.parse(profile.skill_categories) } });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /workers/me/earnings
 * Get wallet balance, total jobs, and payment history.
 */
router.get('/me/earnings', authenticate, roleGuard('worker'), async (req, res, next) => {
  try {
    const prisma = req.app.locals.prisma;
    const profile = await prisma.workerProfile.findUnique({
      where: { user_id: req.user.id }
    });

    // Get payment history for this worker's completed bookings
    const completedBookings = await prisma.booking.findMany({
      where: {
        assigned_worker_id: req.user.id,
        status: 'completed',
      },
      include: {
        payment: true,
        category: true,
      },
      orderBy: { created_at: 'desc' },
      take: 50,
    });

    const history = completedBookings.map(b => ({
      booking_id: b.id,
      category: b.category.name,
      price: b.price,
      worker_payout: b.payment?.worker_payout || 0,
      completed_at: b.created_at,
    }));

    res.json({
      wallet_balance: profile?.wallet_balance || 0,
      total_jobs_completed: profile?.total_jobs_completed || 0,
      history,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /workers/me/match-explanation/:offerId
 * Transparency endpoint — returns the breakdown of scores for a specific match offer.
 */
router.get('/me/match-explanation/:offerId', authenticate, roleGuard('worker'), async (req, res, next) => {
  try {
    const prisma = req.app.locals.prisma;
    const offer = await prisma.matchOffer.findUnique({
      where: { id: req.params.offerId },
      include: {
        booking: {
          include: { category: true }
        }
      }
    });

    if (!offer) {
      return res.status(404).json({ error: 'Match offer not found' });
    }

    // Only the offered worker can see their own scores
    if (offer.worker_id !== req.user.id) {
      return res.status(403).json({ error: 'You can only view your own match explanations' });
    }

    res.json({
      offer_id: offer.id,
      booking_id: offer.booking_id,
      category: offer.booking.category.name,
      proximity_score: offer.proximity_score,
      rating_score: offer.rating_score,
      fairness_score: offer.fairness_score,
      total_score: offer.total_score,
      offered_at: offer.offered_at,
      expires_at: offer.expires_at,
      response: offer.response,
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
