const express = require('express');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const router = express.Router();

// In-memory OTP store (mock — in production, use Redis + real SMS provider)
const otpStore = new Map();

/**
 * POST /auth/otp/request (public)
 * Send OTP to phone number (mock: stores a fixed OTP)
 */
router.post('/otp/request', async (req, res, next) => {
  try {
    const { phone } = req.body;
    if (!phone) {
      return res.status(400).json({ error: 'Phone number is required' });
    }

    const otp = process.env.MOCK_OTP || '123456';
    otpStore.set(phone, { otp, expiresAt: Date.now() + 5 * 60 * 1000 }); // 5 min expiry

    console.log(`📱 OTP for ${phone}: ${otp} (mock mode)`);
    res.json({ success: true, message: 'OTP sent successfully' });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /auth/otp/verify (public)
 * Verify OTP and return JWT token. Creates user if first login.
 */
router.post('/otp/verify', async (req, res, next) => {
  try {
    const { phone, otp } = req.body;
    if (!phone || !otp) {
      return res.status(400).json({ error: 'Phone and OTP are required' });
    }

    // Mock OTP verification — accept the configured mock OTP or any stored OTP
    const stored = otpStore.get(phone);
    const mockOtp = process.env.MOCK_OTP || '123456';

    if (otp !== mockOtp && (!stored || stored.otp !== otp || Date.now() > stored.expiresAt)) {
      return res.status(401).json({ error: 'Invalid or expired OTP' });
    }

    // Clean up used OTP
    otpStore.delete(phone);

    const prisma = req.app.locals.prisma;

    // Find or create user
    let user = await prisma.user.findUnique({
      where: { phone },
      include: { worker_profile: true, customer_profile: true }
    });
    let isNewUser = false;

    if (!user) {
      // Create a placeholder user — they'll complete registration via /auth/register
      user = await prisma.user.create({
        data: {
          phone,
          name: '',
          role: 'customer', // default, can be changed during registration
        },
        include: { worker_profile: true, customer_profile: true }
      });
      isNewUser = true;
    }

    // Issue JWT
    const token = jwt.sign(
      { id: user.id, phone: user.phone, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.json({ token, user, isNewUser });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /auth/register
 * Complete registration after OTP verification (sets name, role, language).
 * Requires JWT from /otp/verify.
 */
router.post('/register', async (req, res, next) => {
  try {
    const { authenticate } = require('../middleware/auth');
    // Inline auth check for this route
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Missing Authorization header' });
    }
    const token = authHeader.split(' ')[1];
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (e) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    const { name, role, language_pref } = req.body;
    if (!name || !role) {
      return res.status(400).json({ error: 'Name and role are required' });
    }

    const validRoles = ['customer', 'worker', 'coop_admin'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ error: `Invalid role. Must be one of: ${validRoles.join(', ')}` });
    }

    const prisma = req.app.locals.prisma;

    // Update the user record
    const user = await prisma.user.update({
      where: { id: decoded.id },
      data: {
        name,
        role,
        language_pref: language_pref || 'en',
      }
    });

    // Create role-specific profile
    if (role === 'worker') {
      // Find the first cooperative (for demo, auto-assign)
      const coop = await prisma.cooperative.findFirst();
      if (coop) {
        await prisma.workerProfile.upsert({
          where: { user_id: user.id },
          update: {},
          create: {
            user_id: user.id,
            cooperative_id: coop.id,
          }
        });
      }
    } else if (role === 'customer') {
      await prisma.customerProfile.upsert({
        where: { user_id: user.id },
        update: {},
        create: {
          user_id: user.id,
        }
      });
    }

    // Re-issue token with updated role
    const newToken = jwt.sign(
      { id: user.id, phone: user.phone, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.json({ token: newToken, user });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
