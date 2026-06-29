-- CreateTable
CREATE TABLE "LinkedInSnapshot" (
    "id" TEXT NOT NULL,
    "weekLabel" TEXT NOT NULL,
    "impressions" INTEGER NOT NULL,
    "impressionsVariation" INTEGER NOT NULL,
    "followers" INTEGER NOT NULL,
    "followersVariation" INTEGER NOT NULL,
    "profileViews" INTEGER NOT NULL,
    "profileViewsVariation" INTEGER NOT NULL,
    "searchAppearances" INTEGER NOT NULL,
    "searchAppearancesVariation" INTEGER NOT NULL,
    "postsCount" INTEGER NOT NULL,
    "commentsCount" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,

    CONSTRAINT "LinkedInSnapshot_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "LinkedInSnapshot" ADD CONSTRAINT "LinkedInSnapshot_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
