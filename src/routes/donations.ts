/**
 * Donation Routes
 *
 * POST /api/donations       — Register a new donation
 * GET  /api/donations       — List all donations
 * GET  /api/donations/:id   — Get a specific donation
 */

import { Router, Request, Response } from 'express';
import { donationService } from '../services/donationService';
import { validateDonation } from '../middleware/validate';

const router = Router();

/** Register a new donation */
router.post('/', validateDonation, (req: Request, res: Response) => {
  const donation = donationService.createDonation(req.body);
  res.status(201).json({
    message: 'Donation recorded successfully',
    data: donation,
  });
});

/** List all donations */
router.get('/', (_req: Request, res: Response) => {
  const donations = donationService.getAllDonations();
  res.json({
    count: donations.length,
    data: donations,
  });
});

/** Get a specific donation by ID */
router.get('/:id', (req: Request, res: Response) => {
  const donation = donationService.getDonation(req.params.id as string);
  if (!donation) {
    res.status(404).json({ error: 'Donation not found' });
    return;
  }
  res.json({ data: donation });
});

export default router;
