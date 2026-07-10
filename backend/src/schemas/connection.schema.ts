import { z } from "zod";

export const createConnectionSchema = z.object({
    supplierId: z.string().uuid('Invalid supplier id'),
});

export type CreateConnectionInput = z.infer<typeof createConnectionSchema>;