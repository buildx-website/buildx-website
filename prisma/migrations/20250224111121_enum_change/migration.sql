/*
  Warnings:

  - You are about to drop the column `type` on the `Project` table. All the data in the column will be lost.
  - Added the required column `framework` to the `Project` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "ProjectFramework" AS ENUM ('REACT', 'NEXTJS');

-- AlterEnum
ALTER TYPE "ProjectStatus" ADD VALUE 'ARCHIVED';

-- AlterTable
ALTER TABLE "Project" DROP COLUMN "type",
ADD COLUMN     "framework" "ProjectFramework" NOT NULL;

-- DropEnum
DROP TYPE "ProjectType";
