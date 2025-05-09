/*
  Warnings:

  - You are about to drop the `jwks` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "Provider" AS ENUM ('OPENAI', 'ANTHROPIC', 'OPENROUTER', 'GEMINI');

-- AlterTable
ALTER TABLE "Models" ADD COLUMN     "provider" "Provider";

-- DropTable
DROP TABLE "jwks";
