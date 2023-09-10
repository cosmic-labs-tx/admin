/*
  Warnings:

  - A unique constraint covering the columns `[name]` on the table `Client` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "User" DROP CONSTRAINT "User_clientId_fkey";

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "clientId" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Client_name_key" ON "Client"("name");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE SET NULL ON UPDATE CASCADE;
