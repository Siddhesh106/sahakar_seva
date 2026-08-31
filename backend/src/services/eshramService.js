/**
 * Mock e-Shram Integration Service
 * 
 * In production: integrates with the e-Shram portal API for worker registration
 * and with PACS/e-PACS for credit facilities.
 * 
 * For demo: returns realistic response shapes.
 */

const { v4: uuidv4 } = require('uuid');

/**
 * Link a worker to the e-Shram portal.
 * Mock: generates a realistic e-Shram ID after a simulated "verification."
 */
async function linkEshram(prisma, workerId) {
  const existing = await prisma.socialSecurityLink.findUnique({
    where: { worker_id: workerId }
  });

  if (existing && existing.eshram_status === 'linked') {
    return { eshram_status: 'linked', eshram_id: existing.eshram_id };
  }

  // Generate a mock e-Shram UAN (Universal Account Number)
  const eshramId = `UAN-${Date.now().toString().slice(-10)}`;

  await prisma.socialSecurityLink.upsert({
    where: { worker_id: workerId },
    update: {
      eshram_id: eshramId,
      eshram_status: 'linked',
      linked_at: new Date(),
    },
    create: {
      worker_id: workerId,
      eshram_id: eshramId,
      eshram_status: 'linked',
      linked_at: new Date(),
    }
  });

  console.log(`🏛️ e-Shram linked for worker ${workerId}: ${eshramId}`);

  return { eshram_status: 'linked', eshram_id: eshramId };
}

/**
 * Request a PACS credit advance against earnings.
 * Mock: approves if amount <= credit_limit (or sets a default limit).
 */
async function requestPACSCredit(prisma, workerId, amount) {
  let link = await prisma.socialSecurityLink.findUnique({
    where: { worker_id: workerId }
  });

  if (!link) {
    // Create the link record
    link = await prisma.socialSecurityLink.create({
      data: {
        worker_id: workerId,
        pacs_id: `PACS-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
        credit_limit: 5000, // default credit limit for demo
      }
    });
  }

  if (!link.credit_limit) {
    // Set default credit limit
    link = await prisma.socialSecurityLink.update({
      where: { worker_id: workerId },
      data: {
        pacs_id: link.pacs_id || `PACS-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
        credit_limit: 5000,
      }
    });
  }

  const creditLimit = link.credit_limit || 5000;

  if (amount > creditLimit) {
    return {
      status: 'rejected',
      reason: `Amount ₹${amount} exceeds credit limit of ₹${creditLimit}`,
      credit_limit: creditLimit,
    };
  }

  // Mock approval: credit worker's wallet
  await prisma.workerProfile.update({
    where: { user_id: workerId },
    data: {
      wallet_balance: { increment: amount }
    }
  });

  // Reduce available credit
  await prisma.socialSecurityLink.update({
    where: { worker_id: workerId },
    data: {
      credit_limit: creditLimit - amount,
    }
  });

  console.log(`💳 PACS credit of ₹${amount} approved for worker ${workerId}`);

  return {
    status: 'approved',
    amount,
    credit_limit: creditLimit - amount,
    pacs_id: link.pacs_id,
  };
}

module.exports = {
  linkEshram,
  requestPACSCredit,
};
