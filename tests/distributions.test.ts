import request from 'supertest';
import app from '../src/app';
import { donationService } from '../src/services/donationService';

beforeEach(() => {
  donationService.reset();
});

describe('POST /api/distributions', () => {
  it('should fail when no inventory exists (409)', async () => {
    const res = await request(app).post('/api/distributions').send({
      type: 'food',
      quantity: 10,
      unit: 'lbs',
    });

    expect(res.status).toBe(409);
    expect(res.body.error).toContain('Insufficient inventory');
  });

  it('should succeed when inventory is sufficient', async () => {
    // First, donate some food
    await request(app).post('/api/donations').send({
      donorName: 'Alice', type: 'food', quantity: 50, unit: 'lbs',
    });

    // Then distribute some
    const res = await request(app).post('/api/distributions').send({
      type: 'food',
      quantity: 20,
      unit: 'lbs',
      recipientDescription: 'Weekly meal service',
    });

    expect(res.status).toBe(201);
    expect(res.body.data.quantity).toBe(20);
    expect(res.body.message).toContain('successfully');
  });

  it('should fail when distributing more than available', async () => {
    await request(app).post('/api/donations').send({
      donorName: 'Bob', type: 'clothing', quantity: 10, unit: 'items',
    });

    const res = await request(app).post('/api/distributions').send({
      type: 'clothing',
      quantity: 15,
      unit: 'items',
    });

    expect(res.status).toBe(409);
  });

  it('should reject invalid payload', async () => {
    const res = await request(app).post('/api/distributions').send({
      type: 'invalid_type',
      quantity: 0,
      unit: '',
    });

    expect(res.status).toBe(400);
    expect(res.body.errors.length).toBeGreaterThan(0);
  });
});

describe('GET /api/distributions', () => {
  it('should list all distributions', async () => {
    await request(app).post('/api/donations').send({
      donorName: 'Eve', type: 'food', quantity: 100, unit: 'lbs',
    });
    await request(app).post('/api/distributions').send({
      type: 'food', quantity: 30, unit: 'lbs',
    });
    await request(app).post('/api/distributions').send({
      type: 'food', quantity: 20, unit: 'lbs',
    });

    const res = await request(app).get('/api/distributions');

    expect(res.status).toBe(200);
    expect(res.body.count).toBe(2);
  });
});
