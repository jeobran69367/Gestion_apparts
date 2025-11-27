-- CreateTable
CREATE TABLE "public"."availability_periods" (
    "id" SERIAL NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "studioId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "availability_periods_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."availability_periods" ADD CONSTRAINT "availability_periods_studioId_fkey" FOREIGN KEY ("studioId") REFERENCES "public"."studios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
