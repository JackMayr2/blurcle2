-- AlterTable
ALTER TABLE "User" ADD COLUMN     "twitterConnected" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "TwitterProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "twitterId" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "name" TEXT,
    "profileImageUrl" TEXT,
    "description" TEXT,
    "followersCount" INTEGER NOT NULL DEFAULT 0,
    "followingCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TwitterProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Tweet" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tweetId" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "tweetCreatedAt" TIMESTAMP(3) NOT NULL,
    "likeCount" INTEGER NOT NULL DEFAULT 0,
    "retweetCount" INTEGER NOT NULL DEFAULT 0,
    "replyCount" INTEGER NOT NULL DEFAULT 0,
    "quoteCount" INTEGER NOT NULL DEFAULT 0,
    "mediaUrls" TEXT[],
    "processed" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Tweet_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TwitterProfile_userId_key" ON "TwitterProfile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "TwitterProfile_twitterId_key" ON "TwitterProfile"("twitterId");

-- CreateIndex
CREATE UNIQUE INDEX "Tweet_tweetId_key" ON "Tweet"("tweetId");

-- AddForeignKey
ALTER TABLE "TwitterProfile" ADD CONSTRAINT "TwitterProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tweet" ADD CONSTRAINT "Tweet_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
