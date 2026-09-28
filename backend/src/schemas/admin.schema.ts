import { z } from 'zod';

export const setUserActiveSchema = z.object({
  isActive: z.boolean(),
});

export type SetUserActiveInput = z.infer<typeof setUserActiveSchema>;
