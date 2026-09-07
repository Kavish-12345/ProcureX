import {Router} from 'express';
import {
    signup,
    login,
    refresh,
    logout,
    forgotPassword,
    resetPassword,
    updateProfile,
    changePassword,
} from '../controllers/auth.controller.js';
import { validate } from '../middleware/validate.js';
import { requireAuth } from '../middleware/auth.js';
import {
    signupSchema,
    loginSchema,
    forgotPasswordSchema,
    resetPasswordSchema,
    updateProfileSchema,
    changePasswordSchema,
} from '../schemas/auth.schema.js';
const router = Router();

router.post('/signup', validate(signupSchema), signup);
router.post('/login', validate(loginSchema), login);
router.post('/refresh', refresh);
router.post('/logout', logout);
router.post('/forgot-password', validate(forgotPasswordSchema), forgotPassword);
router.post('/reset-password', validate(resetPasswordSchema), resetPassword);
router.patch('/profile', requireAuth, validate(updateProfileSchema), updateProfile);
router.patch('/profile/password', requireAuth, validate(changePasswordSchema), changePassword);

export default router;
