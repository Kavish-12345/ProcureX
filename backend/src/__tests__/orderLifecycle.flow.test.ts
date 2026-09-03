import request from 'supertest';
import app from '../app.js';

const supplier = {
  email: 'supplier@example.com',
  password: 'Password1',
  name: 'Test Supplier',
  businessName: 'Supplier Co',
  phone: '9876543210',
  role: 'SUPPLIER',
};

const retailer = { ...supplier, email: 'retailer@example.com', businessName: 'Retailer Co', role: 'RETAILER' };

function extractCookie(res: request.Response): string[] {
  const cookie = res.headers['set-cookie'];
  if (!cookie) throw new Error('Expected a Set-Cookie header, got none');
  return Array.isArray(cookie) ? cookie : [cookie];
}

describe('Full order lifecycle', () => {
  it('goes from product listing to a paid ledger entry', async () => {
    // 1. Supplier signs up and lists a product
    const supplierSignup = await request(app).post('/api/auth/signup').send(supplier);
    const supplierCookie = extractCookie(supplierSignup);

    const productRes = await request(app)
      .post('/api/products')
      .set('Cookie', supplierCookie)
      .send({ name: 'Rice (25kg)', unitPrice: 50, stock: 100, unit: 'bag' });
    expect(productRes.status).toBe(201);
    const productId = productRes.body.product.id;
    const supplierId = supplierSignup.body.user.id;

    // 2. Retailer signs up and places an order
    const retailerSignup = await request(app).post('/api/auth/signup').send(retailer);
    const retailerCookie = extractCookie(retailerSignup);

    const orderRes = await request(app)
      .post('/api/orders')
      .set('Cookie', retailerCookie)
      .send({ supplierId, items: [{ productId, quantity: 10 }] });
    expect(orderRes.status).toBe(201);
    expect(Number(orderRes.body.order.totalAmount)).toBe(500);
    const orderId = orderRes.body.order.id;

    // 3. Supplier confirms it — this decrements stock and creates the ledger entry
    const dueDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
    const confirmRes = await request(app)
      .patch(`/api/orders/${orderId}/status`)
      .set('Cookie', supplierCookie)
      .send({ status: 'CONFIRMED', dueDate });
    expect(confirmRes.status).toBe(200);
    expect(confirmRes.body.order.status).toBe('CONFIRMED');

    const productAfterConfirm = await request(app).get(`/api/products/${productId}`);
    expect(productAfterConfirm.body.product.stock).toBe(90);

    // 4. Supplier ships, then delivers
    const shipRes = await request(app)
      .patch(`/api/orders/${orderId}/status`)
      .set('Cookie', supplierCookie)
      .send({ status: 'SHIPPED' });
    expect(shipRes.body.order.status).toBe('SHIPPED');

    const deliverRes = await request(app)
      .patch(`/api/orders/${orderId}/status`)
      .set('Cookie', supplierCookie)
      .send({ status: 'DELIVERED' });
    expect(deliverRes.body.order.status).toBe('DELIVERED');

    // 5. Retailer sees the due, supplier sees the same entry as a receivable
    const duesRes = await request(app).get('/api/ledger/dues').set('Cookie', retailerCookie);
    expect(duesRes.body.entries).toHaveLength(1);
    expect(duesRes.body.entries[0].isPaid).toBe(false);
    const ledgerEntryId = duesRes.body.entries[0].id;

    const receivablesRes = await request(app).get('/api/ledger/receivables').set('Cookie', supplierCookie);
    expect(receivablesRes.body.entries).toHaveLength(1);
    expect(receivablesRes.body.entries[0].id).toBe(ledgerEntryId);

    // 6. Supplier marks it paid — both views should now reflect that
    const payRes = await request(app)
      .patch(`/api/ledger/${ledgerEntryId}/pay`)
      .set('Cookie', supplierCookie)
      .send({});
    expect(payRes.status).toBe(200);
    expect(payRes.body.entry.isPaid).toBe(true);

    const duesAfterPay = await request(app).get('/api/ledger/dues').set('Cookie', retailerCookie);
    expect(duesAfterPay.body.entries[0].isPaid).toBe(true);
  }, 15000);
});

describe('Retailer order cancellation', () => {
  it('lets a retailer cancel their own pending order', async () => {
    const supplierSignup = await request(app).post('/api/auth/signup').send(supplier);
    const supplierCookie = extractCookie(supplierSignup);

    const productRes = await request(app)
      .post('/api/products')
      .set('Cookie', supplierCookie)
      .send({ name: 'Wheat (25kg)', unitPrice: 40, stock: 50, unit: 'bag' });
    const productId = productRes.body.product.id;
    const supplierId = supplierSignup.body.user.id;

    const retailerSignup = await request(app).post('/api/auth/signup').send(retailer);
    const retailerCookie = extractCookie(retailerSignup);

    const orderRes = await request(app)
      .post('/api/orders')
      .set('Cookie', retailerCookie)
      .send({ supplierId, items: [{ productId, quantity: 5 }] });
    const orderId = orderRes.body.order.id;

    const cancelRes = await request(app)
      .patch(`/api/orders/${orderId}/status`)
      .set('Cookie', retailerCookie)
      .send({ status: 'CANCELLED' });
    expect(cancelRes.status).toBe(200);
    expect(cancelRes.body.order.status).toBe('CANCELLED');

    // Stock was never decremented for a pending order, so it stays unchanged.
    const productAfterCancel = await request(app).get(`/api/products/${productId}`);
    expect(productAfterCancel.body.product.stock).toBe(50);
  });

  it('blocks a retailer from cancelling an order once confirmed', async () => {
    const supplierSignup = await request(app)
      .post('/api/auth/signup')
      .send({ ...supplier, email: 'supplier2@example.com' });
    const supplierCookie = extractCookie(supplierSignup);

    const productRes = await request(app)
      .post('/api/products')
      .set('Cookie', supplierCookie)
      .send({ name: 'Sugar (25kg)', unitPrice: 30, stock: 50, unit: 'bag' });
    const productId = productRes.body.product.id;
    const supplierId = supplierSignup.body.user.id;

    const retailerSignup = await request(app)
      .post('/api/auth/signup')
      .send({ ...retailer, email: 'retailer2@example.com' });
    const retailerCookie = extractCookie(retailerSignup);

    const orderRes = await request(app)
      .post('/api/orders')
      .set('Cookie', retailerCookie)
      .send({ supplierId, items: [{ productId, quantity: 5 }] });
    const orderId = orderRes.body.order.id;

    const dueDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
    await request(app)
      .patch(`/api/orders/${orderId}/status`)
      .set('Cookie', supplierCookie)
      .send({ status: 'CONFIRMED', dueDate });

    const cancelRes = await request(app)
      .patch(`/api/orders/${orderId}/status`)
      .set('Cookie', retailerCookie)
      .send({ status: 'CANCELLED' });
    expect(cancelRes.status).toBe(400);
    expect(cancelRes.body.message).toMatch(/only cancel a pending order/i);
  });

  it('blocks a retailer from cancelling another retailer\'s order', async () => {
    const supplierSignup = await request(app)
      .post('/api/auth/signup')
      .send({ ...supplier, email: 'supplier3@example.com' });
    const supplierCookie = extractCookie(supplierSignup);

    const productRes = await request(app)
      .post('/api/products')
      .set('Cookie', supplierCookie)
      .send({ name: 'Salt (25kg)', unitPrice: 20, stock: 50, unit: 'bag' });
    const productId = productRes.body.product.id;
    const supplierId = supplierSignup.body.user.id;

    const retailerSignup = await request(app)
      .post('/api/auth/signup')
      .send({ ...retailer, email: 'retailer3@example.com' });
    const retailerCookie = extractCookie(retailerSignup);

    const orderRes = await request(app)
      .post('/api/orders')
      .set('Cookie', retailerCookie)
      .send({ supplierId, items: [{ productId, quantity: 5 }] });
    const orderId = orderRes.body.order.id;

    const otherRetailerSignup = await request(app)
      .post('/api/auth/signup')
      .send({ ...retailer, email: 'retailer4@example.com' });
    const otherRetailerCookie = extractCookie(otherRetailerSignup);

    const cancelRes = await request(app)
      .patch(`/api/orders/${orderId}/status`)
      .set('Cookie', otherRetailerCookie)
      .send({ status: 'CANCELLED' });
    expect(cancelRes.status).toBe(400);
    expect(cancelRes.body.message).toMatch(/not authorized/i);
  });
});
