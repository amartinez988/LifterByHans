/*
  Warnings:

  - You are about to drop the column `level` on the `Mechanic` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Mechanic" DROP COLUMN "level",
ADD COLUMN     "mechanicLevelId" TEXT;

-- CreateTable
CREATE TABLE "MechanicLevel" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MechanicLevel_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "MechanicLevel_companyId_idx" ON "MechanicLevel"("companyId");

-- CreateIndex
CREATE UNIQUE INDEX "MechanicLevel_companyId_name_key" ON "MechanicLevel"("companyId", "name");

-- AddForeignKey
ALTER TABLE "Mechanic" ADD CONSTRAINT "Mechanic_mechanicLevelId_fkey" FOREIGN KEY ("mechanicLevelId") REFERENCES "MechanicLevel"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MechanicLevel" ADD CONSTRAINT "MechanicLevel_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
