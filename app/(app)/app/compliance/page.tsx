import Link from "next/link";
import { redirect } from "next/navigation";

import { Card } from "@/components/ui/card";
import { db } from "@/lib/db";
import { getInspectionComplianceStatus } from "@/lib/derived";
import { getCurrentMembership } from "@/lib/team";

type ComplianceRow = {
  unitId: string;
  unitIdentifier: string;
  managementCompanyName: string;
  buildingName: string;
  lastInspectionDate?: Date | null;
  expirationDate?: Date | null;
  status: "OVERDUE" | "EXPIRING_SOON" | "MISSING";
  inspectionId?: string | null;
};

function formatDate(value?: Date | null) {
  if (!value) return "—";
  return value.toLocaleDateString();
}

export default async function CompliancePage() {
  const { membership } = await getCurrentMembership();

  if (!membership) {
    redirect("/onboarding");
  }

  const units = await db.unit.findMany({
    where: { companyId: membership.companyId, isActive: true },
    include: {
      building: { include: { managementCompany: true } },
      inspections: { orderBy: { inspectionDate: "desc" }, take: 1 }
    }
  });

  const rows: ComplianceRow[] = [];

  for (const unit of units) {
    const latest = unit.inspections[0];
    const derived = getInspectionComplianceStatus(
      latest?.expirationDate,
      Boolean(latest)
    );

    if (derived === "VALID") {
      continue;
    }

    rows.push({
      unitId: unit.id,
      unitIdentifier: unit.identifier,
      managementCompanyName: unit.building.managementCompany.name,
      buildingName: unit.building.name,
      lastInspectionDate: latest?.inspectionDate,
      expirationDate: latest?.expirationDate,
      status: derived,
      inspectionId: latest?.id
    });
  }

  const overdue = rows.filter((row) => row.status === "OVERDUE");
  const expiring = rows.filter((row) => row.status === "EXPIRING_SOON");
  const missing = rows.filter((row) => row.status === "MISSING");

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-ink/60">Compliance</p>
        <h2 className="font-display text-3xl text-ink">Inspection compliance</h2>
        <p className="text-sm text-ink/70">Track overdue and expiring inspections.</p>
      </div>

      <Card className="space-y-4">
        <h3 className="font-display text-2xl text-ink">Overdue</h3>
        {overdue.length === 0 ? (
          <p className="text-sm text-ink/60">No overdue inspections.</p>
        ) : (
          <div className="space-y-3">
            {overdue.map((row) => (
              <Link
                key={row.unitId}
                href={row.inspectionId ? `/app/inspections/${row.inspectionId}` : `/app/units/${row.unitId}`}
                className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-ember/30 bg-white p-4"
              >
                <div>
                  <p className="text-sm font-semibold text-ink">
                    {row.managementCompanyName} - {row.buildingName}
                  </p>
                  <p className="text-xs text-ink/60">Unit {row.unitIdentifier}</p>
                </div>
                <div className="text-xs text-ember">
                  Expired {formatDate(row.expirationDate)}
                </div>
              </Link>
            ))}
          </div>
        )}
      </Card>

      <Card className="space-y-4">
        <h3 className="font-display text-2xl text-ink">Expiring soon</h3>
        {expiring.length === 0 ? (
          <p className="text-sm text-ink/60">No inspections expiring soon.</p>
        ) : (
          <div className="space-y-3">
            {expiring.map((row) => (
              <Link
                key={row.unitId}
                href={row.inspectionId ? `/app/inspections/${row.inspectionId}` : `/app/units/${row.unitId}`}
                className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-clay/30 bg-white p-4"
              >
                <div>
                  <p className="text-sm font-semibold text-ink">
                    {row.managementCompanyName} - {row.buildingName}
                  </p>
                  <p className="text-xs text-ink/60">Unit {row.unitIdentifier}</p>
                </div>
                <div className="text-xs text-ink/70">
                  Expires {formatDate(row.expirationDate)}
                </div>
              </Link>
            ))}
          </div>
        )}
      </Card>

      <Card className="space-y-4">
        <h3 className="font-display text-2xl text-ink">Missing inspections</h3>
        {missing.length === 0 ? (
          <p className="text-sm text-ink/60">No missing inspections.</p>
        ) : (
          <div className="space-y-3">
            {missing.map((row) => (
              <Link
                key={row.unitId}
                href={`/app/units/${row.unitId}`}
                className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-ink/10 bg-white p-4"
              >
                <div>
                  <p className="text-sm font-semibold text-ink">
                    {row.managementCompanyName} - {row.buildingName}
                  </p>
                  <p className="text-xs text-ink/60">Unit {row.unitIdentifier}</p>
                </div>
                <div className="text-xs text-ink/60">No inspection recorded</div>
              </Link>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
