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
} as const;