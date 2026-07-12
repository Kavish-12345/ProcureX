import jwt from 'jsonwebtoken';
import { config } from '../config/index.js';

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