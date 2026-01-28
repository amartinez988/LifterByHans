import Link from "next/link";
import { redirect } from "next/navigation";

import { Card } from "@/components/ui/card";
import { db } from "@/lib/db";
import { getEmergencyDerivedStatus, getInspectionComplianceStatus } from "@/lib/derived";
import { getCurrentMembership } from "@/lib/team";

type AlertItem = {
  id: string;
  type: string;
  detail: string;
  href: string;
  severity: "high" | "medium";
};

export default async function AlertsPage() {
  const { membership } = await getCurrentMembership();

  if (!membership) {
    redirect("/onboarding");
  }

  const [units, emergencies, maintenances] = await Promise.all([
    db.unit.findMany({
      where: { companyId: membership.companyId, isActive: true },
      include: {
        building: { include: { managementCompany: true } },
        inspections: { orderBy: { inspectionDate: "desc" }, take: 1 }
      }
    }),
    db.emergencyCall.findMany({
      where: { companyId: membership.companyId },
      include: {
        managementCompany: true,
        building: true,
        unit: true
      },
      orderBy: { createdAt: "desc" }
    }),
    db.maintenance.findMany({
      where: { companyId: membership.companyId, status: "OPEN" },
      include: {
        managementCompany: true,
        building: true,
        unit: true
      },
      orderBy: { createdAt: "desc" }
    })
  ]);

  const alerts: AlertItem[] = [];

  for (const unit of units) {
    const latest = unit.inspections[0];
    const status = getInspectionComplianceStatus(
      latest?.expirationDate,
      Boolean(latest)
    );
    if (status === "OVERDUE") {
      alerts.push({
        id: `inspection-overdue-${unit.id}`,
        type: "Inspection overdue",
        detail: `${unit.building.managementCompany.name} - ${unit.building.name} - Unit ${unit.identifier}`,
        href: latest ? `/app/inspections/${latest.id}` : `/app/units/${unit.id}`,
        severity: "high"
      });
    }
    if (status === "EXPIRING_SOON") {
      alerts.push({
        id: `inspection-expiring-${unit.id}`,
        type: "Inspection expiring soon",
        detail: `${unit.building.managementCompany.name} - ${unit.building.name} - Unit ${unit.identifier}`,
        href: latest ? `/app/inspections/${latest.id}` : `/app/units/${unit.id}`,
        severity: "medium"
      });
    }
    if (status === "MISSING") {
      alerts.push({
        id: `inspection-missing-${unit.id}`,
        type: "Inspection missing",
        detail: `${unit.building.managementCompany.name} - ${unit.building.name} - Unit ${unit.identifier}`,
        href: `/app/units/${unit.id}`,
        severity: "high"
      });
    }
  }

  for (const call of emergencies) {
    if (getEmergencyDerivedStatus(call.completedAt) === "OPEN") {
      alerts.push({
        id: `emergency-open-${call.id}`,
        type: "Emergency call open",
        detail: `${call.managementCompany.name} - ${call.building.name} - ${call.unit.identifier}`,
        href: `/app/emergency-calls/${call.id}`,
        severity: "high"
      });
    }
  }

  for (const maintenance of maintenances) {
    alerts.push({
      id: `maintenance-open-${maintenance.id}`,
      type: "Maintenance open",
      detail: `${maintenance.managementCompany.name} - ${maintenance.building.name} - ${maintenance.unit.identifier}`,
      href: `/app/maintenance/${maintenance.id}`,
      severity: "medium"
    });
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-ink/60">Alerts</p>
        <h2 className="font-display text-3xl text-ink">Action needed</h2>
        <p className="text-sm text-ink/70">Derived attention items across operations.</p>
      </div>

      <Card className="space-y-4">
        {alerts.length === 0 ? (
          <p className="text-sm text-ink/60">No alerts right now.</p>
        ) : (
          <div className="space-y-3">
            {alerts.map((alert) => (
              <Link
                key={alert.id}
                href={alert.href}
                className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-ink/10 bg-white p-4"
              >
                <div>
                  <p className="text-sm font-semibold text-ink">{alert.type}</p>
                  <p className="text-xs text-ink/60">{alert.detail}</p>
                </div>
                <span
                  className={`text-xs uppercase tracking-[0.3em] ${
                    alert.severity === "high" ? "text-ember" : "text-ink/60"
                  }`}
                >
                  {alert.severity === "high" ? "High" : "Medium"}
                </span>
              </Link>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
