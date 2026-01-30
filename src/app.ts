/**
 * Express Application Setup
 *
 * Configures middleware, mounts routes, and sets up error handling.
 * Separated from server startup for testability (supertest imports this).
 */

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import donationRoutes from './routes/donations';
import distributionRoutes from './routes/distributions';
import reportRoutes from './routes/reports';
import { errorHandler } from './middleware/errorHandler';

const app = express();

// ─── Middleware ─────────────────────────────────────────────────
app.use(helmet()); // Security headers
app.use(cors()); // Cross-origin support
app.use(express.json()); // JSON body parsing

// ─── Health Check ──────────────────────────────────────────────
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'healthy',
    service: 'donation-manager',
    timestamp: new Date().toISOString(),
  });
});

// ─── API Routes ────────────────────────────────────────────────
app.use('/api/donations', donationRoutes);
app.use('/api/distributions', distributionRoutes);
app.use('/api/reports', reportRoutes);

// ─── 404 Handler ───────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// ─── Global Error Handler ──────────────────────────────────────
app.use(errorHandler);

export default app;
