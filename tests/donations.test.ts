import request from 'supertest';
import app from '../src/app';
import { donationService } from '../src/services/donationService';

beforeEach(() => {
  donationService.reset();
});

describe('POST /api/donations', () => {
  const validDonation = {
    donorName: 'Alice Johnson',
    type: 'food',
    quantity: 50,
    unit: 'lbs',
    notes: 'Canned goods from food drive',
  };

  it('should create a donation and return 201', async () => {
    const res = await request(app).post('/api/donations').send(validDonation);

    expect(res.status).toBe(201);
    expect(res.body.data).toMatchObject({
      donorName: 'Alice Johnson',
      type: 'food',
      quantity: 50,
      unit: 'lbs',
    });
    expect(res.body.data.id).toBeDefined();
    expect(res.body.message).toContain('successfully');
  });

  it('should reject missing donor name with 400', async () => {
    const res = await request(app)
      .post('/api/donations')
      .send({ ...validDonation, donorName: '' });

    expect(res.status).toBe(400);
    expect(res.body.errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ field: 'donorName' }),
      ]),
    );
  });

  it('should reject invalid donation type', async () => {
    const res = await request(app)
      .post('/api/donations')
      .send({ ...validDonation, type: 'electronics' });

    expect(res.status).toBe(400);
    expect(res.body.errors[0].field).toBe('type');
  });

  it('should reject zero or negative quantity', async () => {
    const res = await request(app)
      .post('/api/donations')
      .send({ ...validDonation, quantity: -5 });

    expect(res.status).toBe(400);
    expect(res.body.errors[0].field).toBe('quantity');
  });
});

describe('GET /api/donations', () => {
  it('should return empty array initially', async () => {
    const res = await request(app).get('/api/donations');

    expect(res.status).toBe(200);
    expect(res.body.count).toBe(0);
    expect(res.body.data).toEqual([]);
  });

  it('should return all created donations', async () => {
    await request(app).post('/api/donations').send({
      donorName: 'Bob', type: 'money', quantity: 100, unit: 'dollars',
    });
    await request(app).post('/api/donations').send({
      donorName: 'Carol', type: 'clothing', quantity: 20, unit: 'items',
    });

    const res = await request(app).get('/api/donations');

    expect(res.status).toBe(200);
    expect(res.body.count).toBe(2);
    expect(res.body.data).toHaveLength(2);
  });
});

describe('GET /api/donations/:id', () => {
  it('should return 404 for unknown id', async () => {
    const res = await request(app).get('/api/donations/nonexistent');
    expect(res.status).toBe(404);
  });

  it('should return a specific donation', async () => {
    const created = await request(app).post('/api/donations').send({
      donorName: 'Dave', type: 'food', quantity: 10, unit: 'lbs',
    });

    const res = await request(app).get(`/api/donations/${created.body.data.id}`);

    expect(res.status).toBe(200);
    expect(res.body.data.donorName).toBe('Dave');
  });
});
