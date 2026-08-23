import { config } from 'dotenv';
import { execSync } from 'node:child_process';

// Jest `globalSetup`: runs once, in its own process, before any test file
// or other setup file. Applies your existing Prisma migrations to the test
// database so its schema matches prisma/schema.prisma before tests run.
export default async function globalSetup() {
  config({ path: '.env.test' });

  execSync('npx prisma migrate deploy', {
    env: process.env,
    stdio: 'inherit',
  });
}
