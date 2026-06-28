import { z } from 'zod'; 

export const createOrderSchema = z.object({
    supplierId: z.string().uuid('Invalid supplier id'),
    items: z
    .array(
      z.object({
        productId: z.string().uuid('Invalid product id'),
        quantity: z.number().int().positive('Quantity must be greater than 0'),
      })
    )
    .min(1, 'Order must contain at least one item'),
});

export const updateOrderStatusSchema = z.object({
  status: z.enum(['CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED']),
  dueDate: z.coerce.date().optional(),
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>;
export type UpdateOrderStatusInput = z.infer<typeof updateOrderStatusSchema>;


