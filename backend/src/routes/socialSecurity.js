const express = require('express');
const { authenticate } = require('../middleware/auth');
const { roleGuard } = require('../middleware/roleGuard');
const { linkEshram, requestPACSCredit } = require('../services/eshramService');
const router = express.Router();

/**
 * POST /social-security/eshram-link
 * Link a worker to the e-Shram portal.
 */
router.post('/eshram-link', authenticate, roleGuard('worker'), async (req, res, next) => {
  try {
    const prisma = req.app.locals.prisma;
    const result = await linkEshram(prisma, req.user.id);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

/**
 * POST /social-security/pacs-credit-request
 * Request a PACS credit advance against earnings.
 */
router.post('/pacs-credit-request', authenticate, roleGuard('worker'), async (req, res, next) => {
  try {
    const { amount } = req.body;
    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'A positive amount is required' });
    }

    const prisma = req.app.locals.prisma;
    const result = await requestPACSCredit(prisma, req.user.id, amount);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

/**
 * GET /social-security/status
 * Get current social security link status for the authenticated worker.
 */
router.get('/status', authenticate, roleGuard('worker'), async (req, res, next) => {
  try {
    const prisma = req.app.locals.prisma;
    let link = await prisma.socialSecurityLink.findUnique({
      where: { worker_id: req.user.id }
    });

    if (!link) {
      link = {
        eshram_status: 'not_linked',
        eshram_id: null,
        pacs_id: null,
        credit_limit: null,
      };
    }

    res.json({ social_security: link });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
