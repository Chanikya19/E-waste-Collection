import { Router, Request, Response } from 'express';
import { db } from '../db';
import { requireAuth, requireRole, AuthenticatedRequest } from '../auth';

const router = Router();

// GET /api/analytics - Full Agency Analytics Dashboard data
router.get('/', requireAuth, requireRole('agency', 'staff'), (req: AuthenticatedRequest, res: Response) => {
  const analytics = db.getAnalytics();
  res.json({
    data: analytics,
  });
});

// GET /api/analytics/public - Public stats for landing page
router.get('/public', (req: Request, res: Response) => {
  const analytics = db.getAnalytics();
  res.json({
    data: {
      totalPickups: analytics.totalPickups,
      totalWasteRecycledKg: analytics.totalWasteRecycledKg,
      happyCitizensCount: analytics.happyCitizensCount,
      collectionCentersCount: analytics.collectionCentersCount,
      co2EmissionsSavedKg: analytics.co2EmissionsSavedKg,
      toxicDivertedKg: analytics.toxicDivertedKg,
      metalsRecoveredKg: analytics.metalsRecoveredKg,
    }
  });
});

export default router;
