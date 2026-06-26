import type { Request, Response, NextFunction  } from "express";
import { verifyAccessToken } from "../utils/jwt.js";
import type { JwtPayload } from '../utils/jwt.js';
import type { Jwt } from "jsonwebtoken";

declare global{
    namespace Express{
        interface Request{
            user?: JwtPayload
        }
    }
}

export function requireAuth(req: Request, res:Response, next: NextFunction) {
    try{
        const token = req.cookies?.accessToken as string | undefined; 
        if (!token) {
           return res.status(401).json({ message: 'Not authenticated' });
        }   

        const payload = verifyAccessToken(token); 
        req.user = payload;

        next();
    }catch {
    return res.status(401).json({ message: 'Invalid or expired access token' });
    }
}

