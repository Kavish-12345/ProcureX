import {z} from 'zod'

export const createProductSchema = z.object({
  name: z.string().trim().min(2, 'Product name must be at least 2 characters').max(150),
  description: z.string().trim().max(500).optional(),
  unitPrice: z
    .number()
    .positive('Price must be greater than 0')
    .multipleOf(0.01, 'Price can have at most 2 decimal places'),
  stock: z.number().int().nonnegative('Stock cannot be negative'),
  unit: z.string().trim().min(1, 'Unit is required').max(20),
});

export const updateProductSchema = createProductSchema.partial();
// partial makes every field optional for updation.

export type  CreateProductInput = z.infer<typeof createProductSchema>;
export type  UpdateProductInput = z.infer<typeof updateProductSchema>;