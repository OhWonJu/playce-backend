-- AlterTable
ALTER TABLE "Track" ADD COLUMN     "playListId" TEXT;

-- AddForeignKey
ALTER TABLE "Track" ADD CONSTRAINT "Track_playListId_fkey" FOREIGN KEY ("playListId") REFERENCES "PlayList"("id") ON DELETE SET NULL ON UPDATE CASCADE;
