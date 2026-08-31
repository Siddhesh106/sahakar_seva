const express = require('express');
const { authenticate } = require('../middleware/auth');
const { roleGuard } = require('../middleware/roleGuard');
const router = express.Router();

/**
 * GET /coop/:id/members
 * List all workers in a cooperative.
 */
router.get('/:id/members', authenticate, roleGuard('coop_admin'), async (req, res, next) => {
  try {
    const prisma = req.app.locals.prisma;

    const workers = await prisma.workerProfile.findMany({
      where: { cooperative_id: req.params.id },
      include: {
        user: { select: { id: true, name: true, phone: true, created_at: true } },
      },
      orderBy: { joined_at: 'desc' },
    });

    // Parse skill_categories for each worker
    const formatted = workers.map(w => ({
      ...w,
      skill_categories: JSON.parse(w.skill_categories || '[]'),
    }));

    res.json({ workers: formatted });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /coop/:id/verify-worker/:workerId
 * Approve or reject a worker's KYC.
 */
router.post('/:id/verify-worker/:workerId', authenticate, roleGuard('coop_admin'), async (req, res, next) => {
  try {
    const { kyc_status } = req.body;
    if (!kyc_status || !['verified', 'rejected'].includes(kyc_status)) {
      return res.status(400).json({ error: 'kyc_status must be "verified" or "rejected"' });
    }

    const prisma = req.app.locals.prisma;

    // Verify the worker belongs to this cooperative
    const worker = await prisma.workerProfile.findUnique({
      where: { user_id: req.params.workerId }
    });

    if (!worker || worker.cooperative_id !== req.params.id) {
      return res.status(404).json({ error: 'Worker not found in this cooperative' });
    }

    const updated = await prisma.workerProfile.update({
      where: { user_id: req.params.workerId },
      data: { kyc_status },
      include: {
        user: { select: { id: true, name: true, phone: true } },
      }
    });

    console.log(`📋 KYC ${kyc_status} for worker ${req.params.workerId}`);

    res.json({
      worker_profile: {
        ...updated,
        skill_categories: JSON.parse(updated.skill_categories || '[]'),
      }
    });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /coop/:id/profit-share
 * Get profit-share ledger for a cooperative.
 */
router.get('/:id/profit-share', authenticate, roleGuard('coop_admin'), async (req, res, next) => {
  try {
    const prisma = req.app.locals.prisma;

    // Get ledger entries
    const ledger = await prisma.profitShareLedger.findMany({
      where: { cooperative_id: req.params.id },
      orderBy: { period_label: 'desc' },
    });

    // Also compute current period stats
    const now = new Date();
    const currentQuarter = `${now.getFullYear()}-Q${Math.ceil((now.getMonth() + 1) / 3)}`;

    // Sum all platform fees from successful payments for workers in this coop
    const workers = await prisma.workerProfile.findMany({
      where: { cooperative_id: req.params.id },
      select: { user_id: true }
    });
    const workerIds = workers.map(w => w.user_id);

    const payments = await prisma.payment.findMany({
      where: {
        status: 'success',
        booking: {
          assigned_worker_id: { in: workerIds }
        }
      }
    });

    const totalFees = payments.reduce((sum, p) => sum + p.platform_fee, 0);

    res.json({
      ledger,
      current_period: {
        period_label: currentQuarter,
        total_surplus: Math.round(totalFees * 100) / 100,
        total_payments: payments.length,
      }
    });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /coop/:id/stats
 * Get overview stats for the admin dashboard.
 */
router.get('/:id/stats', authenticate, roleGuard('coop_admin'), async (req, res, next) => {
  try {
    const prisma = req.app.locals.prisma;

    const workers = await prisma.workerProfile.findMany({
      where: { cooperative_id: req.params.id }
    });

    const workerIds = workers.map(w => w.user_id);
    const activeWorkers = workers.filter(w => w.availability_status === 'online').length;

    const jobsInProgress = await prisma.booking.count({
      where: {
        assigned_worker_id: { in: workerIds },
        status: { in: ['assigned', 'in_progress'] }
      }
    });

    const openDisputes = await prisma.dispute.count({
      where: { status: 'open' }
    });

    const pendingKYC = workers.filter(w => w.kyc_status === 'pending').length;

    const totalJobsCompleted = await prisma.booking.count({
      where: {
        assigned_worker_id: { in: workerIds },
        status: 'completed'
      }
    });

    res.json({
      active_workers: activeWorkers,
      total_workers: workers.length,
      jobs_in_progress: jobsInProgress,
      open_disputes: openDisputes,
      pending_kyc: pendingKYC,
      total_jobs_completed: totalJobsCompleted,
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
