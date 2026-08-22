/*
  Warnings:

  - You are about to drop the column `stopped` on the `TeamLogins` table. All the data in the column will be lost.
  - Added the required column `storyline` to the `Clues` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Clues" ADD COLUMN     "storyline" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "TeamLogins" DROP COLUMN "stopped",
ADD COLUMN     "finished" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "finishedAt" TIMESTAMP(3),
ADD COLUMN     "qualified" BOOLEAN NOT NULL DEFAULT false;
