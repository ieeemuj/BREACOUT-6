/*
  Warnings:

  - You are about to drop the column `clue` on the `Geolocations` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `Geolocations` table. All the data in the column will be lost.
  - You are about to drop the column `track` on the `Geolocations` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Geolocations" DROP COLUMN "clue",
DROP COLUMN "name",
DROP COLUMN "track";

-- AlterTable
ALTER TABLE "TeamLogins" ADD COLUMN     "clueno" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "stopped" BOOLEAN NOT NULL DEFAULT false,
ALTER COLUMN "track" SET DATA TYPE TEXT;

-- CreateTable
CREATE TABLE "Clues" (
    "id" TEXT NOT NULL,
    "track" TEXT NOT NULL,
    "name" TEXT,
    "clue" TEXT NOT NULL,
    "geolocationsId" TEXT NOT NULL,
    "clueno" INTEGER NOT NULL,

    CONSTRAINT "Clues_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Admins" (
    "id" INTEGER NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "token" TEXT NOT NULL,

    CONSTRAINT "Admins_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Clues" ADD CONSTRAINT "Clues_geolocationsId_fkey" FOREIGN KEY ("geolocationsId") REFERENCES "Geolocations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
