-- CreateEnum
CREATE TYPE "ProjectType" AS ENUM ('REACT', 'NEXTJS');

-- CreateEnum
CREATE TYPE "ProjectStatus" AS ENUM ('CREATED', 'DELETED');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "last_login" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP;

-- CreateTable
CREATE TABLE "Project" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ownerId" TEXT NOT NULL,
    "type" "ProjectType" NOT NULL,
    "projectLocation" TEXT NOT NULL,
    "status" "ProjectStatus" NOT NULL,

    CONSTRAINT "Project_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
