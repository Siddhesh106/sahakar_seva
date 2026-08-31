const express = require('express');
const { authenticate } = require('../middleware/auth');
const router = express.Router();

/**
 * GET /users/me
 * Returns the authenticated user's full profile.
 */
router.get('/me', authenticate, async (req, res, next) => {
  try {
    const prisma = req.app.locals.prisma;
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: {
        worker_profile: {
          include: { cooperative: true }
        },
        customer_profile: true,
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user });
  } catch (err) {
    next(err);
  }
});

/**
 * PUT /users/me
 * Update user profile (name, language_pref).
 */
router.put('/me', authenticate, async (req, res, next) => {
  try {
    const { name, language_pref } = req.body;
    const prisma = req.app.locals.prisma;

    const user = await prisma.user.update({
      where: { id: req.user.id },
      data: {
        ...(name && { name }),
        ...(language_pref && { language_pref }),
      }
    });

    res.json({ user });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
