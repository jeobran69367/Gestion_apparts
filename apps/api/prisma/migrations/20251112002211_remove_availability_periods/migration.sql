/*
  Warnings:

  - You are about to drop the `availability_periods` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."availability_periods" DROP CONSTRAINT "availability_periods_studioId_fkey";

-- DropTable
DROP TABLE "public"."availability_periods";
