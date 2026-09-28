import request from 'supertest';
import app from '../app.js';

const supplier = {
  email: 'notif-supplier@example.com',
  password: 'Password1',
  name: 'Test Supplier',
  businessName: 'Supplier Co',
  phone: '9876543210',
  role: 'SUPPLIER',
};

const retailer = {
  ...supplier,
  email: 'notif-retailer@example.com',
  businessName: 'Retailer Co',
  role: 'RETAILER',
};

function extractCookie(res: request.Response): string[] {
  const cookie = res.headers['set-cookie'];
  if (!cookie) throw new Error('Expected a Set-Cookie header, got none');
  return Array.isArray(cookie) ? cookie : [cookie];
}

async function signUp(body: typeof supplier) {
  const res = await request(app).post('/api/auth/signup').send(body);
  return { cookie: extractCookie(res), userId: res.body.user.id as string };
}

// Sets up the common fixture: a supplier with a product, a retailer, and an
// order already placed by that retailer.
async function placeOrder() {
  const supplierAccount = await signUp(supplier);
  const retailerAccount = await signUp(retailer);

  const productRes = await request(app)
    .post('/api/products')
    .set('Cookie', supplierAccount.cookie)
    .send({ name: 'Rice (25kg)', unitPrice: 50, stock: 100, unit: 'bag' });

  if (!productRes.body.product) {
    throw new Error(`Product setup failed: ${productRes.status} ${JSON.stringify(productRes.body)}`);
  }

  const orderRes = await request(app)
    .post('/api/orders')
    .set('Cookie', retailerAccount.cookie)
    .send({
      supplierId: supplierAccount.userId,
      items: [{ productId: productRes.body.product.id, quantity: 10 }],
    });

  if (!orderRes.body.order) {
    throw new Error(`Order setup failed: ${orderRes.status} ${JSON.stringify(orderRes.body)}`);
  }

  return { supplierAccount, retailerAccount, orderId: orderRes.body.order.id as string };
}

async function getNotifications(cookie: string[]) {
  const res = await request(app).get('/api/notifications').set('Cookie', cookie);
  return res.body.notifications as Array<{ id: string; type: string; isRead: boolean }>;
}

describe('Notification triggers', () => {
  it('notifies the supplier when a retailer places an order, and not the retailer', async () => {
    const { supplierAccount, retailerAccount } = await placeOrder();

    const supplierNotifications = await getNotifications(supplierAccount.cookie);
    expect(supplierNotifications).toHaveLength(1);
    expect(supplierNotifications[0]!.type).toBe('ORDER_PLACED');

    // The person who took the action shouldn't be told about their own action
    const retailerNotifications = await getNotifications(retailerAccount.cookie);
    expect(retailerNotifications).toHaveLength(0);
  });

  it('notifies the retailer when the supplier confirms the order', async () => {
    const { supplierAccount, retailerAccount, orderId } = await placeOrder();

    const dueDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
    await request(app)
      .patch(`/api/orders/${orderId}/status`)
      .set('Cookie', supplierAccount.cookie)
      .send({ status: 'CONFIRMED', dueDate });

    const retailerNotifications = await getNotifications(retailerAccount.cookie);
    expect(retailerNotifications).toHaveLength(1);
    expect(retailerNotifications[0]!.type).toBe('ORDER_CONFIRMED');
  });

  it('notifies the supplier when a retailer cancels their own pending order', async () => {
    const { supplierAccount, retailerAccount, orderId } = await placeOrder();

    await request(app)
      .patch(`/api/orders/${orderId}/status`)
      .set('Cookie', retailerAccount.cookie)
      .send({ status: 'CANCELLED' });

    const supplierNotifications = await getNotifications(supplierAccount.cookie);
    // ORDER_PLACED from the original order, plus ORDER_CANCELLED
    expect(supplierNotifications).toHaveLength(2);
    expect(supplierNotifications[0]!.type).toBe('ORDER_CANCELLED');
  });

  it('notifies the retailer when the supplier records a payment', async () => {
    const { supplierAccount, retailerAccount, orderId } = await placeOrder();

    const dueDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
    await request(app)
      .patch(`/api/orders/${orderId}/status`)
      .set('Cookie', supplierAccount.cookie)
      .send({ status: 'CONFIRMED', dueDate });

    const receivables = await request(app)
      .get('/api/ledger/receivables')
      .set('Cookie', supplierAccount.cookie);
    const entryId = receivables.body.entries[0].id;

    await request(app)
      .patch(`/api/ledger/${entryId}/pay`)
      .set('Cookie', supplierAccount.cookie)
      .send({});

    const retailerNotifications = await getNotifications(retailerAccount.cookie);
    expect(retailerNotifications[0]!.type).toBe('PAYMENT_RECORDED');
  });
});

describe('GET /api/notifications', () => {
  it('returns only the calling user\'s own notifications', async () => {
    const { supplierAccount, retailerAccount } = await placeOrder();

    const supplierNotifications = await getNotifications(supplierAccount.cookie);
    const retailerNotifications = await getNotifications(retailerAccount.cookie);

    expect(supplierNotifications).toHaveLength(1);
    expect(retailerNotifications).toHaveLength(0);
  });

  it('rejects unauthenticated requests', async () => {
    const res = await request(app).get('/api/notifications');
    expect(res.status).toBe(401);
  });
});

describe('Marking notifications read', () => {
  it('marks one as read and drops the unread count', async () => {
    const { supplierAccount } = await placeOrder();

    const before = await request(app)
      .get('/api/notifications/unread-count')
      .set('Cookie', supplierAccount.cookie);
    expect(before.body.count).toBe(1);

    const [notification] = await getNotifications(supplierAccount.cookie);
    const readRes = await request(app)
      .patch(`/api/notifications/${notification!.id}/read`)
      .set('Cookie', supplierAccount.cookie);
    expect(readRes.status).toBe(200);

    const after = await request(app)
      .get('/api/notifications/unread-count')
      .set('Cookie', supplierAccount.cookie);
    expect(after.body.count).toBe(0);
  });

  it('refuses to mark someone else\'s notification as read', async () => {
    const { supplierAccount, retailerAccount } = await placeOrder();
    const [supplierNotification] = await getNotifications(supplierAccount.cookie);

    const res = await request(app)
      .patch(`/api/notifications/${supplierNotification!.id}/read`)
      .set('Cookie', retailerAccount.cookie);

    expect(res.status).toBe(403);
  });

  it('marks all as read at once', async () => {
    const { supplierAccount, retailerAccount, orderId } = await placeOrder();

    await request(app)
      .patch(`/api/orders/${orderId}/status`)
      .set('Cookie', retailerAccount.cookie)
      .send({ status: 'CANCELLED' });

    const res = await request(app)
      .patch('/api/notifications/read-all')
      .set('Cookie', supplierAccount.cookie);
    expect(res.status).toBe(200);
    expect(res.body.count).toBe(2);

    const after = await request(app)
      .get('/api/notifications/unread-count')
      .set('Cookie', supplierAccount.cookie);
    expect(after.body.count).toBe(0);
  });
});
