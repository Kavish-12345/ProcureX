import request from 'supertest';
import app from '../app.js';

const validSignupBody = {
  email: 'retailer@example.com',
  password: 'Password1',
  name: 'Test Retailer',
  businessName: 'Test Business',
  phone: '9876543210',
  role: 'RETAILER',
};

describe('POST /api/auth/signup', () => {
  it('creates a new user and returns it without the password', async () => {
    const res = await request(app).post('/api/auth/signup').send(validSignupBody);

    expect(res.status).toBe(201);
    expect(res.body.user).toMatchObject({
      email: validSignupBody.email,
      name: validSignupBody.name,
      businessName: validSignupBody.businessName,
      phone: validSignupBody.phone,
      role: validSignupBody.role,
    });
    expect(res.body.user.password).toBeUndefined();
    expect(res.headers['set-cookie']).toBeDefined();
  });

  it('rejects a duplicate email with 409', async () => {
    await request(app).post('/api/auth/signup').send(validSignupBody);
    const res = await request(app).post('/api/auth/signup').send(validSignupBody);

    expect(res.status).toBe(409);
    expect(res.body.message).toMatch(/already registered/i);
  });

  it('rejects an invalid payload with 400', async () => {
    const res = await request(app)
      .post('/api/auth/signup')
      .send({ ...validSignupBody, password: 'short' });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe('Validation Failed');
  });
});
