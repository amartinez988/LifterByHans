-- CreateTable
CREATE TABLE "ManagementCompany" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "accountNumber" TEXT,
    "website" TEXT,
    "mainPhone" TEXT,
    "emergencyPhone" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ManagementCompany_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContactCategory" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ContactCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Contact" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "managementCompanyId" TEXT NOT NULL,
    "contactCategoryId" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Contact_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ManagementCompany_companyId_idx" ON "ManagementCompany"("companyId");

-- CreateIndex
CREATE UNIQUE INDEX "ManagementCompany_companyId_name_key" ON "ManagementCompany"("companyId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "ManagementCompany_companyId_accountNumber_key" ON "ManagementCompany"("companyId", "accountNumber");

-- CreateIndex
CREATE INDEX "ContactCategory_companyId_idx" ON "ContactCategory"("companyId");

-- CreateIndex
CREATE UNIQUE INDEX "ContactCategory_companyId_name_key" ON "ContactCategory"("companyId", "name");

-- CreateIndex
CREATE INDEX "Contact_companyId_idx" ON "Contact"("companyId");

-- CreateIndex
CREATE INDEX "Contact_managementCompanyId_idx" ON "Contact"("managementCompanyId");

-- CreateIndex
CREATE INDEX "Contact_contactCategoryId_idx" ON "Contact"("contactCategoryId");

-- AddForeignKey
ALTER TABLE "ManagementCompany" ADD CONSTRAINT "ManagementCompany_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContactCategory" ADD CONSTRAINT "ContactCategory_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contact" ADD CONSTRAINT "Contact_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contact" ADD CONSTRAINT "Contact_managementCompanyId_fkey" FOREIGN KEY ("managementCompanyId") REFERENCES "ManagementCompany"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contact" ADD CONSTRAINT "Contact_contactCategoryId_fkey" FOREIGN KEY ("contactCategoryId") REFERENCES "ContactCategory"("id") ON DELETE CASCADE ON UPDATE CASCADE;
