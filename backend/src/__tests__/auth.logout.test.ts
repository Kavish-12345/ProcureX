import request from 'supertest';
import app from '../app.js';

const retailer = {
  email: 'logout-test@example.com',
  password: 'Password1',
  name: 'Test Retailer',
  businessName: 'Test Business',
  phone: '9876543210',
  role: 'RETAILER',
};

function extractCookie(res: request.Response): string[] {
  const cookie = res.headers['set-cookie'];
  if (!cookie) throw new Error('Expected a Set-Cookie header, got none');
  return Array.isArray(cookie) ? cookie : [cookie];
}

describe('POST /api/auth/logout', () => {
  it('revokes the access token so it can no longer be used', async () => {
    const signupRes = await request(app).post('/api/auth/signup').send(retailer);
    const cookie = extractCookie(signupRes);

    // Sanity check: the token actually works before logout
    const before = await request(app).get('/api/orders/retailer/me').set('Cookie', cookie);
    expect(before.status).toBe(200);

    const logoutRes = await request(app).post('/api/auth/logout').set('Cookie', cookie);
    expect(logoutRes.status).toBe(200);

    // Same cookie, same token, presented again — should now be rejected
    const after = await request(app).get('/api/orders/retailer/me').set('Cookie', cookie);
    expect(after.status).toBe(401);
  });

  it('revokes the refresh token too, so it can no longer mint new tokens', async () => {
    const signupRes = await request(app).post('/api/auth/signup').send(retailer);
    const cookie = extractCookie(signupRes);

    await request(app).post('/api/auth/logout').set('Cookie', cookie);

    const refreshRes = await request(app).post('/api/auth/refresh').set('Cookie', cookie);
    expect(refreshRes.status).toBe(401);
  });

  it('succeeds even when called with no session at all', async () => {
    const res = await request(app).post('/api/auth/logout');
    expect(res.status).toBe(200);
  });
});
