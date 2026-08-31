const express = require('express');
const { authenticate } = require('../middleware/auth');
const { findAndOffer } = require('../services/matchEngine');
const router = express.Router();

/**
 * POST /bookings
 * Create a new booking and trigger the match engine.
 */
router.post('/', authenticate, async (req, res, next) => {
  try {
    const { category_id, address_text, lat, lng, scheduled_time, notes } = req.body;

    if (!category_id || !address_text || lat == null || lng == null || !scheduled_time) {
      return res.status(400).json({
        error: 'category_id, address_text, lat, lng, and scheduled_time are required'
      });
    }

    const prisma = req.app.locals.prisma;

    // Get category for pricing
    const category = await prisma.serviceCategory.findUnique({
      where: { id: category_id }
    });

    if (!category) {
      return res.status(404).json({ error: 'Service category not found' });
    }

    // Create the booking
    const booking = await prisma.booking.create({
      data: {
        customer_id: req.user.id,
        category_id,
        address_text,
        lat,
        lng,
        scheduled_time: new Date(scheduled_time),
        notes: notes || null,
        price: category.base_price,
        status: 'requested',
      },
      include: { category: true }
    });

    console.log(`📋 Booking created: ${booking.id} for ${category.name} at ${address_text}`);

    // Trigger match engine asynchronously (don't block the response)
    setImmediate(async () => {
      try {
        await findAndOffer(prisma, booking.id);
      } catch (err) {
        console.error('Match engine error:', err);
      }
    });

    res.status(201).json({ booking });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /bookings/:id
 * Get a specific booking with related data.
 */
router.get('/:id', authenticate, async (req, res, next) => {
  try {
    const prisma = req.app.locals.prisma;
    const booking = await prisma.booking.findUnique({
      where: { id: req.params.id },
      include: {
        category: true,
        customer: { select: { id: true, name: true, phone: true } },
        assigned_worker: {
          select: {
            id: true, name: true, phone: true,
            worker_profile: {
              select: { rating_avg: true, total_jobs_completed: true }
            }
          }
        },
        match_offers: {
          select: {
            id: true, worker_id: true, total_score: true,
            response: true, offered_at: true, expires_at: true
          },
          orderBy: { offered_at: 'desc' }
        },
        payment: true,
      }
    });

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    // Verify the user has access (customer, assigned worker, or admin)
    if (booking.customer_id !== req.user.id &&
        booking.assigned_worker_id !== req.user.id &&
        req.user.role !== 'coop_admin') {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json({ booking });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /bookings
 * List bookings filtered by role and status.
 */
router.get('/', authenticate, async (req, res, next) => {
  try {
    const { role, status } = req.query;
    const prisma = req.app.locals.prisma;

    const where = {};

    if (role === 'customer' || req.user.role === 'customer') {
      where.customer_id = req.user.id;
    } else if (role === 'worker' || req.user.role === 'worker') {
      where.assigned_worker_id = req.user.id;
    }
    // coop_admin can see all bookings

    if (status) {
      where.status = status;
    }

    const bookings = await prisma.booking.findMany({
      where,
      include: {
        category: true,
        customer: { select: { id: true, name: true, phone: true } },
        assigned_worker: {
          select: {
            id: true, name: true, phone: true,
            worker_profile: {
              select: { rating_avg: true }
            }
          }
        },
      },
      orderBy: { created_at: 'desc' },
      take: 100,
    });

    res.json({ bookings });
  } catch (err) {
    next(err);
  }
});

/**
 * PUT /bookings/:id/status
 * Update booking status (worker marks start/complete, customer cancels).
 */
router.put('/:id/status', authenticate, async (req, res, next) => {
  try {
    const { status } = req.body;
    const validTransitions = {
      'assigned': ['in_progress', 'cancelled'],
      'in_progress': ['completed', 'disputed'],
      'requested': ['cancelled'],
      'matching': ['cancelled'],
    };

    const prisma = req.app.locals.prisma;
    const booking = await prisma.booking.findUnique({
      where: { id: req.params.id }
    });

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    const allowed = validTransitions[booking.status] || [];
    if (!allowed.includes(status)) {
      return res.status(400).json({
        error: `Cannot transition from '${booking.status}' to '${status}'. Allowed: ${allowed.join(', ')}`
      });
    }

    const updateData = { status };

    // If completing a job, update worker stats
    if (status === 'completed' && booking.assigned_worker_id) {
      await prisma.workerProfile.update({
        where: { user_id: booking.assigned_worker_id },
        data: {
          total_jobs_completed: { increment: 1 },
          last_job_completed_at: new Date(),
        }
      });
    }

    const updated = await prisma.booking.update({
      where: { id: req.params.id },
      data: updateData,
      include: { category: true }
    });

    res.json({ booking: updated });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
