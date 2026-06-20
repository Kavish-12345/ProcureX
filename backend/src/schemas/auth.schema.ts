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

export type SignupInput = z.infer<typeof signupSchema>;
export type LoginInput = z.infer<typeof loginSchema>;