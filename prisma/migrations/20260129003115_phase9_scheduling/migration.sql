-- CreateEnum
CREATE TYPE "JobStatus" AS ENUM ('SCHEDULED', 'EN_ROUTE', 'ON_SITE', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "JobPriority" AS ENUM ('LOW', 'NORMAL', 'HIGH', 'URGENT');

-- CreateEnum
CREATE TYPE "JobType" AS ENUM ('MAINTENANCE', 'INSPECTION', 'EMERGENCY', 'CALLBACK', 'OTHER');

-- CreateTable
CREATE TABLE "ScheduledJob" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "jobCode" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "managementCompanyId" TEXT NOT NULL,
    "buildingId" TEXT NOT NULL,
    "unitId" TEXT,
    "mechanicId" TEXT,
    "scheduledDate" TIMESTAMP(3) NOT NULL,
    "scheduledStartTime" TEXT,
    "scheduledEndTime" TEXT,
    "status" "JobStatus" NOT NULL DEFAULT 'SCHEDULED',
    "priority" "JobPriority" NOT NULL DEFAULT 'NORMAL',
    "jobType" "JobType" NOT NULL DEFAULT 'MAINTENANCE',
    "maintenanceId" TEXT,
    "completedAt" TIMESTAMP(3),
    "notes" TEXT,
    "archivedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ScheduledJob_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JobSequence" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "nextNumber" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "JobSequence_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ScheduledJob_maintenanceId_key" ON "ScheduledJob"("maintenanceId");

-- CreateIndex
CREATE INDEX "ScheduledJob_companyId_idx" ON "ScheduledJob"("companyId");

-- CreateIndex
CREATE INDEX "ScheduledJob_managementCompanyId_idx" ON "ScheduledJob"("managementCompanyId");

-- CreateIndex
CREATE INDEX "ScheduledJob_buildingId_idx" ON "ScheduledJob"("buildingId");

-- CreateIndex
CREATE INDEX "ScheduledJob_unitId_idx" ON "ScheduledJob"("unitId");

-- CreateIndex
CREATE INDEX "ScheduledJob_mechanicId_idx" ON "ScheduledJob"("mechanicId");

-- CreateIndex
CREATE INDEX "ScheduledJob_scheduledDate_idx" ON "ScheduledJob"("scheduledDate");

-- CreateIndex
CREATE INDEX "ScheduledJob_status_idx" ON "ScheduledJob"("status");

-- CreateIndex
CREATE UNIQUE INDEX "ScheduledJob_companyId_jobCode_key" ON "ScheduledJob"("companyId", "jobCode");

-- CreateIndex
CREATE UNIQUE INDEX "JobSequence_companyId_key" ON "JobSequence"("companyId");

-- AddForeignKey
ALTER TABLE "ScheduledJob" ADD CONSTRAINT "ScheduledJob_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScheduledJob" ADD CONSTRAINT "ScheduledJob_managementCompanyId_fkey" FOREIGN KEY ("managementCompanyId") REFERENCES "ManagementCompany"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScheduledJob" ADD CONSTRAINT "ScheduledJob_buildingId_fkey" FOREIGN KEY ("buildingId") REFERENCES "Building"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScheduledJob" ADD CONSTRAINT "ScheduledJob_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES "Unit"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScheduledJob" ADD CONSTRAINT "ScheduledJob_mechanicId_fkey" FOREIGN KEY ("mechanicId") REFERENCES "Mechanic"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScheduledJob" ADD CONSTRAINT "ScheduledJob_maintenanceId_fkey" FOREIGN KEY ("maintenanceId") REFERENCES "Maintenance"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobSequence" ADD CONSTRAINT "JobSequence_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
