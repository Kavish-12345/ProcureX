import {z} from "zod";

export const markPaidSchema = z.object({
  paidAt: z.date(),
});

export type MarkPaidInput = z.infer<typeof markPaidSchema>;