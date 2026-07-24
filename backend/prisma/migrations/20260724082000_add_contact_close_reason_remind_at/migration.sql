-- CreateEnum
CREATE TYPE "ContactCloseReason" AS ENUM ('not_interested', 'not_now');

-- AlterTable
ALTER TABLE "Contact" ADD COLUMN "closeReason" "ContactCloseReason",
ADD COLUMN "remindAt" TIMESTAMP(3);
