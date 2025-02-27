/*
  Warnings:

  - The values [NEXTJS] on the enum `ProjectFramework` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "ProjectFramework_new" AS ENUM ('REACT', 'NEXT', 'NODE');
ALTER TABLE "Project" ALTER COLUMN "framework" TYPE "ProjectFramework_new" USING ("framework"::text::"ProjectFramework_new");
ALTER TYPE "ProjectFramework" RENAME TO "ProjectFramework_old";
ALTER TYPE "ProjectFramework_new" RENAME TO "ProjectFramework";
DROP TYPE "ProjectFramework_old";
COMMIT;
