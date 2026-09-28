import 'dotenv/config';

function requireEnv(key: string): string {
    const value = process.env[key];
    if (!value) {
        throw new Error(`Environment variable ${key} is required but not defined.`);
    }
    return value;
}

export const config = {
    port: process.env.PORT || 3000,
    nodeEnv: process.env.NODE_ENV || 'development',
    jwtSecret: requireEnv('JWT_SECRET'),
    databaseUrl: requireEnv('DATABASE_URL'),
    frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
    redisUrl: process.env.REDIS_URL || 'redis://localhost:6379',
    // S3-compatible object storage (currently Supabase Storage). Named
    // generically so switching provider is an .env change, not a code change.
    storageEndpoint: process.env.STORAGE_ENDPOINT || '',
    storageRegion: process.env.STORAGE_REGION || 'us-east-1',
    storageAccessKeyId: process.env.STORAGE_ACCESS_KEY_ID || '',
    storageSecretAccessKey: process.env.STORAGE_SECRET_ACCESS_KEY || '',
    storageBucket: process.env.STORAGE_BUCKET || '',
    storagePublicUrl: process.env.STORAGE_PUBLIC_URL || '',
    gmailUser: process.env.GMAIL_USER || '',
    gmailAppPassword: process.env.GMAIL_APP_PASSWORD || '',
} as const;