import request from 'supertest';
import app from '../src/app';
import { donationService } from '../src/services/donationService';

beforeEach(() => {
  donationService.reset();
});

describe('GET /api/reports/inventory', () => {
  it('should return empty summary with no data', async () => {
    const res = await request(app).get('/api/reports/inventory');

    expect(res.status).toBe(200);
    expect(res.body.summary).toEqual([]);
    expect(res.body.generatedAt).toBeDefined();
  });

  it('should show correct inventory after donations and distributions', async () => {
    // Donate food and clothing
    await request(app).post('/api/donations').send({
      donorName: 'Alice', type: 'food', quantity: 100, unit: 'lbs',
    });
    await request(app).post('/api/donations').send({
      donorName: 'Bob', type: 'food', quantity: 50, unit: 'lbs',
    });
    await request(app).post('/api/donations').send({
      donorName: 'Carol', type: 'clothing', quantity: 30, unit: 'items',
    });

    // Distribute some food
    await request(app).post('/api/distributions').send({
      type: 'food', quantity: 60, unit: 'lbs',
    });

    const res = await request(app).get('/api/reports/inventory');

    expect(res.status).toBe(200);
    const { summary } = res.body;

    // Clothing: 30 received, 0 distributed, 30 in stock
    const clothing = summary.find((s: { type: string }) => s.type === 'clothing');
    expect(clothing).toMatchObject({
      totalReceived: 30,
      totalDistributed: 0,
      currentStock: 30,
    });

    // Food: 150 received, 60 distributed, 90 in stock
    const food = summary.find((s: { type: string }) => s.type === 'food');
    expect(food).toMatchObject({
      totalReceived: 150,
      totalDistributed: 60,
      currentStock: 90,
    });
  });
});

describe('GET /api/reports/donors', () => {
  it('should return empty list with no data', async () => {
    const res = await request(app).get('/api/reports/donors');

    expect(res.status).toBe(200);
    expect(res.body.totalDonors).toBe(0);
    expect(res.body.donors).toEqual([]);
  });

  it('should aggregate donations per donor', async () => {
    await request(app).post('/api/donations').send({
      donorName: 'Alice', type: 'money', quantity: 500, unit: 'dollars',
    });
    await request(app).post('/api/donations').send({
      donorName: 'Alice', type: 'food', quantity: 20, unit: 'lbs',
    });
    await request(app).post('/api/donations').send({
      donorName: 'Bob', type: 'clothing', quantity: 15, unit: 'items',
    });

    const res = await request(app).get('/api/reports/donors');

    expect(res.status).toBe(200);
    expect(res.body.totalDonors).toBe(2);

    const alice = res.body.donors.find((d: { donorName: string }) => d.donorName === 'Alice');
    expect(alice.contributions).toHaveLength(2);
    expect(alice.totalDonations).toBe(520); // 500 + 20

    const bob = res.body.donors.find((d: { donorName: string }) => d.donorName === 'Bob');
    expect(bob.totalDonations).toBe(15);
  });
});

describe('GET /api/health', () => {
  it('should return healthy status', async () => {
    const res = await request(app).get('/api/health');

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('healthy');
    expect(res.body.service).toBe('donation-manager');
  });
});
