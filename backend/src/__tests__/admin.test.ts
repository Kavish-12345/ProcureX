import request from 'supertest';
import app from '../app.js';
import prisma from '../lib/prisma.js';

const baseUser = {
  password: 'Password1',
  name: 'Test Person',
  businessName: 'Test Business',
  phone: '9876543210',
};

const adminSeed = { ...baseUser, email: 'admin-test@example.com', role: 'SUPPLIER' };
const retailerSeed = { ...baseUser, email: 'admin-retailer@example.com', role: 'RETAILER' };
const supplierSeed = { ...baseUser, email: 'admin-supplier@example.com', role: 'SUPPLIER' };

function extractCookie(res: request.Response): string[] {
  const cookie = res.headers['set-cookie'];
  if (!cookie) throw new Error('Expected a Set-Cookie header, got none');
  return Array.isArray(cookie) ? cookie : [cookie];
}

async function signUp(body: Record<string, unknown>) {
  const res = await request(app).post('/api/auth/signup').send(body);
  return { cookie: extractCookie(res), userId: res.body.user.id as string };
}

// ADMIN is deliberately not obtainable through signup, so tests promote a normal
// account the same way a real deployment would — directly in the database. The
// role lives in the JWT, so a fresh login is required afterwards to pick it up.
async function signUpAdmin() {
  const { userId } = await signUp(adminSeed);
  await prisma.user.update({ where: { id: userId }, data: { role: 'ADMIN' } });

  const loginRes = await request(app)
    .post('/api/auth/login')
    .send({ email: adminSeed.email, password: adminSeed.password });

  return { cookie: extractCookie(loginRes), userId };
}

describe('Admin route authorization', () => {
  const adminRoutes = ['/api/admin/users', '/api/admin/orders', '/api/admin/stats'];

  it('rejects a retailer with 403 on every admin route', async () => {
    const { cookie } = await signUp(retailerSeed);

    for (const route of adminRoutes) {
      const res = await request(app).get(route).set('Cookie', cookie);
      expect(res.status).toBe(403);
    }
  });

  it('rejects a supplier with 403 on every admin route', async () => {
    const { cookie } = await signUp(supplierSeed);

    for (const route of adminRoutes) {
      const res = await request(app).get(route).set('Cookie', cookie);
      expect(res.status).toBe(403);
    }
  });

  it('rejects unauthenticated requests with 401', async () => {
    for (const route of adminRoutes) {
      const res = await request(app).get(route);
      expect(res.status).toBe(401);
    }
  });
});

describe('Admin read endpoints', () => {
  it('lists all users without ever exposing password hashes', async () => {
    const { cookie } = await signUpAdmin();
    await signUp(retailerSeed);

    const res = await request(app).get('/api/admin/users').set('Cookie', cookie);

    expect(res.status).toBe(200);
    expect(res.body.users.length).toBeGreaterThanOrEqual(2);
    for (const user of res.body.users) {
      expect(user.password).toBeUndefined();
    }
    expect(res.body.pagination.total).toBeGreaterThanOrEqual(2);
  });

  it('filters users by role', async () => {
    const { cookie } = await signUpAdmin();
    await signUp(retailerSeed);

    const res = await request(app)
      .get('/api/admin/users?role=RETAILER')
      .set('Cookie', cookie);

    expect(res.status).toBe(200);
    expect(res.body.users.every((u: { role: string }) => u.role === 'RETAILER')).toBe(true);
  });

  it('returns platform stats', async () => {
    const { cookie } = await signUpAdmin();
    await signUp(retailerSeed);

    const res = await request(app).get('/api/admin/stats').set('Cookie', cookie);

    expect(res.status).toBe(200);
    expect(res.body.stats.totalUsers).toBeGreaterThanOrEqual(2);
    expect(res.body.stats.retailers).toBeGreaterThanOrEqual(1);
    expect(res.body.stats).toHaveProperty('outstandingAmount');
  });

  it('lists all orders across the platform', async () => {
    const { cookie } = await signUpAdmin();

    const res = await request(app).get('/api/admin/orders').set('Cookie', cookie);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.orders)).toBe(true);
  });

  it('ignores an unrecognised order status instead of passing it to the database', async () => {
    const { cookie } = await signUpAdmin();

    const res = await request(app)
      .get('/api/admin/orders?status=NOT_A_REAL_STATUS')
      .set('Cookie', cookie);

    expect(res.status).toBe(200);
  });

  it('filters users by active state', async () => {
    const { cookie: adminCookie } = await signUpAdmin();
    const { userId: retailerId } = await signUp(retailerSeed);
    await signUp(supplierSeed);

    await request(app)
      .patch(`/api/admin/users/${retailerId}/active`)
      .set('Cookie', adminCookie)
      .send({ isActive: false });

    const suspended = await request(app)
      .get('/api/admin/users?isActive=false')
      .set('Cookie', adminCookie);

    expect(suspended.status).toBe(200);
    expect(suspended.body.users).toHaveLength(1);
    expect(suspended.body.users[0].id).toBe(retailerId);

    const activeUsers = await request(app)
      .get('/api/admin/users?isActive=true')
      .set('Cookie', adminCookie);

    expect(activeUsers.body.users.every((u: { isActive: boolean }) => u.isActive)).toBe(true);
    expect(activeUsers.body.users.some((u: { id: string }) => u.id === retailerId)).toBe(false);
  });

  it('filters orders by status and searches them by business name', async () => {
    const { cookie: adminCookie } = await signUpAdmin();

    const supplier = await signUp({ ...supplierSeed, businessName: 'Ramu Kaka Supplies' });
    const retailer = await signUp({ ...retailerSeed, businessName: 'Ram General Store' });

    const product = await request(app)
      .post('/api/products')
      .set('Cookie', supplier.cookie)
      .send({ name: 'Rice (25kg)', unitPrice: 50, stock: 100, unit: 'bag' });

    await request(app)
      .post('/api/orders')
      .set('Cookie', retailer.cookie)
      .send({
        supplierId: supplier.userId,
        items: [{ productId: product.body.product.id, quantity: 2 }],
      });

    const pending = await request(app)
      .get('/api/admin/orders?status=PENDING')
      .set('Cookie', adminCookie);
    expect(pending.body.orders).toHaveLength(1);

    const delivered = await request(app)
      .get('/api/admin/orders?status=DELIVERED')
      .set('Cookie', adminCookie);
    expect(delivered.body.orders).toHaveLength(0);

    // Matches through the relation, on the retailer's business name
    const bySearch = await request(app)
      .get('/api/admin/orders?search=general')
      .set('Cookie', adminCookie);
    expect(bySearch.body.orders).toHaveLength(1);

    const noMatch = await request(app)
      .get('/api/admin/orders?search=nonexistent')
      .set('Cookie', adminCookie);
    expect(noMatch.body.orders).toHaveLength(0);
  });

  it('searches users by business name', async () => {
    const { cookie } = await signUpAdmin();
    await signUp({ ...retailerSeed, businessName: 'Ram General Store' });
    await signUp({ ...supplierSeed, businessName: 'Ramu Kaka Supplies' });

    const res = await request(app)
      .get('/api/admin/users?search=general')
      .set('Cookie', cookie);

    expect(res.status).toBe(200);
    expect(res.body.users).toHaveLength(1);
    expect(res.body.users[0].businessName).toBe('Ram General Store');
  });
});

describe('Account suspension', () => {
  it('suspends an account so that user can no longer log in', async () => {
    const { cookie: adminCookie } = await signUpAdmin();
    const { userId: retailerId } = await signUp(retailerSeed);

    // Works before suspension
    const loginBefore = await request(app)
      .post('/api/auth/login')
      .send({ email: retailerSeed.email, password: retailerSeed.password });
    expect(loginBefore.status).toBe(200);

    const suspendRes = await request(app)
      .patch(`/api/admin/users/${retailerId}/active`)
      .set('Cookie', adminCookie)
      .send({ isActive: false });
    expect(suspendRes.status).toBe(200);
    expect(suspendRes.body.user.isActive).toBe(false);

    // The assertion that actually matters — the field flipping is incidental
    const loginAfter = await request(app)
      .post('/api/auth/login')
      .send({ email: retailerSeed.email, password: retailerSeed.password });
    expect(loginAfter.status).toBe(403);
  });

  it('reactivates a suspended account', async () => {
    const { cookie: adminCookie } = await signUpAdmin();
    const { userId: retailerId } = await signUp(retailerSeed);

    await request(app)
      .patch(`/api/admin/users/${retailerId}/active`)
      .set('Cookie', adminCookie)
      .send({ isActive: false });

    await request(app)
      .patch(`/api/admin/users/${retailerId}/active`)
      .set('Cookie', adminCookie)
      .send({ isActive: true });

    const login = await request(app)
      .post('/api/auth/login')
      .send({ email: retailerSeed.email, password: retailerSeed.password });
    expect(login.status).toBe(200);
  });

  it('refuses to let an admin suspend their own account', async () => {
    const { cookie, userId } = await signUpAdmin();

    const res = await request(app)
      .patch(`/api/admin/users/${userId}/active`)
      .set('Cookie', cookie)
      .send({ isActive: false });

    expect(res.status).toBe(400);
  });

  it('cuts off a suspended user at refresh, even with a live session', async () => {
    const { cookie: adminCookie } = await signUpAdmin();
    const { cookie: retailerCookie, userId: retailerId } = await signUp(retailerSeed);

    await request(app)
      .patch(`/api/admin/users/${retailerId}/active`)
      .set('Cookie', adminCookie)
      .send({ isActive: false });

    const refreshRes = await request(app)
      .post('/api/auth/refresh')
      .set('Cookie', retailerCookie);
    expect(refreshRes.status).toBe(403);
  });
});
