import { Router } from 'express';
import {
  createProduct,
  getMyProducts,
  getProductById,
  updateProduct,
  deleteProduct,
} from '../controllers/product.controller.js';
import { requireAuth } from '../middleware/auth.js';
import { requireRole } from '../middleware/requireRole.js';
import { validate } from '../middleware/validate.js';
import { createProductSchema, updateProductSchema } from '../schemas/product.schema.js';

const router = Router(); 

// Public route requiring no auth 
router.get('/:id', getProductById);

// Supplier authenticated routes 
router.post('/', requireAuth, requireRole('SUPPLIER'), validate(createProductSchema), createProduct);
router.get('/', requireAuth, requireRole('SUPPLIER'), getMyProducts);
router.patch('/:id', requireAuth, requireRole('SUPPLIER'), validate(updateProductSchema), updateProduct);
router.delete('/:id', requireAuth, requireRole('SUPPLIER'), deleteProduct);

export default router;

