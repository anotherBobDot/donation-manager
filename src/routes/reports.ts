/**
 * Report Routes
 *
 * GET /api/reports/inventory — Current inventory grouped by donation type
 * GET /api/reports/donors    — Total contributions per donor
 */

import { Router, Request, Response } from 'express';
import { donationService } from '../services/donationService';

const router = Router();

/** Inventory report: current stock levels by type */
router.get('/inventory', (_req: Request, res: Response) => {
  const report = donationService.getInventoryReport();
  res.json({
    generatedAt: new Date().toISOString(),
    summary: report,
  });
});

/** Donor report: aggregated contributions per donor */
router.get('/donors', (_req: Request, res: Response) => {
  const report = donationService.getDonorReport();
  res.json({
    generatedAt: new Date().toISOString(),
    totalDonors: report.length,
    donors: report,
  });
});

export default router;
