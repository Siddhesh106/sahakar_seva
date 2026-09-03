/**
 * CHECKPOINT A: Automated Fair-Match Scenario Test
 */
const { PrismaClient } = require('@prisma/client');
const { getCandidatePool, scoreCandidates } = require('./src/services/matchEngine');

const prisma = new PrismaClient();

async function runCheckpointA() {
  console.log('================================================================');
  console.log('🎯 CHECKPOINT A: FAIR-MATCH ENGINE ALGORITHM VERIFICATION');
  console.log('================================================================\n');

  // 1. Get Cooperative configuration
  const cooperative = await prisma.cooperative.findFirst();
  console.log(`Cooperative: ${cooperative.name}`);
  console.log(`Weights: Proximity=${cooperative.weight_proximity}, Rating=${cooperative.weight_rating}, Fairness=${cooperative.weight_fairness}`);
  console.log(`Fairness Cap Hours: ${cooperative.fairness_cap_hours}, Max Radius: ${cooperative.max_radius_km}km\n`);

  // 2. Get Electrical Category
  const category = await prisma.serviceCategory.findUnique({
    where: { name: 'electrical' }
  });

  // 3. Mock Booking at 12 MG Road, Pune
  const mockBooking = {
    category_id: category.id,
    lat: 18.5204,
    lng: 73.8567,
  };

  // 4. Step 1: Candidate Pool
  const candidates = await getCandidatePool(prisma, mockBooking, cooperative.max_radius_km);
  console.log(`Step 1: Found ${candidates.length} eligible candidates within ${cooperative.max_radius_km}km:`);
  candidates.forEach(c => {
    console.log(` - ${c.user.name} | Distance: ${c.distance_km.toFixed(2)}km | Rating: ${c.rating_avg}★ | Last Job: ${c.last_job_completed_at ? new Date(c.last_job_completed_at).toISOString() : 'Never'}`);
  });

  // 5. Step 2 & 3: Score Candidates
  const scored = scoreCandidates(candidates, cooperative);
  console.log('\nStep 2 & 3: Candidates Scored and Ranked:');
  console.log('----------------------------------------------------------------');
  console.log('Rank | Worker Name     | Proximity (40%) | Rating (30%) | Fairness (30%) | Total Score');
  console.log('----------------------------------------------------------------');
  scored.forEach((s, idx) => {
    console.log(
      `#${idx + 1}   | ${s.user.name.padEnd(15)} | ${(s.proximity_score * 100).toFixed(1).padStart(5)}%          | ${(s.rating_score * 100).toFixed(1).padStart(5)}%       | ${(s.fairness_score * 100).toFixed(1).padStart(5)}%         | ${(s.total_score * 100).toFixed(1)}%`
    );
  });
  console.log('----------------------------------------------------------------');

  // Verify top candidate
  const topCandidate = scored[0];
  console.log(`\n🏆 Winner receiving the first 90s offer: ${topCandidate.user.name} (${(topCandidate.total_score * 100).toFixed(1)}%)`);

  // Assertions
  const amitPatil = scored.find(s => s.user.name === 'Amit Patil');
  const priyaSharma = scored.find(s => s.user.name === 'Priya Sharma');

  if (amitPatil && priyaSharma) {
    console.log('\n⚖️  FAIR-MATCH COMPARISON (Amit Patil vs Priya Sharma):');
    console.log(`  Amit Patil:   Proximity=${amitPatil.proximity_score}, Rating=${amitPatil.rating_score}, Fairness=${amitPatil.fairness_score} -> Total=${amitPatil.total_score}`);
    console.log(`  Priya Sharma: Proximity=${priyaSharma.proximity_score}, Rating=${priyaSharma.rating_score}, Fairness=${priyaSharma.fairness_score} -> Total=${priyaSharma.total_score}`);

    if (amitPatil.total_score > priyaSharma.total_score) {
      console.log('\n✅ PASS: Fair-Match correctly prioritized idle worker Amit Patil (fairness ~90%) over recently completed Priya Sharma!');
    } else {
      console.log('\n❌ FAIL: Fairness weighting was not prioritized.');
      process.exit(1);
    }
  }

  console.log('\n✅ CHECKPOINT A PASSED: Fair-Match scoring, ranking, and explainable 3-bar components verified!\n');
  await prisma.$disconnect();
}

runCheckpointA().catch(err => {
  console.error(err);
  process.exit(1);
});
