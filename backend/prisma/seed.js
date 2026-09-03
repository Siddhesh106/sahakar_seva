/**
 * SahakarSeva Seed Script
 * 
 * Creates demo data for a live walkthrough:
 * - 1 cooperative (Pune Cooperative Services)
 * - 8 service categories
 * - 15 demo workers spread around Pune (18.52°N, 73.86°E ± ~3km)
 * - 5 demo customers
 * - 1 coop admin
 * 
 * All demo users use phone numbers 9000000001–9000000021
 * OTP for all: 123456
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Pune city center
const PUNE_LAT = 18.5204;
const PUNE_LNG = 73.8567;

// Random offset within ~3km
function randomNear(base, range = 0.027) {
  return base + (Math.random() - 0.5) * 2 * range;
}

const SERVICE_CATEGORIES = [
  { name: 'cleaning', base_price: 300, unit: 'per_job', icon: '🧹' },
  { name: 'plumbing', base_price: 400, unit: 'per_job', icon: '🔧' },
  { name: 'electrical', base_price: 350, unit: 'per_job', icon: '⚡' },
  { name: 'tutoring', base_price: 500, unit: 'per_hour', icon: '📚' },
  { name: 'elder_care', base_price: 450, unit: 'per_hour', icon: '👴' },
  { name: 'cooking', base_price: 350, unit: 'per_job', icon: '🍳' },
  { name: 'gardening', base_price: 250, unit: 'per_job', icon: '🌿' },
  { name: 'event_help', base_price: 600, unit: 'per_job', icon: '🎪' },
];

const WORKER_NAMES = [
  'Rajesh Kumar', 'Priya Sharma', 'Amit Patil', 'Sunita Devi',
  'Vikram Singh', 'Meera Joshi', 'Ramesh Yadav', 'Kavita Pawar',
  'Suresh Kulkarni', 'Anjali Deshmukh', 'Ganesh Bhosale', 'Rekha More',
  'Prakash Gaikwad', 'Neha Thorat', 'Sanjay Nikam',
];

const WORKER_SKILLS = [
  ['cleaning', 'cooking'],
  ['plumbing', 'electrical'],
  ['electrical', 'plumbing'],
  ['elder_care', 'cooking'],
  ['plumbing', 'gardening'],
  ['tutoring', 'event_help'],
  ['cleaning', 'gardening'],
  ['cooking', 'elder_care'],
  ['electrical', 'event_help'],
  ['tutoring', 'cleaning'],
  ['plumbing', 'cleaning', 'electrical'],
  ['cooking', 'cleaning'],
  ['gardening', 'event_help', 'cleaning'],
  ['elder_care', 'tutoring'],
  ['electrical', 'plumbing', 'gardening'],
];

const CUSTOMER_NAMES = [
  'Amit Jain', 'Sneha Reddy', 'Rahul Mehta', 'Pooja Gupta', 'Karan Shah',
];

async function main() {
  console.log('🌱 Seeding SahakarSeva database...\n');

  // 1. Create cooperative
  const coop = await prisma.cooperative.upsert({
    where: { id: 'coop-pune-001' },
    update: {},
    create: {
      id: 'coop-pune-001',
      name: 'Pune Cooperative Services',
      region: 'Pune',
      registration_number: 'MH/REG/COOP/2024/12345',
      fee_percentage: 8.5,
      weight_proximity: 0.4,
      weight_rating: 0.3,
      weight_fairness: 0.3,
      fairness_cap_hours: 72,
      max_radius_km: 5.0,
    }
  });
  console.log(`✅ Cooperative: ${coop.name}`);

  // 2. Create service categories
  for (const cat of SERVICE_CATEGORIES) {
    await prisma.serviceCategory.upsert({
      where: { name: cat.name },
      update: { base_price: cat.base_price, unit: cat.unit, icon: cat.icon },
      create: cat,
    });
  }
  console.log(`✅ Service categories: ${SERVICE_CATEGORIES.length}`);

  // 3. Create workers (phone: 9000000011–9000000025)
  for (let i = 0; i < WORKER_NAMES.length; i++) {
    const phone = `900000001${(i + 1).toString().padStart(1, '0')}`;
    const phoneNum = `90000000${(11 + i).toString()}`;

    const user = await prisma.user.upsert({
      where: { phone: phoneNum },
      update: { name: WORKER_NAMES[i] },
      create: {
        phone: phoneNum,
        name: WORKER_NAMES[i],
        role: 'worker',
        language_pref: i % 3 === 0 ? 'hi' : i % 3 === 1 ? 'mr' : 'en',
      }
    });

    // Vary ratings and idle times for realistic demo
    let ratingAvg = 3.5 + Math.random() * 1.5; // 3.5–5.0
    let hoursAgo = Math.random() * 96; // 0–96 hours ago
    let workerLat = randomNear(PUNE_LAT);
    let workerLng = randomNear(PUNE_LNG);

    // Explicit Fair-Match Demonstration Workers:
    if (i === 1) {
      // Worker 2 (Priya Sharma): Close by (0.1km), 4.9 rating, but just completed a job 2 hours ago (Low Fairness)
      ratingAvg = 4.9;
      hoursAgo = 2.0;
      workerLat = 18.5210;
      workerLng = 73.8570;
    } else if (i === 2) {
      // Worker 3 (Amit Patil): Slightly farther (1.0km), 4.8 rating, but idle 65 hours (High Fairness Priority!)
      ratingAvg = 4.8;
      hoursAgo = 65.0;
      workerLat = 18.5280;
      workerLng = 73.8610;
    }

    const lastJob = new Date(Date.now() - hoursAgo * 60 * 60 * 1000);
    const jobsCompleted = Math.floor(Math.random() * 50) + 5;

    await prisma.workerProfile.upsert({
      where: { user_id: user.id },
      update: {
        skill_categories: JSON.stringify(WORKER_SKILLS[i]),
        rating_avg: Math.round(ratingAvg * 100) / 100,
        total_jobs_completed: jobsCompleted,
        availability_status: i < 12 ? 'online' : 'offline', // 12 online, 3 offline
        current_lat: workerLat,
        current_lng: workerLng,
        kyc_status: i < 13 ? 'verified' : 'pending', // 13 verified, 2 pending
        last_job_completed_at: lastJob,
      },
      create: {
        user_id: user.id,
        cooperative_id: coop.id,
        skill_categories: JSON.stringify(WORKER_SKILLS[i]),
        rating_avg: Math.round(ratingAvg * 100) / 100,
        total_jobs_completed: jobsCompleted,
        wallet_balance: Math.round(Math.random() * 5000 * 100) / 100,
        availability_status: i < 12 ? 'online' : 'offline',
        current_lat: randomNear(PUNE_LAT),
        current_lng: randomNear(PUNE_LNG),
        kyc_status: i < 13 ? 'verified' : 'pending',
        last_job_completed_at: lastJob,
      }
    });

    console.log(`  👷 ${WORKER_NAMES[i]} (${phoneNum}) — ${WORKER_SKILLS[i].join(', ')} — ${i < 12 ? '🟢 online' : '⚫ offline'} — KYC: ${i < 13 ? '✅' : '⏳'}`);
  }
  console.log(`✅ Workers: ${WORKER_NAMES.length}`);

  // 4. Create customers (phone: 9000000001–9000000005)
  for (let i = 0; i < CUSTOMER_NAMES.length; i++) {
    const phoneNum = `900000000${i + 1}`;

    const user = await prisma.user.upsert({
      where: { phone: phoneNum },
      update: { name: CUSTOMER_NAMES[i] },
      create: {
        phone: phoneNum,
        name: CUSTOMER_NAMES[i],
        role: 'customer',
        language_pref: 'en',
      }
    });

    const savedAddresses = JSON.stringify([
      {
        label: 'Home',
        lat: randomNear(PUNE_LAT),
        lng: randomNear(PUNE_LNG),
        address_text: `${Math.floor(Math.random() * 100) + 1} MG Road, Pune`,
      },
      {
        label: 'Office',
        lat: randomNear(PUNE_LAT),
        lng: randomNear(PUNE_LNG),
        address_text: `${Math.floor(Math.random() * 100) + 1} FC Road, Pune`,
      }
    ]);

    await prisma.customerProfile.upsert({
      where: { user_id: user.id },
      update: { saved_addresses: savedAddresses },
      create: {
        user_id: user.id,
        saved_addresses: savedAddresses,
      }
    });

    console.log(`  🧑 ${CUSTOMER_NAMES[i]} (${phoneNum})`);
  }
  console.log(`✅ Customers: ${CUSTOMER_NAMES.length}`);

  // 5. Create coop admin (phone: 9000000099)
  const adminUser = await prisma.user.upsert({
    where: { phone: '9000000099' },
    update: { name: 'Admin Desai' },
    create: {
      phone: '9000000099',
      name: 'Admin Desai',
      role: 'coop_admin',
      language_pref: 'en',
    }
  });
  console.log(`✅ Coop Admin: Admin Desai (9000000099)`);

  // 6. Create a sample profit-share ledger entry
  await prisma.profitShareLedger.upsert({
    where: { id: 'ledger-demo-001' },
    update: {},
    create: {
      id: 'ledger-demo-001',
      cooperative_id: coop.id,
      period_label: '2026-Q3',
      total_surplus: 15750.00,
      distributed_at: new Date('2026-07-01'),
    }
  });
  console.log(`✅ Profit-share ledger: 1 demo entry`);

  console.log('\n🎉 Seed complete!');
  console.log('\n📋 Demo Credentials:');
  console.log('   Customers:  9000000001 – 9000000005  (OTP: 123456)');
  console.log('   Workers:    9000000011 – 9000000025  (OTP: 123456)');
  console.log('   Admin:      9000000099               (OTP: 123456)');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('Seed error:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
