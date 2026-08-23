import { config } from 'dotenv';

// Runs before any test file's modules are loaded (Jest `setupFiles`), so that
// when app.ts / lib/prisma.ts eventually import their env vars, they see the
// test database instead of your dev one. dotenv never overrides a variable
// that's already set, so this only matters because it runs first.
config({ path: '.env.test' });
