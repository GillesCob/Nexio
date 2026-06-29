-- AlterTable
ALTER TABLE "Company" ADD COLUMN     "companyType" TEXT;

-- AlterTable
ALTER TABLE "Contact" ADD COLUMN     "contactedAt" TIMESTAMP(3),
ADD COLUMN     "flux" TEXT,
ADD COLUMN     "fluxConfidence" DOUBLE PRECISION,
ADD COLUMN     "location" TEXT,
ADD COLUMN     "relanceCount" INTEGER NOT NULL DEFAULT 0;
