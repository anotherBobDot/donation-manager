/**
 * Distribution Routes
 *
 * POST /api/distributions   — Log a new distribution
 * GET  /api/distributions   — List all distributions
 */

import { Router, Request, Response } from 'express';
import { donationService } from '../services/donationService';
import { validateDistribution } from '../middleware/validate';

const router = Router();

/** Log a new distribution */
router.post('/', validateDistribution, (req: Request, res: Response) => {
  const result = donationService.createDistribution(req.body);

  // Service returns { error: string } if inventory is insufficient
  if ('error' in result) {
    res.status(409).json({ error: result.error });
    return;
  }

  res.status(201).json({
    message: 'Distribution logged successfully',
    data: result,
  });
});

/** List all distributions */
router.get('/', (_req: Request, res: Response) => {
  const distributions = donationService.getAllDistributions();
  res.json({
    count: distributions.length,
    data: distributions,
  });
});

export default router;
