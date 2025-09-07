/*
  Warnings:

  - You are about to drop the column `name` on the `Geolocations` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "Geolocations_name_key";

-- AlterTable
ALTER TABLE "Geolocations" DROP COLUMN "name";
