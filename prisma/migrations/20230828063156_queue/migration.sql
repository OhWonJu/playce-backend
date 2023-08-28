-- CreateTable
CREATE TABLE "Queue" (
    "id" TEXT NOT NULL,
    "songCount" INTEGER NOT NULL DEFAULT 0,
    "queueThumbNail" TEXT[],
    "totalPlayTime" INTEGER NOT NULL DEFAULT 0,
    "tracks" JSONB[],
    "userId" TEXT NOT NULL,

    CONSTRAINT "Queue_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Queue_userId_key" ON "Queue"("userId");

-- AddForeignKey
ALTER TABLE "Queue" ADD CONSTRAINT "Queue_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
