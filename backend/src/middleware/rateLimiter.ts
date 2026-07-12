import rateLimit from 'express-rate-limit';

export const authRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // max 10 requests per IP per 15 minutes
    message: {
        success: false,
        message: 'Too many attempts, please try again after 15 minutes',
    },
    standardHeaders: true, // sends RateLimit headers in response
    legacyHeaders: false,
}); 