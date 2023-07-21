/*
  Warnings:

  - Added the required column `albumType` to the `Album` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Album" ADD COLUMN     "albumType" TEXT NOT NULL;
