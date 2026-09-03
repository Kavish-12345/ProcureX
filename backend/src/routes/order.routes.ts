import { Router } from 'express';
import {
  createOrder,
  updateOrderStatus,
  getMyOrdersAsRetailer,
  getMyOrdersAsSupplier,
  getOrderById,
} from '../controllers/order.controller.js';
import { requireAuth } from '../middleware/auth.js';
import { requireRole } from '../middleware/requireRole.js';
import { validate } from '../middleware/validate.js';
import { createOrderSchema, updateOrderStatusSchema } from '../schemas/order.schema.js';

const router = Router();

// Retailer places an order
router.post('/', requireAuth, requireRole('RETAILER'), validate(createOrderSchema), createOrder);

// Supplier updates order status; retailer may cancel their own pending order
router.patch('/:id/status', requireAuth, requireRole('SUPPLIER', 'RETAILER'), validate(updateOrderStatusSchema), updateOrderStatus);

// Retailer views their own orders
router.get('/retailer/me', requireAuth, requireRole('RETAILER'), getMyOrdersAsRetailer);

// Supplier views their own orders
router.get('/supplier/me', requireAuth, requireRole('SUPPLIER'), getMyOrdersAsSupplier);

// Either party on the order can view it by id
router.get('/:id', requireAuth, getOrderById);

export default router;