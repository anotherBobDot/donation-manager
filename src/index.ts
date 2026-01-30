/**
 * Server Entry Point
 *
 * Starts the Express server on the configured port.
 */

import app from './app';

const PORT = process.env.PORT ?? 3000;

app.listen(Number(PORT), '0.0.0.0', () => {
  console.log(`🏠 Donation Manager API running on http://localhost:${PORT}`);
  console.log(`📋 Health check: http://localhost:${PORT}/api/health`);
  console.log(`📦 Donations:    http://localhost:${PORT}/api/donations`);
  console.log(`📤 Distributions: http://localhost:${PORT}/api/distributions`);
  console.log(`📊 Reports:      http://localhost:${PORT}/api/reports/inventory`);
});
