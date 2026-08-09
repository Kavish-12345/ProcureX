import prisma from '../../lib/prisma.js';

// Runs after the test framework is installed (Jest `setupFilesAfterEnv`), so
// `beforeEach`/`afterAll` are available as globals here.

// Wipe every table before each test so one test's data can never leak into
// the next. RESTART IDENTITY resets auto-increment counters; CASCADE handles
// foreign keys between these tables regardless of the order listed here.
beforeEach(async () => {
  await prisma.$executeRawUnsafe(
    `TRUNCATE TABLE "LedgerEntry", "OrderItem", "Order", "SupplierRetailerConnection", "Product", "User" RESTART IDENTITY CASCADE;`
  );
});

afterAll(async () => {
  await prisma.$disconnect();
});
