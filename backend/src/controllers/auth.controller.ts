import type {Request , Response , NextFunction} from 'express'
import prisma from '../lib/prisma.js';
import { hashPassword, comparePassword } from '../utils/password.js';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../utils/jwt.js';
import type { SignupInput, LoginInput } from '../schemas/auth.schema.js';

const ACCESS_TOKEN_MAX_AGE = 15 * 60 * 1000; // 15 minutes
const REFRESH_TOKEN_MAX_AGE = 7 * 24 * 60 * 60 * 1000; // 7 days

function setAuthCookies(res: Response, accessToken: string, refreshToken: string){
    res.cookie('accessToken', accessToken, {
       httpOnly: true, 
       secure: process.env.NODE_ENV === 'production',
       sameSite: 'strict',
       maxAge: ACCESS_TOKEN_MAX_AGE,
    }); 

    res.cookie('refreshToken', refreshToken, {
       httpOnly: true,
       secure: process.env.NODE_ENV === 'production',
       sameSite: 'strict',
       maxAge: REFRESH_TOKEN_MAX_AGE,
    })
}

function clearAuthCookies(res: Response){
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');
}

export async function signup(req: Request, res:Response){
    try{
    const data = req.body as SignupInput;

    const existingUser = await prisma.user.findUnique({
        where: {email: data.email}
    }); 

    if(existingUser){
        return res.status(409).json({ message: 'Email already registered' });
    }

    const hashedPassword = await hashPassword(data.password);

    const user = await prisma.user.create({
    data: {
        email: data.email,
        password: hashedPassword,
        name: data.name,
        businessName: data.businessName,
        phone: data.phone,
        role: data.role,
    },
    });

    const accessToken = signAccessToken({userId: user.id, role: user.role});
    const refreshToken = signRefreshToken({ userId: user.id, role: user.role }); 

    setAuthCookies(res , accessToken , refreshToken); 

    return res.status(201).json({
    message: 'Signup successful',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });
    } catch (error) {
       console.error('Signup error:', error);
       return res.status(500).json({ message: 'Something went wrong during signup' });
    }
}

export async function login(req: Request, res: Response) {
    try{
        const data = req.body as LoginInput; 

        const user = await prisma.user.findUnique({where: { email: data.email },
    });

    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const isPasswordValid = await comparePassword(data.password , user.password); 
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const accessToken = signAccessToken({ userId: user.id, role: user.role });
    const refreshToken = signRefreshToken({ userId: user.id, role: user.role });

    setAuthCookies(res, accessToken, refreshToken);

    return res.status(200).json({
      message: 'Login successful',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });
    } catch(error) {
        console.error('Login error:', error);
        return res.status(500).json({ message: 'Something went wrong during login' });
    }
}

export async function refresh(req: Request, res: Response){
    try{
        const token = req.cookies?.refreshToken as string | undefined; 
        
        if(!token){
            return res.status(401).json({ message: 'No refresh token provided' });
        }

        let payload; 
        try{
            payload = verifyRefreshToken(token);
        } catch {
            clearAuthCookies(res);
            return res.status(401).json({ message: 'Invalid or expired refresh token' });
        }

        const user = await prisma.user.findUnique({
            where: { id: payload.userId },
        }); 

        if (!user) {
           clearAuthCookies(res);
           return res.status(401).json({ message: 'User no longer exists' });
        }

     const newAccessToken = signAccessToken({ userId: user.id, role: user.role });
     const newRefreshToken = signRefreshToken({ userId: user.id, role: user.role });

     setAuthCookies(res, newAccessToken, newRefreshToken);

     return res.status(200).json({ message: 'Token refreshed' });
    } catch (error) {
      console.error('Refresh token error:', error);
      return res.status(500).json({ message: 'Something went wrong while refreshing token' });
    }
}

export async function logout(_req: Request, res: Response) {
    try {
      clearAuthCookies(res);
      return res.status(200).json({ message: 'Logged out successfully' });
    } catch (error) {
      console.error('Logout error:', error);
      return res.status(500).json({ message: 'Something went wrong during logout' });
  }
}