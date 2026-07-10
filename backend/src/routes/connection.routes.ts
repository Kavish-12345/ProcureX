import { Router } from 'express';
import { createConnection, getMyConnections } from '../controllers/connection.controller.js';
import { requireAuth } from '../middleware/auth.js';
import { requireRole } from '../middleware/requireRole.js';
import { validate } from '../middleware/validate.js';
import { createConnectionSchema } from '../schemas/connection.schema.js';

const router = Router();

router.post('/', requireAuth, requireRole('RETAILER'), validate(createConnectionSchema), createConnection);
router.get('/', requireAuth, requireRole('RETAILER', 'SUPPLIER'), getMyConnections);

export default router;

