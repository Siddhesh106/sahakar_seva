const express = require('express');
const { authenticate } = require('../middleware/auth');
const { acceptOffer, declineOffer } = require('../services/matchEngine');
const router = express.Router();

/**
 * POST /match/:offerId/accept
 * Worker accepts a match offer.
 */
router.post('/:offerId/accept', authenticate, async (req, res, next) => {
  try {
    const prisma = req.app.locals.prisma;

    // Verify the offer exists and belongs to this worker
    const offer = await prisma.matchOffer.findUnique({
      where: { id: req.params.offerId }
    });

    if (!offer) {
      return res.status(404).json({ error: 'Match offer not found' });
    }

    if (offer.worker_id !== req.user.id) {
      return res.status(403).json({ error: 'This offer is not for you' });
    }

    if (offer.response !== 'pending') {
      return res.status(400).json({ error: `Offer already ${offer.response}` });
    }

    if (new Date(offer.expires_at) < new Date()) {
      return res.status(400).json({ error: 'Offer has expired' });
    }

    const booking = await acceptOffer(prisma, offer.id, req.user.id);
    res.json({ booking });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /match/:offerId/decline
 * Worker declines a match offer — triggers cascade to next candidate.
 */
router.post('/:offerId/decline', authenticate, async (req, res, next) => {
  try {
    const prisma = req.app.locals.prisma;

    const offer = await prisma.matchOffer.findUnique({
      where: { id: req.params.offerId }
    });

    if (!offer) {
      return res.status(404).json({ error: 'Match offer not found' });
    }

    if (offer.worker_id !== req.user.id) {
      return res.status(403).json({ error: 'This offer is not for you' });
    }

    if (offer.response !== 'pending') {
      return res.status(400).json({ error: `Offer already ${offer.response}` });
    }

    const result = await declineOffer(prisma, offer.id);
    res.json({ next_offer_triggered: result.nextOffer != null });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /match/pending
 * Get the current pending offer for this worker (for the worker app to poll).
 */
router.get('/pending', authenticate, async (req, res, next) => {
  try {
    const prisma = req.app.locals.prisma;

    const offer = await prisma.matchOffer.findFirst({
      where: {
        worker_id: req.user.id,
        response: 'pending',
        expires_at: { gt: new Date() }
      },
      include: {
        booking: {
          include: {
            category: true,
            customer: { select: { id: true, name: true, phone: true } }
          }
        }
      },
      orderBy: { offered_at: 'desc' }
    });

    res.json({ offer });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
