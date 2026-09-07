import type {Request , Response , NextFunction} from 'express'
import crypto from 'crypto';
import prismaClientPkg from '@prisma/client';
import prisma from '../lib/prisma.js';
import logger from '../lib/logger.js';
import redis from '../lib/redis.js';
import { config } from '../config/index.js';

const { Prisma } = prismaClientPkg;
import { hashPassword, comparePassword } from '../utils/password.js';
import { signAccessToken, signRefreshToken, verifyRefreshToken, revokeToken, isTokenRevoked } from '../utils/jwt.js';
import type { SignupInput, LoginInput, ForgotPasswordInput, ResetPasswordInput, UpdateProfileInput, ChangePasswordInput } from '../schemas/auth.schema.js';

const RESET_TOKEN_TTL_SECONDS = 15 * 60; // 15 minutes

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
        businessName: user.businessName,
        phone: user.phone,
        role: user.role,
      },
    });
    } catch (error) {
       // The findUnique check above is just a fast-path for the common case — it's
       // not atomic, so two concurrent signups with the same email can both pass it.
       // The unique constraint on email is the real guard; this catches its violation.
       if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
         return res.status(409).json({ message: 'Email already registered' });
       }
       logger.error('Signup error:', error);
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
        businessName: user.businessName,
        phone: user.phone,
        role: user.role,
      },
    });
    } catch(error) {
        logger.error('Login error:', error);
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

        if (await isTokenRevoked(token)) {
            clearAuthCookies(res);
            return res.status(401).json({ message: 'Refresh token has been revoked' });
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
      logger.error('Refresh token error:', error);
      return res.status(500).json({ message: 'Something went wrong while refreshing token' });
    }
}

export async function logout(req: Request, res: Response) {
    try {
      const accessToken = req.cookies?.accessToken as string | undefined;
      const refreshToken = req.cookies?.refreshToken as string | undefined;

      if (accessToken) await revokeToken(accessToken);
      if (refreshToken) await revokeToken(refreshToken);

      clearAuthCookies(res);
      return res.status(200).json({ message: 'Logged out successfully' });
    } catch (error) {
      logger.error('Logout error:', error);
      return res.status(500).json({ message: 'Something went wrong during logout' });
  }
}

// Always responds 200 with the same generic message, whether or not the email
// exists — otherwise this endpoint becomes a free "is this email registered?" oracle.
export async function forgotPassword(req: Request, res: Response) {
    try {
        const { email } = req.body as ForgotPasswordInput;

        const user = await prisma.user.findUnique({ where: { email } });

        if (user) {
            const token = crypto.randomBytes(32).toString('hex');
            await redis.set(`reset:${token}`, user.id, 'EX', RESET_TOKEN_TTL_SECONDS);

            const resetLink = `${config.frontendUrl}/auth/reset-password?token=${token}`;
            logger.info(`Password reset link for ${user.email}: ${resetLink}`);
        }

        return res.status(200).json({
            message: 'If that email is registered, a password reset link has been sent',
        });
    } catch (error) {
        logger.error('Forgot password error:', error);
        return res.status(500).json({ message: 'Something went wrong, please try again' });
    }
}

export async function resetPassword(req: Request, res: Response) {
    try {
        const { token, password } = req.body as ResetPasswordInput;

        const userId = await redis.get(`reset:${token}`);
        if (!userId) {
            return res.status(400).json({ message: 'Invalid or expired reset link' });
        }

        const hashedPassword = await hashPassword(password);

        await prisma.user.update({
            where: { id: userId },
            data: { password: hashedPassword },
        });

        await redis.del(`reset:${token}`);

        return res.status(200).json({ message: 'Password reset successful' });
    } catch (error) {
        logger.error('Reset password error:', error);
        return res.status(500).json({ message: 'Something went wrong, please try again' });
    }
}

export async function updateProfile(req: Request, res: Response) {
    try {
        const data = req.body as UpdateProfileInput;

        const user = await prisma.user.update({
            where: { id: req.user!.userId },
            data,
        });

        return res.status(200).json({
            message: 'Profile updated successfully',
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                businessName: user.businessName,
                phone: user.phone,
                role: user.role,
            },
        });
    } catch (error) {
        logger.error('Update profile error:', error);
        return res.status(500).json({ message: 'Something went wrong while updating profile' });
    }
}

export async function changePassword(req: Request, res: Response) {
    try {
        const { currentPassword, newPassword } = req.body as ChangePasswordInput;

        const user = await prisma.user.findUnique({ where: { id: req.user!.userId } });
        if (!user) {
            return res.status(401).json({ message: 'Not authenticated' });
        }

        const isCurrentValid = await comparePassword(currentPassword, user.password);
        if (!isCurrentValid) {
            return res.status(400).json({ message: 'Current password is incorrect' });
        }

        const hashedPassword = await hashPassword(newPassword);
        await prisma.user.update({
            where: { id: user.id },
            data: { password: hashedPassword },
        });

        return res.status(200).json({ message: 'Password changed successfully' });
    } catch (error) {
        logger.error('Change password error:', error);
        return res.status(500).json({ message: 'Something went wrong while changing password' });
    }
}