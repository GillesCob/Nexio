-- AlterTable
ALTER TABLE "JobOffer" ADD COLUMN     "score" INTEGER,
ADD COLUMN     "scoreComment" TEXT,
ADD COLUMN     "scoreGaps" TEXT[],
ADD COLUMN     "scoreMatches" TEXT[];
