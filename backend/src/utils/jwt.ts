import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET as string; 

if(!JWT_SECRET){
    throw new Error('JWT_SECRET is not set in environment variables');
}

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