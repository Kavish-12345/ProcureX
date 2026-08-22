-- AlterTable
ALTER TABLE "LedgerEntry" ALTER COLUMN "paidAt" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "unit" TEXT NOT NULL;
