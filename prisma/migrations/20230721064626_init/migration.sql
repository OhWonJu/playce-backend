/*
  Warnings:

  - You are about to drop the column `playListId` on the `Track` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Track" DROP CONSTRAINT "Track_playListId_fkey";

-- AlterTable
ALTER TABLE "PlayList" ADD COLUMN     "tracks" JSONB[];

-- AlterTable
ALTER TABLE "Track" DROP COLUMN "playListId";
