const express = require('express');
const { authenticate } = require('../middleware/auth');
const { generateUPIIntent, computeFeeSplit, processPaymentSuccess } = require('../services/paymentService');
const router = express.Router();

/**
 * POST /payments/initiate
 * Create a payment record and return a UPI intent URL.
 */
router.post('/initiate', authenticate, async (req, res, next) => {
  try {
    const { booking_id } = req.body;
    if (!booking_id) {
      return res.status(400).json({ error: 'booking_id is required' });
    }

    const prisma = req.app.locals.prisma;

    const booking = await prisma.booking.findUnique({
      where: { id: booking_id },
      include: {
        assigned_worker: {
          include: {
            worker_profile: {
              include: { cooperative: true }
            }
          }
        }
      }
    });

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    if (booking.status !== 'completed') {
      return res.status(400).json({ error: 'Payment can only be initiated for completed bookings' });
    }

    // Check for existing payment
    const existingPayment = await prisma.payment.findUnique({
      where: { booking_id }
    });

    if (existingPayment) {
      if (existingPayment.status === 'success') {
        return res.status(400).json({ error: 'Payment already completed' });
      }
      // Return existing payment intent
      const upi = generateUPIIntent(existingPayment.amount, booking_id);
      return res.json({ upi_intent_url: upi.upi_intent_url, payment: existingPayment });
    }

    // Compute fee split
    const feePercentage = booking.assigned_worker?.worker_profile?.cooperative?.fee_percentage || 8.5;
    const { platform_fee, worker_payout } = computeFeeSplit(booking.price, feePercentage);

    // Generate UPI intent
    const { upi_intent_url, upi_txn_id } = generateUPIIntent(booking.price, booking_id);

    // Create payment record
    const payment = await prisma.payment.create({
      data: {
        booking_id,
        amount: booking.price,
        platform_fee,
        worker_payout,
        method: 'upi',
        upi_txn_id,
        status: 'initiated',
      }
    });

    res.json({ upi_intent_url, payment });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /payments/webhook (public, signed)
 * UPI provider callback — marks payment as success and credits worker wallet.
 * In mock mode: accepts any POST with {booking_id, status: "success"}.
 */
router.post('/webhook', async (req, res, next) => {
  try {
    const { booking_id, status, txn_id } = req.body;

    // In production: verify webhook signature from UPI provider
    // const signature = req.headers['x-webhook-signature'];
    // verifySignature(signature, req.body);

    const prisma = req.app.locals.prisma;

    const payment = await prisma.payment.findUnique({
      where: { booking_id }
    });

    if (!payment) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    if (status === 'success') {
      await processPaymentSuccess(prisma, payment.id);
      console.log(`✅ Payment webhook: booking ${booking_id} paid successfully`);
    } else if (status === 'failed') {
      await prisma.payment.update({
        where: { id: payment.id },
        data: { status: 'failed' }
      });
    }

    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /payments/:bookingId
 * Get payment details for a booking.
 */
router.get('/:bookingId', authenticate, async (req, res, next) => {
  try {
    const prisma = req.app.locals.prisma;
    const payment = await prisma.payment.findUnique({
      where: { booking_id: req.params.bookingId },
      include: {
        booking: {
          include: { category: true }
        }
      }
    });

    if (!payment) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    res.json({ payment });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
