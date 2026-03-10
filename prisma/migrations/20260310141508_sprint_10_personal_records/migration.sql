-- AlterTable
ALTER TABLE "users" ADD COLUMN     "bestDayMinutes" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "longestSession" INTEGER NOT NULL DEFAULT 0;
