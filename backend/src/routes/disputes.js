const express = require('express');
const { authenticate } = require('../middleware/auth');
const { roleGuard } = require('../middleware/roleGuard');
const router = express.Router();

/**
 * POST /disputes
 * Raise a dispute on a booking.
 */
router.post('/', authenticate, async (req, res, next) => {
  try {
    const { booking_id, reason } = req.body;
    if (!booking_id || !reason) {
      return res.status(400).json({ error: 'booking_id and reason are required' });
    }

    const prisma = req.app.locals.prisma;

    const booking = await prisma.booking.findUnique({
      where: { id: booking_id }
    });

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    // Update booking status to disputed
    await prisma.booking.update({
      where: { id: booking_id },
      data: { status: 'disputed' }
    });

    const dispute = await prisma.dispute.create({
      data: {
        booking_id,
        raised_by: req.user.id,
        reason,
        status: 'open',
      }
    });

    res.status(201).json({ dispute });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /disputes
 * List disputes (coop_admin sees all, others see their own).
 */
router.get('/', authenticate, async (req, res, next) => {
  try {
    const prisma = req.app.locals.prisma;
    const where = req.user.role === 'coop_admin' ? {} : { raised_by: req.user.id };

    if (req.query.status) {
      where.status = req.query.status;
    }

    const disputes = await prisma.dispute.findMany({
      where,
      include: {
        booking: {
          include: {
            category: true,
            customer: { select: { id: true, name: true, phone: true } },
            assigned_worker: { select: { id: true, name: true, phone: true } },
          }
        },
        raiser: { select: { id: true, name: true, role: true } },
      },
      orderBy: { created_at: 'desc' },
    });

    res.json({ disputes });
  } catch (err) {
    next(err);
  }
});

/**
 * PUT /disputes/:id/resolve (coop_admin only)
 * Resolve a dispute with notes.
 */
router.put('/:id/resolve', authenticate, roleGuard('coop_admin'), async (req, res, next) => {
  try {
    const { resolution_notes } = req.body;
    if (!resolution_notes) {
      return res.status(400).json({ error: 'resolution_notes is required' });
    }

    const prisma = req.app.locals.prisma;

    const dispute = await prisma.dispute.update({
      where: { id: req.params.id },
      data: {
        status: 'resolved',
        resolution_notes,
      },
      include: {
        booking: true,
      }
    });

    // Optionally update booking status back from 'disputed' to 'completed'
    if (dispute.booking) {
      await prisma.booking.update({
        where: { id: dispute.booking_id },
        data: { status: 'completed' }
      });
    }

    res.json({ dispute });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
