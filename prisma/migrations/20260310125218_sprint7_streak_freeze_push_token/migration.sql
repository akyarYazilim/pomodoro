-- AlterTable
ALTER TABLE "users" ADD COLUMN     "lastStreakFreezeUsed" TIMESTAMP(3),
ADD COLUMN     "pushToken" TEXT,
ADD COLUMN     "streakFreezeCount" INTEGER NOT NULL DEFAULT 1;
