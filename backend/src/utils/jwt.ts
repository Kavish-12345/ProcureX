import jwt from 'jsonwebtoken';
import { config } from '../config/index.js';
import redis from '../lib/redis.js';

const JWT_SECRET =  config.jwtSecret;

export interface JwtPayload{
    userId: string;
    role: 'RETAILER' | 'SUPPLIER' | 'ADMIN';
}

export function signAccessToken(payload: JwtPayload): string{
    return jwt.sign(payload, JWT_SECRET, {expiresIn: '15m'});
}

export function signRefreshToken(payload: JwtPayload): string{
    return jwt.sign(payload, JWT_SECRET, {expiresIn: '7d'});
}

export function verifyAccessToken(token: string): JwtPayload{
    return jwt.verify(token, JWT_SECRET) as JwtPayload;
}

export function verifyRefreshToken(token: string): JwtPayload{
    return jwt.verify(token, JWT_SECRET) as JwtPayload;
}

// Blocklists a token for whatever time it had left before its own expiry —
// no need to remember it any longer than that, since the normal expiry check
// already rejects it after that point anyway.
export async function revokeToken(token: string): Promise<void> {
    const decoded = jwt.decode(token) as (JwtPayload & { exp?: number }) | null;
    if (!decoded?.exp) return;

    const ttlSeconds = decoded.exp - Math.floor(Date.now() / 1000);
    if (ttlSeconds <= 0) return;

    await redis.set(`revoked:${token}`, '1', 'EX', ttlSeconds);
}

export async function isTokenRevoked(token: string): Promise<boolean> {
    const result = await redis.get(`revoked:${token}`);
    return result !== null;
}