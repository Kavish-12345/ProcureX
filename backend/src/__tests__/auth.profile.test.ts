import request from 'supertest';
import app from '../app.js';

const retailer = {
  email: 'profile-test@example.com',
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

describe('PATCH /api/auth/profile', () => {
  it('updates the authenticated user\'s own profile fields', async () => {
    const signupRes = await request(app).post('/api/auth/signup').send(retailer);
    const cookie = extractCookie(signupRes);

    const res = await request(app)
      .patch('/api/auth/profile')
      .set('Cookie', cookie)
      .send({ name: 'Updated Name', phone: '9123456789' });

    expect(res.status).toBe(200);
    expect(res.body.user.name).toBe('Updated Name');
    expect(res.body.user.phone).toBe('9123456789');
  });

  it('rejects unauthenticated requests', async () => {
    const res = await request(app).patch('/api/auth/profile').send({ name: 'Nope' });
    expect(res.status).toBe(401);
  });
});

describe('PATCH /api/auth/profile/password', () => {
  it('changes the password when the current password is correct', async () => {
    const signupRes = await request(app).post('/api/auth/signup').send(retailer);
    const cookie = extractCookie(signupRes);

    const res = await request(app)
      .patch('/api/auth/profile/password')
      .set('Cookie', cookie)
      .send({ currentPassword: retailer.password, newPassword: 'NewPassword1' });

    expect(res.status).toBe(200);

    const newLogin = await request(app)
      .post('/api/auth/login')
      .send({ email: retailer.email, password: 'NewPassword1' });
    expect(newLogin.status).toBe(200);
  });

  it('rejects the change when the current password is wrong', async () => {
    const signupRes = await request(app).post('/api/auth/signup').send(retailer);
    const cookie = extractCookie(signupRes);

    const res = await request(app)
      .patch('/api/auth/profile/password')
      .set('Cookie', cookie)
      .send({ currentPassword: 'WrongPassword1', newPassword: 'NewPassword1' });

    expect(res.status).toBe(400);
  });

  it('rejects unauthenticated requests', async () => {
    const res = await request(app)
      .patch('/api/auth/profile/password')
      .send({ currentPassword: retailer.password, newPassword: 'NewPassword1' });
    expect(res.status).toBe(401);
  });
});
