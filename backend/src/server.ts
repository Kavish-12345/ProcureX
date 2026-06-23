import http from 'http';
import app from './app.js';
import prisma from './lib/prisma.js';

const PORT = process.env.PORT || 3000;
const server = http.createServer(app);

async function main() {
  try {
    await prisma.$connect();
    console.log('Database connected');

    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

process.on('SIGINT', async () => {
  console.log('SIGINT received. Shutting down...');
  await prisma.$disconnect();
  server.close(() => process.exit(0));
});

process.on('SIGTERM', async () => {
  console.log('SIGTERM received. Shutting down...');
  await prisma.$disconnect();
  server.close(() => process.exit(0));
});

main();