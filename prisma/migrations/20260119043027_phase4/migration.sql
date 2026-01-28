-- CreateTable
CREATE TABLE "Building" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "managementCompanyId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "localPhone" TEXT,
    "jurisdiction" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Building_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UnitCategory" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UnitCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UnitStatus" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UnitStatus_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UnitEquipmentType" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UnitEquipmentType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UnitBrand" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UnitBrand_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Unit" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "buildingId" TEXT NOT NULL,
    "identifier" TEXT NOT NULL,
    "description" TEXT,
    "serialNumber" TEXT,
    "unitCategoryId" TEXT NOT NULL,
    "unitStatusId" TEXT NOT NULL,
    "equipmentTypeId" TEXT NOT NULL,
    "brandId" TEXT NOT NULL,
    "underContract" BOOLEAN NOT NULL DEFAULT false,
    "agreementStartDate" TIMESTAMP(3),
    "agreementEndDate" TIMESTAMP(3),
    "phoneLineService" BOOLEAN NOT NULL DEFAULT false,
    "folderUrl" TEXT,
    "landings" INTEGER,
    "capacity" INTEGER,
    "floorLocation" INTEGER,
    "machineRoomLocation" TEXT,
    "buildingNumber" TEXT,
    "certificateUrl" TEXT,
    "photoUrl" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Unit_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Building_companyId_idx" ON "Building"("companyId");

-- CreateIndex
CREATE INDEX "Building_managementCompanyId_idx" ON "Building"("managementCompanyId");

-- CreateIndex
CREATE UNIQUE INDEX "Building_companyId_managementCompanyId_name_key" ON "Building"("companyId", "managementCompanyId", "name");

-- CreateIndex
CREATE INDEX "UnitCategory_companyId_idx" ON "UnitCategory"("companyId");

-- CreateIndex
CREATE UNIQUE INDEX "UnitCategory_companyId_name_key" ON "UnitCategory"("companyId", "name");

-- CreateIndex
CREATE INDEX "UnitStatus_companyId_idx" ON "UnitStatus"("companyId");

-- CreateIndex
CREATE UNIQUE INDEX "UnitStatus_companyId_name_key" ON "UnitStatus"("companyId", "name");

-- CreateIndex
CREATE INDEX "UnitEquipmentType_companyId_idx" ON "UnitEquipmentType"("companyId");

-- CreateIndex
CREATE UNIQUE INDEX "UnitEquipmentType_companyId_name_key" ON "UnitEquipmentType"("companyId", "name");

-- CreateIndex
CREATE INDEX "UnitBrand_companyId_idx" ON "UnitBrand"("companyId");

-- CreateIndex
CREATE UNIQUE INDEX "UnitBrand_companyId_name_key" ON "UnitBrand"("companyId", "name");

-- CreateIndex
CREATE INDEX "Unit_companyId_idx" ON "Unit"("companyId");

-- CreateIndex
CREATE INDEX "Unit_buildingId_idx" ON "Unit"("buildingId");

-- CreateIndex
CREATE UNIQUE INDEX "Unit_companyId_buildingId_identifier_key" ON "Unit"("companyId", "buildingId", "identifier");

-- AddForeignKey
ALTER TABLE "Building" ADD CONSTRAINT "Building_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Building" ADD CONSTRAINT "Building_managementCompanyId_fkey" FOREIGN KEY ("managementCompanyId") REFERENCES "ManagementCompany"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UnitCategory" ADD CONSTRAINT "UnitCategory_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UnitStatus" ADD CONSTRAINT "UnitStatus_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UnitEquipmentType" ADD CONSTRAINT "UnitEquipmentType_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UnitBrand" ADD CONSTRAINT "UnitBrand_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Unit" ADD CONSTRAINT "Unit_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Unit" ADD CONSTRAINT "Unit_buildingId_fkey" FOREIGN KEY ("buildingId") REFERENCES "Building"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Unit" ADD CONSTRAINT "Unit_unitCategoryId_fkey" FOREIGN KEY ("unitCategoryId") REFERENCES "UnitCategory"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Unit" ADD CONSTRAINT "Unit_unitStatusId_fkey" FOREIGN KEY ("unitStatusId") REFERENCES "UnitStatus"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Unit" ADD CONSTRAINT "Unit_equipmentTypeId_fkey" FOREIGN KEY ("equipmentTypeId") REFERENCES "UnitEquipmentType"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Unit" ADD CONSTRAINT "Unit_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "UnitBrand"("id") ON DELETE CASCADE ON UPDATE CASCADE;
