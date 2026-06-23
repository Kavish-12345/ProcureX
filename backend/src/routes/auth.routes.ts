import {Router} from 'express';
import { signup, login, refresh, logout } from '../controllers/auth.controller.js';
import { validate } from '../middleware/validate.js';
import { signupSchema, loginSchema } from '../schemas/auth.schema.js';

const router = Router();

router.post('/signup', validate(signupSchema), signup);
router.post('/login', validate(loginSchema), login);
router.post('/refresh', refresh);
router.post('/logout', logout);

export default router;
