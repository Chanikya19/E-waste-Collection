import { Router, Response } from 'express';
import { z } from 'zod';
import { db } from '../db';
import { requireAuth, AuthenticatedRequest } from '../auth';

const router = Router();

const redeemSchema = z.object({
  rewardId: z.string().min(1, 'Reward ID is required'),
});

// GET /api/rewards - List all rewards
router.get('/', (req, res) => {
  res.json({
    data: db.rewards,
  });
});

// POST /api/rewards/redeem - Citizen redeems a reward
router.post('/redeem', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  const parseResult = redeemSchema.safeParse(req.body);

  if (!parseResult.success) {
    return res.status(400).json({
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Invalid reward selection',
        details: parseResult.error.issues.map(e => ({ field: e.path.join('.'), message: e.message })),
      }
    });
  }

  const { rewardId } = parseResult.data;
  const reward = db.rewards.find(r => r.id === rewardId);

  if (!reward) {
    return res.status(404).json({
      error: {
        code: 'NOT_FOUND',
        message: 'Reward item not found.',
        details: [],
      }
    });
  }

  const dbUser = db.users.get(user.userId);
  if (!dbUser) {
    return res.status(404).json({
      error: {
        code: 'USER_NOT_FOUND',
        message: 'User profile not found.',
        details: [],
      }
    });
  }

  const currentPoints = dbUser.ecoPoints || 0;
  if (currentPoints < reward.pointsCost) {
    return res.status(400).json({
      error: {
        code: 'INSUFFICIENT_POINTS',
        message: `You need ${reward.pointsCost} EcoPoints to redeem this reward, but you have ${currentPoints} EcoPoints.`,
        details: [{ required: reward.pointsCost, current: currentPoints }],
      }
    });
  }

  dbUser.ecoPoints = currentPoints - reward.pointsCost;
  db.users.set(dbUser.id, dbUser);

  const voucherCode = `ECO-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

  res.json({
    message: 'Reward redeemed successfully!',
    voucherCode,
    remainingPoints: dbUser.ecoPoints,
    reward,
  });
});

export default router;
