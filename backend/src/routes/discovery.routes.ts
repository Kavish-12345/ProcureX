import { Router } from 'express';
import { browseSuppliers } from '../controllers/discovery.controller.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.get('/suppliers', requireAuth, browseSuppliers);

export default router;