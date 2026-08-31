const express = require('express');
const { authenticate } = require('../middleware/auth');
const router = express.Router();

/**
 * POST /ratings
 * Submit a rating for a completed booking.
 * Recalculates the worker's rating_avg.
 */
router.post('/', authenticate, async (req, res, next) => {
  try {
    const { booking_id, to_user_id, stars, comment } = req.body;

    if (!booking_id || !to_user_id || !stars) {
      return res.status(400).json({ error: 'booking_id, to_user_id, and stars are required' });
    }

    if (stars < 1 || stars > 5) {
      return res.status(400).json({ error: 'Stars must be between 1 and 5' });
    }

    const prisma = req.app.locals.prisma;

    // Verify the booking exists and is completed
    const booking = await prisma.booking.findUnique({
      where: { id: booking_id }
    });

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    if (booking.status !== 'completed') {
      return res.status(400).json({ error: 'Can only rate completed bookings' });
    }

    // Check for duplicate rating
    const existing = await prisma.rating.findFirst({
      where: {
        booking_id,
        from_user_id: req.user.id,
        to_user_id,
      }
    });

    if (existing) {
      return res.status(400).json({ error: 'You have already rated this booking' });
    }

    // Create the rating
    const rating = await prisma.rating.create({
      data: {
        booking_id,
        from_user_id: req.user.id,
        to_user_id,
        stars,
        comment: comment || null,
      }
    });

    // Recalculate worker's rating_avg if the rated user is a worker
    const ratedUser = await prisma.user.findUnique({
      where: { id: to_user_id }
    });

    if (ratedUser && ratedUser.role === 'worker') {
      const allRatings = await prisma.rating.findMany({
        where: { to_user_id }
      });

      const avg = allRatings.reduce((sum, r) => sum + r.stars, 0) / allRatings.length;

      await prisma.workerProfile.update({
        where: { user_id: to_user_id },
        data: { rating_avg: Math.round(avg * 100) / 100 }
      });

      console.log(`⭐ Worker ${to_user_id} rating updated: ${Math.round(avg * 100) / 100} (${allRatings.length} ratings)`);
    }

    res.status(201).json({ rating });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /ratings/received
 * Get all ratings received by the authenticated user.
 */
router.get('/received', authenticate, async (req, res, next) => {
  try {
    const prisma = req.app.locals.prisma;
    const ratings = await prisma.rating.findMany({
      where: { to_user_id: req.user.id },
      include: {
        from_user: { select: { id: true, name: true } },
        booking: { include: { category: true } },
      },
      orderBy: { created_at: 'desc' },
    });

    res.json({ ratings });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
