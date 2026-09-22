import rateLimit from 'express-rate-limit';

export const authRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    // The whole test suite hits this from a single IP, so the real limit would
    // start 429-ing signups partway through a run and fail tests for reasons
    // unrelated to what they're asserting.
    max: process.env.NODE_ENV === 'test' ? 10_000 : 10,
    message: {
        success: false,
        message: 'Too many attempts, please try again after 15 minutes',
    },
    standardHeaders: true, // sends RateLimit headers in response
    legacyHeaders: false,
}); 