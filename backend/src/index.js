require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const workerRoutes = require('./routes/workers');
const bookingRoutes = require('./routes/bookings');
const matchRoutes = require('./routes/match');
const paymentRoutes = require('./routes/payments');
const ratingRoutes = require('./routes/ratings');
const disputeRoutes = require('./routes/disputes');
const coopRoutes = require('./routes/coop');
const socialSecurityRoutes = require('./routes/socialSecurity');
const whatsappRoutes = require('./routes/whatsapp');
const { startOfferExpiryChecker } = require('./services/matchEngine');

const app = express();
const prisma = new PrismaClient();

// Make prisma available to all routes
app.locals.prisma = prisma;

// Middleware
app.use(cors());
app.use(express.json());

// Request logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.path}`);
  next();
});

// Health check
app.get('/api/v1/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/workers', workerRoutes);
app.use('/api/v1/bookings', bookingRoutes);
app.use('/api/v1/match', matchRoutes);
app.use('/api/v1/payments', paymentRoutes);
app.use('/api/v1/ratings', ratingRoutes);
app.use('/api/v1/disputes', disputeRoutes);
app.use('/api/v1/coop', coopRoutes);
app.use('/api/v1/social-security', socialSecurityRoutes);
app.use('/api/v1/whatsapp', whatsappRoutes);

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: `Route ${req.method} ${req.path} not found` });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`\n🚀 SahakarSeva API running on http://localhost:${PORT}`);
  console.log(`📋 Health check: http://localhost:${PORT}/api/v1/health\n`);

  // Start background job: check for expired match offers every 10s
  startOfferExpiryChecker(prisma);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  await prisma.$disconnect();
  process.exit(0);
});
