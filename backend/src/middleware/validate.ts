import type { Request, Response, NextFunction } from 'express';
import { z } from "zod";

// Reusable validation middleware using Zod schemas.
// Outer function runs once at startup, inner function runs on every request.
export function validate(schema: z.ZodType) {
   return (req: Request, res: Response , next: NextFunction) => {
    const result = schema.safeParse(req.body);

    if(!result.success){
        return res.json({
            message: 'Validation Failed',
            errors: z.treeifyError(result.error),
        });
    }

    req.body = result.data;
    next();
   };
}

