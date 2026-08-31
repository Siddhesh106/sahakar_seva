/**
 * Mock Payment Service
 * 
 * Generates realistic UPI intent URLs and simulates webhook callbacks.
 * Integration point is clearly marked for swapping in Razorpay/Cashfree.
 */

const { v4: uuidv4 } = require('uuid');

/**
 * Generate a UPI intent URL for payment.
 * In production: call Razorpay/Cashfree to create a payment link.
 */
function generateUPIIntent(amount, bookingId, merchantName = 'SahakarSeva') {
  const txnId = `TXN${Date.now()}${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
  const upiUrl = `upi://pay?pa=sahakarseva@upi&pn=${encodeURIComponent(merchantName)}&am=${amount}&tn=Booking_${bookingId}&tr=${txnId}`;

  return {
    upi_intent_url: upiUrl,
    upi_txn_id: txnId,
  };
}

/**
 * Compute the fee split for a payment.
 * platform_fee = amount * cooperative.fee_percentage / 100
 * worker_payout = amount - platform_fee
 */
function computeFeeSplit(amount, feePercentage) {
  const platformFee = Math.round(amount * feePercentage) / 100;
  const workerPayout = amount - platformFee;
  return {
    platform_fee: Math.round(platformFee * 100) / 100,
    worker_payout: Math.round(workerPayout * 100) / 100,
  };
}

/**
 * Process a successful payment:
 * 1. Update payment status
 * 2. Credit worker's wallet
 * 3. Return updated payment
 */
async function processPaymentSuccess(prisma, paymentId) {
  const payment = await prisma.payment.findUnique({
    where: { id: paymentId },
    include: {
      booking: {
        include: {
          assigned_worker: {
            include: { worker_profile: true }
          }
        }
      }
    }
  });

  if (!payment) throw new Error('Payment not found');
  if (payment.status === 'success') return payment; // idempotent

  // Update payment status
  const updatedPayment = await prisma.payment.update({
    where: { id: paymentId },
    data: {
      status: 'success',
      upi_txn_id: payment.upi_txn_id || `MOCK_${uuidv4()}`,
    }
  });

  // Credit worker's wallet
  if (payment.booking.assigned_worker_id) {
    await prisma.workerProfile.update({
      where: { user_id: payment.booking.assigned_worker_id },
      data: {
        wallet_balance: {
          increment: payment.worker_payout,
        }
      }
    });
    console.log(`💰 Credited ₹${payment.worker_payout} to worker ${payment.booking.assigned_worker_id}`);
  }

  return updatedPayment;
}

module.exports = {
  generateUPIIntent,
  computeFeeSplit,
  processPaymentSuccess,
};
