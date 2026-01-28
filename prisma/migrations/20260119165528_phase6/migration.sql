-- CreateTable
CREATE TABLE "Inspector" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "companyName" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Inspector_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InspectionStatus" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "InspectionStatus_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InspectionResult" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "InspectionResult_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Inspection" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "inspectionCode" TEXT NOT NULL,
    "managementCompanyId" TEXT NOT NULL,
    "buildingId" TEXT NOT NULL,
    "unitId" TEXT NOT NULL,
    "inspectorId" TEXT,
    "inspectionStatusId" TEXT NOT NULL,
    "inspectionResultId" TEXT,
    "inspectionDate" TIMESTAMP(3) NOT NULL,
    "expirationDate" TIMESTAMP(3),
    "reportUrl" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Inspection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InspectionSequence" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "nextNumber" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "InspectionSequence_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmergencyCallStatus" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EmergencyCallStatus_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmergencyCall" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "emergencyCode" TEXT NOT NULL,
    "ticketNumber" TEXT,
    "managementCompanyId" TEXT NOT NULL,
    "buildingId" TEXT NOT NULL,
    "unitId" TEXT NOT NULL,
    "mechanicId" TEXT,
    "emergencyCallStatusId" TEXT NOT NULL,
    "callInAt" TIMESTAMP(3) NOT NULL,
    "completedAt" TIMESTAMP(3),
    "issueDescription" TEXT NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EmergencyCall_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmergencyCallSequence" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "nextNumber" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "EmergencyCallSequence_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Inspector_companyId_idx" ON "Inspector"("companyId");

-- CreateIndex
CREATE UNIQUE INDEX "Inspector_companyId_email_key" ON "Inspector"("companyId", "email");

-- CreateIndex
CREATE INDEX "InspectionStatus_companyId_idx" ON "InspectionStatus"("companyId");

-- CreateIndex
CREATE UNIQUE INDEX "InspectionStatus_companyId_name_key" ON "InspectionStatus"("companyId", "name");

-- CreateIndex
CREATE INDEX "InspectionResult_companyId_idx" ON "InspectionResult"("companyId");

-- CreateIndex
CREATE UNIQUE INDEX "InspectionResult_companyId_name_key" ON "InspectionResult"("companyId", "name");

-- CreateIndex
CREATE INDEX "Inspection_companyId_idx" ON "Inspection"("companyId");

-- CreateIndex
CREATE INDEX "Inspection_managementCompanyId_idx" ON "Inspection"("managementCompanyId");

-- CreateIndex
CREATE INDEX "Inspection_buildingId_idx" ON "Inspection"("buildingId");

-- CreateIndex
CREATE INDEX "Inspection_unitId_idx" ON "Inspection"("unitId");

-- CreateIndex
CREATE UNIQUE INDEX "Inspection_companyId_inspectionCode_key" ON "Inspection"("companyId", "inspectionCode");

-- CreateIndex
CREATE UNIQUE INDEX "InspectionSequence_companyId_key" ON "InspectionSequence"("companyId");

-- CreateIndex
CREATE INDEX "EmergencyCallStatus_companyId_idx" ON "EmergencyCallStatus"("companyId");

-- CreateIndex
CREATE UNIQUE INDEX "EmergencyCallStatus_companyId_name_key" ON "EmergencyCallStatus"("companyId", "name");

-- CreateIndex
CREATE INDEX "EmergencyCall_companyId_idx" ON "EmergencyCall"("companyId");

-- CreateIndex
CREATE INDEX "EmergencyCall_managementCompanyId_idx" ON "EmergencyCall"("managementCompanyId");

-- CreateIndex
CREATE INDEX "EmergencyCall_buildingId_idx" ON "EmergencyCall"("buildingId");

-- CreateIndex
CREATE INDEX "EmergencyCall_unitId_idx" ON "EmergencyCall"("unitId");

-- CreateIndex
CREATE UNIQUE INDEX "EmergencyCall_companyId_emergencyCode_key" ON "EmergencyCall"("companyId", "emergencyCode");

-- CreateIndex
CREATE UNIQUE INDEX "EmergencyCallSequence_companyId_key" ON "EmergencyCallSequence"("companyId");

-- AddForeignKey
ALTER TABLE "Inspector" ADD CONSTRAINT "Inspector_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InspectionStatus" ADD CONSTRAINT "InspectionStatus_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InspectionResult" ADD CONSTRAINT "InspectionResult_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Inspection" ADD CONSTRAINT "Inspection_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Inspection" ADD CONSTRAINT "Inspection_managementCompanyId_fkey" FOREIGN KEY ("managementCompanyId") REFERENCES "ManagementCompany"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Inspection" ADD CONSTRAINT "Inspection_buildingId_fkey" FOREIGN KEY ("buildingId") REFERENCES "Building"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Inspection" ADD CONSTRAINT "Inspection_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES "Unit"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Inspection" ADD CONSTRAINT "Inspection_inspectorId_fkey" FOREIGN KEY ("inspectorId") REFERENCES "Inspector"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Inspection" ADD CONSTRAINT "Inspection_inspectionStatusId_fkey" FOREIGN KEY ("inspectionStatusId") REFERENCES "InspectionStatus"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Inspection" ADD CONSTRAINT "Inspection_inspectionResultId_fkey" FOREIGN KEY ("inspectionResultId") REFERENCES "InspectionResult"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InspectionSequence" ADD CONSTRAINT "InspectionSequence_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmergencyCallStatus" ADD CONSTRAINT "EmergencyCallStatus_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmergencyCall" ADD CONSTRAINT "EmergencyCall_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmergencyCall" ADD CONSTRAINT "EmergencyCall_managementCompanyId_fkey" FOREIGN KEY ("managementCompanyId") REFERENCES "ManagementCompany"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmergencyCall" ADD CONSTRAINT "EmergencyCall_buildingId_fkey" FOREIGN KEY ("buildingId") REFERENCES "Building"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmergencyCall" ADD CONSTRAINT "EmergencyCall_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES "Unit"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmergencyCall" ADD CONSTRAINT "EmergencyCall_mechanicId_fkey" FOREIGN KEY ("mechanicId") REFERENCES "Mechanic"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmergencyCall" ADD CONSTRAINT "EmergencyCall_emergencyCallStatusId_fkey" FOREIGN KEY ("emergencyCallStatusId") REFERENCES "EmergencyCallStatus"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmergencyCallSequence" ADD CONSTRAINT "EmergencyCallSequence_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
