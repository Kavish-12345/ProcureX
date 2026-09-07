import {z} from 'zod'

export const signupSchema = z.object({
    email: z 
       .string()
       .trim()
       .toLowerCase()
       .pipe(z.email('Invalid email address')),

    password: z 
       .string()
       .min(8 , 'Password must be at least 8 characters')
       .max(72, 'Password too long')
       .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
       .regex(/[0-9]/, 'Password must contain at least one number'),

    name: z.string().trim().min(2, 'Name must be at least 2 characters').max(100),

    businessName: z
    .string()
    .trim()
    .min(2, 'Business name must be at least 2 characters')
    .max(150),

    phone: z
    .string()
    .trim()
    .regex(/^[6-9]\d{9}$/, 'Enter a valid 10-digit Indian phone number'),

    role: z.enum(['RETAILER', 'SUPPLIER'], {
    message: 'Role must be RETAILER or SUPPLIER',
    }),
})

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().pipe(z.email('Invalid email address')),
  password: z.string().min(1, 'Password is required'),
});

const passwordRules = z
   .string()
   .min(8, 'Password must be at least 8 characters')
   .max(72, 'Password too long')
   .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
   .regex(/[0-9]/, 'Password must contain at least one number');

export const forgotPasswordSchema = z.object({
  email: z.string().trim().toLowerCase().pipe(z.email('Invalid email address')),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Reset token is required'),
  password: passwordRules,
});

export const updateProfileSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(100).optional(),
  businessName: z
    .string()
    .trim()
    .min(2, 'Business name must be at least 2 characters')
    .max(150)
    .optional(),
  phone: z
    .string()
    .trim()
    .regex(/^[6-9]\d{9}$/, 'Enter a valid 10-digit Indian phone number')
    .optional(),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: passwordRules,
});

export type SignupInput = z.infer<typeof signupSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;