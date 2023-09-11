/*
  Warnings:

  - You are about to drop the column `fields` on the `Lead` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Lead" DROP COLUMN "fields",
ADD COLUMN     "additionalFields" JSONB;
