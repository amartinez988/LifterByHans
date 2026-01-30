import { redirect } from "next/navigation";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { db } from "@/lib/db";
import { canEditWorkspace, getCurrentMembership } from "@/lib/team";

import { ImportManagementCompanies } from "./import-management-companies";
import { ImportBuildings } from "./import-buildings";
import { ImportUnits } from "./import-units";
import { ImportMechanics } from "./import-mechanics";
import { ImportContacts } from "./import-contacts";
import { ImportJobs } from "./import-jobs";

export default async function ImportPage() {
  const { membership } = await getCurrentMembership();

  if (!membership) {
    redirect("/onboarding");
  }

  if (!canEditWorkspace(membership.role)) {
    redirect("/app");
  }

  // Get all lookup data for templates and validation
  const [
    managementCompanies,
    buildings,
    units,
    mechanics,
    contacts,
    unitCategories,
    unitStatuses,
    equipmentTypes,
    brands,
    contactCategories,
  ] = await Promise.all([
    db.managementCompany.findMany({
      where: { companyId: membership.companyId, archivedAt: null },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
    db.building.findMany({
      where: { companyId: membership.companyId, archivedAt: null },
      select: { id: true, name: true, managementCompanyId: true, address: true },
      orderBy: { name: "asc" },
    }),
    db.unit.findMany({
      where: { companyId: membership.companyId, archivedAt: null },
      select: { id: true, identifier: true, buildingId: true },
      orderBy: { identifier: "asc" },
    }),
    db.mechanic.findMany({
      where: { companyId: membership.companyId, isActive: true },
      select: { id: true, firstName: true, lastName: true },
      orderBy: { firstName: "asc" },
    }),
    db.contact.findMany({
      where: { companyId: membership.companyId, archivedAt: null },
      select: { id: true, firstName: true, lastName: true, managementCompanyId: true },
      orderBy: { firstName: "asc" },
    }),
    db.unitCategory.findMany({
      where: { companyId: membership.companyId },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
    db.unitStatus.findMany({
      where: { companyId: membership.companyId },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
    db.unitEquipmentType.findMany({
      where: { companyId: membership.companyId },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
    db.unitBrand.findMany({
      where: { companyId: membership.companyId },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
    db.contactCategory.findMany({
      where: { companyId: membership.companyId },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
  ]);

  // Build lookup maps for relationships
  const mcMap = Object.fromEntries(managementCompanies.map(mc => [mc.id, mc.name]));
  const buildingMap = Object.fromEntries(buildings.map(b => [b.id, { name: b.name, mcId: b.managementCompanyId }]));

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-ink/60">Settings</p>
        <h2 className="font-display text-3xl text-ink">Import Data</h2>
        <p className="text-sm text-ink/70">
          Bulk import data from CSV files. Import in order: Management Companies → Buildings → Units → Mechanics → Contacts → Jobs
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Import Wizard</CardTitle>
          <CardDescription>
            Select the type of data you want to import. Download the template, fill in your data, then upload.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="management-companies" className="w-full">
            <TabsList className="grid w-full grid-cols-6 mb-6">
              <TabsTrigger value="management-companies" className="text-xs">
                1. Companies
              </TabsTrigger>
              <TabsTrigger value="buildings" className="text-xs">
                2. Buildings
              </TabsTrigger>
              <TabsTrigger value="units" className="text-xs">
                3. Units
              </TabsTrigger>
              <TabsTrigger value="mechanics" className="text-xs">
                4. Mechanics
              </TabsTrigger>
              <TabsTrigger value="contacts" className="text-xs">
                5. Contacts
              </TabsTrigger>
              <TabsTrigger value="jobs" className="text-xs">
                6. Jobs
              </TabsTrigger>
            </TabsList>

            <TabsContent value="management-companies">
              <ImportManagementCompanies 
                existingCompanies={managementCompanies}
              />
            </TabsContent>

            <TabsContent value="buildings">
              <ImportBuildings
                managementCompanies={managementCompanies}
                existingBuildings={buildings}
              />
            </TabsContent>

            <TabsContent value="units">
              <ImportUnits
                managementCompanies={managementCompanies}
                buildings={buildings.map(b => ({ ...b, managementCompanyName: mcMap[b.managementCompanyId] }))}
                existingUnits={units}
                categories={unitCategories}
                statuses={unitStatuses}
                equipmentTypes={equipmentTypes}
                brands={brands}
              />
            </TabsContent>

            <TabsContent value="mechanics">
              <ImportMechanics
                existingMechanics={mechanics}
              />
            </TabsContent>

            <TabsContent value="contacts">
              <ImportContacts
                managementCompanies={managementCompanies}
                existingContacts={contacts}
                categories={contactCategories}
              />
            </TabsContent>

            <TabsContent value="jobs">
              <ImportJobs
                managementCompanies={managementCompanies}
                buildings={buildings.map(b => ({ ...b, managementCompanyName: mcMap[b.managementCompanyId] }))}
                units={units.map(u => ({ 
                  ...u, 
                  buildingName: buildingMap[u.buildingId]?.name,
                  managementCompanyName: mcMap[buildingMap[u.buildingId]?.mcId]
                }))}
                mechanics={mechanics}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Current Data Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Current Data</CardTitle>
          <CardDescription>Overview of your existing data</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-4 text-center">
            <div className="p-3 bg-ink/5 rounded-lg">
              <p className="text-2xl font-bold text-ink">{managementCompanies.length}</p>
              <p className="text-xs text-ink/60">Companies</p>
            </div>
            <div className="p-3 bg-ink/5 rounded-lg">
              <p className="text-2xl font-bold text-ink">{buildings.length}</p>
              <p className="text-xs text-ink/60">Buildings</p>
            </div>
            <div className="p-3 bg-ink/5 rounded-lg">
              <p className="text-2xl font-bold text-ink">{units.length}</p>
              <p className="text-xs text-ink/60">Units</p>
            </div>
            <div className="p-3 bg-ink/5 rounded-lg">
              <p className="text-2xl font-bold text-ink">{mechanics.length}</p>
              <p className="text-xs text-ink/60">Mechanics</p>
            </div>
            <div className="p-3 bg-ink/5 rounded-lg">
              <p className="text-2xl font-bold text-ink">{contacts.length}</p>
              <p className="text-xs text-ink/60">Contacts</p>
            </div>
            <div className="p-3 bg-ink/5 rounded-lg">
              <p className="text-2xl font-bold text-ink">
                {unitCategories.length + unitStatuses.length + equipmentTypes.length + brands.length}
              </p>
              <p className="text-xs text-ink/60">Lookups</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
