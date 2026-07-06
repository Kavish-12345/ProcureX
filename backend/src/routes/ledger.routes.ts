import { Router } from 'express';
import { getMyDues, getMyReceivables, markAsPaid } from '../controllers/ledger.controller.js';
import { requireAuth } from '../middleware/auth.js';
import { requireRole } from '../middleware/requireRole.js';
import { validate } from '../middleware/validate.js';
import { markPaidSchema } from '../schemas/ledger.schema.js';

const router = Router(); 

// Retailer sees their dues
router.get('/dues', requireAuth, requireRole('RETAILER'), getMyDues);

// Supplier sees their receivables
router.get('/receivables', requireAuth, requireRole('SUPPLIER'), getMyReceivables);

// Supplier marks an entry as paid
router.patch('/:id/pay', requireAuth, requireRole('SUPPLIER'), validate(markPaidSchema), markAsPaid);

export default router;