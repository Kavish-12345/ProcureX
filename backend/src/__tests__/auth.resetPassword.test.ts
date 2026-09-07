import request from 'supertest';
import app from '../app.js';
import prisma from '../lib/prisma.js';
import redis from '../lib/redis.js';

const retailer = {
  email: 'reset-password-test@example.com',
  password: 'Password1',
  name: 'Test Retailer',
  businessName: 'Test Business',
  phone: '9876543210',
  role: 'RETAILER',
};

// forgotPassword only logs the reset link — it never appears in the HTTP response —
// so tests recover the token straight from Redis, matched by the target user's id
// (rather than assuming it's the only key present, since Redis isn't flushed between tests).
async function getResetTokenForEmail(email: string): Promise<string> {
  const user = await prisma.user.findUnique({ where: { email } });
  const keys = await redis.keys('reset:*');
  for (const key of keys) {
    const userId = await redis.get(key);
    if (userId === user!.id) return key.replace('reset:', '');
  }
  throw new Error(`No reset token found in Redis for ${email}`);
}

describe('POST /api/auth/reset-password', () => {
  it('resets the password with a valid token, and the new password logs in', async () => {
    await request(app).post('/api/auth/signup').send(retailer);
    await request(app).post('/api/auth/forgot-password').send({ email: retailer.email });
    const token = await getResetTokenForEmail(retailer.email);

    const resetRes = await request(app)
      .post('/api/auth/reset-password')
      .send({ token, password: 'NewPassword1' });

    expect(resetRes.status).toBe(200);

    const oldLogin = await request(app)
      .post('/api/auth/login')
      .send({ email: retailer.email, password: retailer.password });
    expect(oldLogin.status).toBe(401);

    const newLogin = await request(app)
      .post('/api/auth/login')
      .send({ email: retailer.email, password: 'NewPassword1' });
    expect(newLogin.status).toBe(200);
    expect(newLogin.body.user.phone).toBe(retailer.phone);
  });

  it('rejects an invalid token', async () => {
    const res = await request(app)
      .post('/api/auth/reset-password')
      .send({ token: 'not-a-real-token', password: 'NewPassword1' });

    expect(res.status).toBe(400);
  });

  it('rejects a token that has already been used once', async () => {
    await request(app).post('/api/auth/signup').send(retailer);
    await request(app).post('/api/auth/forgot-password').send({ email: retailer.email });
    const token = await getResetTokenForEmail(retailer.email);

    const first = await request(app)
      .post('/api/auth/reset-password')
      .send({ token, password: 'NewPassword1' });
    expect(first.status).toBe(200);

    const second = await request(app)
      .post('/api/auth/reset-password')
      .send({ token, password: 'AnotherPassword1' });
    expect(second.status).toBe(400);
  });
});
