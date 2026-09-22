import { jest } from '@jest/globals';

const FAKE_PUBLIC_URL = 'https://images.example.com';
const uploadToR2 = jest.fn<(buffer: Buffer, key: string, contentType: string) => Promise<string>>();
const deleteFromR2 = jest.fn<(key: string) => Promise<void>>();

// The real module talks to Cloudflare R2 over the network. Mocked here so these
// tests exercise the controller's own logic (ownership, persistence, replacement)
// without needing real credentials or touching a real bucket.
jest.unstable_mockModule('../lib/r2.js', () => ({
  uploadToR2,
  deleteFromR2,
  extractKeyFromUrl: (url: string) => {
    const prefix = `${FAKE_PUBLIC_URL}/`;
    return url.startsWith(prefix) ? url.slice(prefix.length) : null;
  },
}));

const request = (await import('supertest')).default;
const app = (await import('../app.js')).default;

const supplier = {
  email: 'image-supplier@example.com',
  password: 'Password1',
  name: 'Test Supplier',
  businessName: 'Supplier Co',
  phone: '9876543210',
  role: 'SUPPLIER',
};

const otherSupplier = { ...supplier, email: 'other-supplier@example.com' };

function extractCookie(res: request.Response): string[] {
  const cookie = res.headers['set-cookie'];
  if (!cookie) throw new Error('Expected a Set-Cookie header, got none');
  return Array.isArray(cookie) ? cookie : [cookie];
}

async function signUpSupplier(body: typeof supplier) {
  const res = await request(app).post('/api/auth/signup').send(body);
  return extractCookie(res);
}

async function createProduct(cookie: string[]) {
  const res = await request(app)
    .post('/api/products')
    .set('Cookie', cookie)
    .send({ name: 'Rice (25kg)', unitPrice: 50, stock: 100, unit: 'bag' });
  return res.body.product.id as string;
}

beforeEach(() => {
  uploadToR2.mockResolvedValue(`${FAKE_PUBLIC_URL}/products/test/image.jpg`);
  deleteFromR2.mockResolvedValue(undefined);
});

describe('POST /api/products/:id/image', () => {
  it('uploads an image and saves its URL on the product', async () => {
    const cookie = await signUpSupplier(supplier);
    const productId = await createProduct(cookie);

    const res = await request(app)
      .post(`/api/products/${productId}/image`)
      .set('Cookie', cookie)
      .attach('image', Buffer.from('fake-image-bytes'), {
        filename: 'rice.jpg',
        contentType: 'image/jpeg',
      });

    expect(res.status).toBe(200);
    expect(res.body.product.imageUrl).toBe(`${FAKE_PUBLIC_URL}/products/test/image.jpg`);
    expect(uploadToR2).toHaveBeenCalledTimes(1);

    // Persisted, not just echoed back in the response
    const fetched = await request(app).get(`/api/products/${productId}`);
    expect(fetched.body.product.imageUrl).toBe(`${FAKE_PUBLIC_URL}/products/test/image.jpg`);
  });

  it('deletes the previous image when a product image is replaced', async () => {
    const cookie = await signUpSupplier(supplier);
    const productId = await createProduct(cookie);

    uploadToR2.mockResolvedValueOnce(`${FAKE_PUBLIC_URL}/products/${productId}/first.jpg`);
    await request(app)
      .post(`/api/products/${productId}/image`)
      .set('Cookie', cookie)
      .attach('image', Buffer.from('first'), { filename: 'a.jpg', contentType: 'image/jpeg' });

    uploadToR2.mockResolvedValueOnce(`${FAKE_PUBLIC_URL}/products/${productId}/second.jpg`);
    const res = await request(app)
      .post(`/api/products/${productId}/image`)
      .set('Cookie', cookie)
      .attach('image', Buffer.from('second'), { filename: 'b.jpg', contentType: 'image/jpeg' });

    expect(res.status).toBe(200);
    expect(deleteFromR2).toHaveBeenCalledWith(`products/${productId}/first.jpg`);
  });

  it('rejects a file that is not an allowed image type', async () => {
    const cookie = await signUpSupplier(supplier);
    const productId = await createProduct(cookie);

    const res = await request(app)
      .post(`/api/products/${productId}/image`)
      .set('Cookie', cookie)
      .attach('image', Buffer.from('not-an-image'), {
        filename: 'notes.pdf',
        contentType: 'application/pdf',
      });

    expect(res.status).toBe(400);
    expect(uploadToR2).not.toHaveBeenCalled();
  });

  it('rejects a supplier who does not own the product', async () => {
    const ownerCookie = await signUpSupplier(supplier);
    const productId = await createProduct(ownerCookie);
    const intruderCookie = await signUpSupplier(otherSupplier);

    const res = await request(app)
      .post(`/api/products/${productId}/image`)
      .set('Cookie', intruderCookie)
      .attach('image', Buffer.from('fake'), { filename: 'x.jpg', contentType: 'image/jpeg' });

    expect(res.status).toBe(403);
    expect(uploadToR2).not.toHaveBeenCalled();
  });

  it('rejects unauthenticated requests', async () => {
    const cookie = await signUpSupplier(supplier);
    const productId = await createProduct(cookie);

    const res = await request(app)
      .post(`/api/products/${productId}/image`)
      .attach('image', Buffer.from('fake'), { filename: 'x.jpg', contentType: 'image/jpeg' });

    expect(res.status).toBe(401);
  });
});
