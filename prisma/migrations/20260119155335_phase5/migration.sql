-- CreateEnum
CREATE TYPE "MaintenanceStatus" AS ENUM ('OPEN', 'COMPLETED');

-- CreateTable
CREATE TABLE "Mechanic" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "level" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Mechanic_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Maintenance" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "maintenanceCode" TEXT NOT NULL,
    "managementCompanyId" TEXT NOT NULL,
    "buildingId" TEXT NOT NULL,
    "unitId" TEXT NOT NULL,
    "mechanicId" TEXT,
    "status" "MaintenanceStatus" NOT NULL DEFAULT 'OPEN',
    "maintenanceDate" TIMESTAMP(3) NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Maintenance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MaintenanceSequence" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "nextNumber" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "MaintenanceSequence_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Mechanic_companyId_idx" ON "Mechanic"("companyId");

-- CreateIndex
CREATE UNIQUE INDEX "Mechanic_companyId_email_key" ON "Mechanic"("companyId", "email");

-- CreateIndex
CREATE INDEX "Maintenance_companyId_idx" ON "Maintenance"("companyId");

-- CreateIndex
CREATE INDEX "Maintenance_managementCompanyId_idx" ON "Maintenance"("managementCompanyId");

-- CreateIndex
CREATE INDEX "Maintenance_buildingId_idx" ON "Maintenance"("buildingId");

-- CreateIndex
CREATE INDEX "Maintenance_unitId_idx" ON "Maintenance"("unitId");

-- CreateIndex
CREATE UNIQUE INDEX "Maintenance_companyId_maintenanceCode_key" ON "Maintenance"("companyId", "maintenanceCode");

-- CreateIndex
CREATE UNIQUE INDEX "MaintenanceSequence_companyId_key" ON "MaintenanceSequence"("companyId");

-- AddForeignKey
ALTER TABLE "Mechanic" ADD CONSTRAINT "Mechanic_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Maintenance" ADD CONSTRAINT "Maintenance_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Maintenance" ADD CONSTRAINT "Maintenance_managementCompanyId_fkey" FOREIGN KEY ("managementCompanyId") REFERENCES "ManagementCompany"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Maintenance" ADD CONSTRAINT "Maintenance_buildingId_fkey" FOREIGN KEY ("buildingId") REFERENCES "Building"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Maintenance" ADD CONSTRAINT "Maintenance_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES "Unit"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Maintenance" ADD CONSTRAINT "Maintenance_mechanicId_fkey" FOREIGN KEY ("mechanicId") REFERENCES "Mechanic"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MaintenanceSequence" ADD CONSTRAINT "MaintenanceSequence_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
