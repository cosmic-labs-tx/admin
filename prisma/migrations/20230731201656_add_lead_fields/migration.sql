-- CreateEnum
CREATE TYPE "Attribution" AS ENUM ('ORGANIC', 'WORD_OF_MOUTH', 'FACEBOOK', 'INSTAGRAM', 'TWITTER', 'LINKEDIN', 'GOOGLE', 'REFERRAL', 'OTHER');

-- CreateTable
CREATE TABLE "Lead" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "company" TEXT NOT NULL,
    "budget" TEXT NOT NULL,
    "attribution" "Attribution" NOT NULL,
    "attributionNote" TEXT,
    "message" TEXT,
    "phone" TEXT,
    "meta" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Lead_pkey" PRIMARY KEY ("id")
);
