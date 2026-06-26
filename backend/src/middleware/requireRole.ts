import type { Request, Response, NextFunction } from 'express';

// High Order Function used to verify the role of the user for the correct api endpoint.
export function requireRole(...allowedRoles: Array<'RETAILER' | 'SUPPLIER' | 'ADMIN'>){
    return (req: Request , res: Response , next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Insufficient permissions' });
    }

    next();
    };
}