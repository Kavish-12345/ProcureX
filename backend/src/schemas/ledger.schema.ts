import {z} from "zod";

export const markPaidSchema = z.object({
  paidAt: z.coerce.date().optional(),
});

export type MarkPaidInput = z.infer<typeof markPaidSchema>;