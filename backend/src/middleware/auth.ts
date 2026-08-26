import type { Request, Response, NextFunction  } from "express";
import { verifyAccessToken, isTokenRevoked } from "../utils/jwt.js";
import type { JwtPayload } from '../utils/jwt.js';
import type { Jwt } from "jsonwebtoken";

// To avoid typsecript errors , and to avoid writing "req.user as any".
declare global{
    namespace Express{
        interface Request{
            user?: JwtPayload
        }
    }
}

// Verification of the user using the access token stored in the cookies.
export async function requireAuth(req: Request, res:Response, next: NextFunction) {
    try{
        const token = req.cookies?.accessToken as string | undefined;
        if (!token) {
           return res.status(401).json({ message: 'Not authenticated' });
        }

        const payload = verifyAccessToken(token);

        if (await isTokenRevoked(token)) {
            return res.status(401).json({ message: 'Token has been revoked' });
        }

        req.user = payload;

        next();
    }catch {
    return res.status(401).json({ message: 'Invalid or expired access token' });
    }
}

