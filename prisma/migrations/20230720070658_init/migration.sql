/*
  Warnings:

  - You are about to drop the column `trackTim` on the `Track` table. All the data in the column will be lost.
  - Added the required column `trackTime` to the `Track` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Track" DROP COLUMN "trackTim",
ADD COLUMN     "trackTime" INTEGER NOT NULL;
