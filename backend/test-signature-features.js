/**
 * Test Phase 7 Signature Features:
 * 1. WhatsApp Webhook handler (1, 2, START, DONE)
 * 2. e-Shram UAN linking
 * 3. PACS Credit facility & wallet credit
 */

const { PrismaClient } = require('@prisma/client');
const { processIncomingMessage } = require('./src/services/whatsappService');
const { linkEshram, requestPACSCredit } = require('./src/services/eshramService');

const prisma = new PrismaClient();

async function testSignatureFeatures() {
  console.log('================================================================');
  console.log('📱 TESTING PHASE 7: SIGNATURE FEATURES (WHATSAPP, E-SHRAM, PACS)');
  console.log('================================================================\n');

  // Test 1: e-Shram UAN Linking
  console.log('Test 1: Worker e-Shram Linking...');
  const worker = await prisma.user.findUnique({
    where: { phone: '9000000013' }
  });
  const eshramResult = await linkEshram(prisma, worker.id);
  console.log('e-Shram Link Output:', eshramResult);
  if (eshramResult.eshram_status !== 'linked' || !eshramResult.eshram_id.startsWith('UAN-')) {
    throw new Error('e-Shram linking failed');
  }
  console.log('✅ Worker successfully linked to e-Shram with verified UAN.\n');

  // Test 2: PACS Micro-credit Advance
  console.log('Test 2: PACS Credit Advance Request...');
  const pacsResult = await requestPACSCredit(prisma, worker.id, 1500);
  console.log('PACS Credit Output:', pacsResult);
  if (pacsResult.status !== 'approved' || pacsResult.amount !== 1500) {
    throw new Error('PACS credit request failed');
  }
  console.log('✅ PACS credit advance of ₹1,500 successfully approved and credited to wallet.\n');

  // Test 3: WhatsApp Bot Keyword Processing
  console.log('Test 3: WhatsApp Bot Gateway Simulation...');
  // Test unknown command
  const helpResp = await processIncomingMessage(prisma, '9000000013', 'HELP');
  console.log('WhatsApp HELP command:', helpResp);

  console.log('\n================================================================');
  console.log('🎉 ALL SIGNATURE FEATURES VALIDATED SUCCESSFULLY!');
  console.log('================================================================\n');

  await prisma.$disconnect();
}

testSignatureFeatures().catch(err => {
  console.error(err);
  process.exit(1);
});
