import request from 'supertest';
import app from '../app.js';
import prisma from '../lib/prisma.js';
import redis from '../lib/redis.js';

const retailer = {
  email: 'forgot-password-test@example.com',
  password: 'Password1',
  name: 'Test Retailer',
  businessName: 'Test Business',
  phone: '9876543210',
  role: 'RETAILER',
};

describe('POST /api/auth/forgot-password', () => {
  it('returns 200 and stores a reset token for a registered email', async () => {
    await request(app).post('/api/auth/signup').send(retailer);

    const res = await request(app)
      .post('/api/auth/forgot-password')
      .send({ email: retailer.email });

    expect(res.status).toBe(200);

    const user = await prisma.user.findUnique({ where: { email: retailer.email } });
    const keys = await redis.keys('reset:*');
    const values = await Promise.all(keys.map((key) => redis.get(key)));
    expect(values).toContain(user!.id);
  });

  it('returns the same 200 message for an email that is not registered', async () => {
    const res = await request(app)
      .post('/api/auth/forgot-password')
      .send({ email: 'no-such-user@example.com' });

    expect(res.status).toBe(200);
    expect(res.body.message).toMatch(/if that email is registered/i);
  });
});
