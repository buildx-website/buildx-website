/*
  Warnings:

  - A unique constraint covering the columns `[name]` on the table `Models` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Models_name_key" ON "Models"("name");
