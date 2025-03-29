/*
  Warnings:

  - You are about to drop the column `userId` on the `Models` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Models" DROP CONSTRAINT "Models_userId_fkey";

-- DropIndex
DROP INDEX "Models_userId_key";

-- AlterTable
ALTER TABLE "Models" DROP COLUMN "userId";

-- CreateTable
CREATE TABLE "UserModels" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "modelId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserModels_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserModels_userId_key" ON "UserModels"("userId");

-- AddForeignKey
ALTER TABLE "UserModels" ADD CONSTRAINT "UserModels_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserModels" ADD CONSTRAINT "UserModels_modelId_fkey" FOREIGN KEY ("modelId") REFERENCES "Models"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
