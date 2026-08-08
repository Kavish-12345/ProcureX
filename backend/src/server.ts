import './config/index.js';
import http from 'http';
import app from './app.js';
import prisma from './lib/prisma.js';
import logger from './lib/logger.js';

const PORT = process.env.PORT || 3000;
const server = http.createServer(app);

async function main() {
  try {
    await prisma.$connect();
    logger.info('Database connected');

    server.listen(PORT, () => {
      logger.info(`Server running on port ${PORT}`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

process.on('SIGINT', async () => {
  logger.info('SIGINT received. Shutting down...');
  await prisma.$disconnect();
  server.close(() => process.exit(0));
});

process.on('SIGTERM', async () => {
  logger.info('SIGTERM received. Shutting down...');
  await prisma.$disconnect();
  server.close(() => process.exit(0));
});

// Safety net for anything that escapes Express entirely (e.g. a throw inside
// a callback, a timer, or a rejected promise nobody awaited). Without this,
// Node either crashes with a bare stack trace or, worse, keeps running in a
// broken state.
process.on('uncaughtException', (error) => {
  logger.error('Uncaught exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason) => {
  logger.error('Unhandled promise rejection:', reason);
  process.exit(1);
});

main();