import { Router, Request, Response } from 'express';
import { db } from '../db';

const router = Router();

// GET /api/centers - Public list of collection centers
router.get('/', (req: Request, res: Response) => {
  const centers = Array.from(db.centers.values());
  res.json({
    data: centers,
    count: centers.length,
  });
});

// GET /api/centers/:id
router.get('/:id', (req: Request, res: Response) => {
  const center = db.centers.get(req.params.id);
  if (!center) {
    return res.status(404).json({
      error: {
        code: 'CENTER_NOT_FOUND',
        message: 'Collection center not found.',
        details: [],
      }
    });
  }
  res.json({ data: center });
});

export default router;
