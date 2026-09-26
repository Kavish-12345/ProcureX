import { Router } from 'express';
import {
  getAllUsers,
  getAllOrders,
  getPlatformStats,
  setUserActive,
} from '../controllers/admin.controller.js';
import { requireAuth } from '../middleware/auth.js';
import { requireRole } from '../middleware/requireRole.js';
import { validate } from '../middleware/validate.js';
import { setUserActiveSchema } from '../schemas/admin.schema.js';

const router = Router();

// This role check is the actual security boundary for the whole admin surface —
// the frontend's route guard is only there to avoid rendering a broken page.
router.get('/users', requireAuth, requireRole('ADMIN'), getAllUsers);
router.get('/orders', requireAuth, requireRole('ADMIN'), getAllOrders);
router.get('/stats', requireAuth, requireRole('ADMIN'), getPlatformStats);
router.patch(
  '/users/:id/active',
  requireAuth,
  requireRole('ADMIN'),
  validate(setUserActiveSchema),
  setUserActive
);

export default router;
