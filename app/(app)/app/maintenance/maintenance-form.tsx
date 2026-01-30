"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { maintenanceSchema } from "@/lib/validators";
import { createMaintenanceAction, updateMaintenanceAction } from "./actions";

type MaintenanceValues = z.infer<typeof maintenanceSchema>;

type MaintenanceFormProps = {
  maintenanceId?: string;
  initialValues?: Partial<MaintenanceValues>;
  managementCompanies: { id: string; name: string }[];
  buildings: { id: string; name: string; managementCompanyId: string }[];
  units: { id: string; identifier: string; buildingId: string }[];
  mechanics: { id: string; firstName: string; lastName: string }[];
  readOnly?: boolean;
};

export default function MaintenanceForm({
  maintenanceId,
  initialValues,
  managementCompanies,
  buildings,
  units,
  mechanics,
  readOnly
}: MaintenanceFormProps) {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const form = useForm<MaintenanceValues>({
    resolver: zodResolver(maintenanceSchema),
    defaultValues: {
      managementCompanyId: initialValues?.managementCompanyId ?? "",
      buildingId: initialValues?.buildingId ?? "",
      unitId: initialValues?.unitId ?? "",
      mechanicId: initialValues?.mechanicId ?? "",
      status: initialValues?.status ?? "OPEN",
      maintenanceDate: initialValues?.maintenanceDate ?? "",
      notes: initialValues?.notes ?? ""
    }
  });

  const watchManagementCompanyId = form.watch("managementCompanyId");
  const watchBuildingId = form.watch("buildingId");

  const filteredBuildings = useMemo(
    () =>
      buildings.filter(
        (building) => building.managementCompanyId === watchManagementCompanyId
      ),
    [buildings, watchManagementCompanyId]
  );

  const filteredUnits = useMemo(
    () => units.filter((unit) => unit.buildingId === watchBuildingId),
    [units, watchBuildingId]
  );

  useEffect(() => {
    if (
      watchManagementCompanyId &&
      !filteredBuildings.find((building) => building.id === watchBuildingId)
    ) {
      form.setValue("buildingId", "");
      form.setValue("unitId", "");
    }
  }, [filteredBuildings, watchManagementCompanyId, watchBuildingId, form]);

  useEffect(() => {
    const currentUnitId = form.getValues("unitId");
    if (currentUnitId && !filteredUnits.find((unit) => unit.id === currentUnitId)) {
      form.setValue("unitId", "");
    }
  }, [filteredUnits, form]);

  const onSubmit = (values: MaintenanceValues) => {
    if (readOnly) return;
    setError(null);
    startTransition(async () => {
      const result = maintenanceId
        ? await updateMaintenanceAction(maintenanceId, values)
        : await createMaintenanceAction(values);
      if (result?.error) {
        setError(result.error);
      }
    });
  };

  return (
    <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="managementCompanyId">Management company</Label>
          <select
            id="managementCompanyId"
            disabled={readOnly}
            className="flex h-10 w-full rounded-xl border border-ink/15 bg-white px-3 py-2 text-sm text-ink shadow-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/20"
            {...form.register("managementCompanyId")}
          >
            <option value="">Select company</option>
            {managementCompanies.map((company) => (
              <option key={company.id} value={company.id}>
                {company.name}
              </option>
            ))}
          </select>
          {form.formState.errors.managementCompanyId ? (
            <p className="text-xs text-ember">
              {form.formState.errors.managementCompanyId.message}
            </p>
          ) : null}
        </div>
        <div className="space-y-2">
          <Label htmlFor="buildingId">Building</Label>
          <select
            id="buildingId"
            disabled={readOnly || !watchManagementCompanyId}
            className="flex h-10 w-full rounded-xl border border-ink/15 bg-white px-3 py-2 text-sm text-ink shadow-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/20"
            {...form.register("buildingId")}
          >
            <option value="">Select building</option>
            {filteredBuildings.map((building) => (
              <option key={building.id} value={building.id}>
                {building.name}
              </option>
            ))}
          </select>
          {form.formState.errors.buildingId ? (
            <p className="text-xs text-ember">{form.formState.errors.buildingId.message}</p>
          ) : null}
        </div>
        <div className="space-y-2">
          <Label htmlFor="unitId">Unit</Label>
          <select
            id="unitId"
            disabled={readOnly || !watchBuildingId}
            className="flex h-10 w-full rounded-xl border border-ink/15 bg-white px-3 py-2 text-sm text-ink shadow-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/20"
            {...form.register("unitId")}
          >
            <option value="">Select unit</option>
            {filteredUnits.map((unit) => (
              <option key={unit.id} value={unit.id}>
                {unit.identifier}
              </option>
            ))}
          </select>
          {form.formState.errors.unitId ? (
            <p className="text-xs text-ember">{form.formState.errors.unitId.message}</p>
          ) : null}
        </div>
        <div className="space-y-2">
          <Label htmlFor="maintenanceDate">Maintenance date</Label>
          <Input
            id="maintenanceDate"
            type="date"
            disabled={readOnly}
            {...form.register("maintenanceDate")}
          />
          {form.formState.errors.maintenanceDate ? (
            <p className="text-xs text-ember">
              {form.formState.errors.maintenanceDate.message}
            </p>
          ) : null}
        </div>
        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <select
            id="status"
            disabled={readOnly}
            className="flex h-10 w-full rounded-xl border border-ink/15 bg-white px-3 py-2 text-sm text-ink shadow-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/20"
            {...form.register("status")}
          >
            <option value="OPEN">Open</option>
            <option value="COMPLETED">Completed</option>
          </select>
        </div>
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="mechanicId">Mechanic</Label>
          <select
            id="mechanicId"
            disabled={readOnly}
            className="flex h-10 w-full rounded-xl border border-ink/15 bg-white px-3 py-2 text-sm text-ink shadow-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/20"
            {...form.register("mechanicId")}
          >
            <option value="">Unassigned</option>
            {mechanics.map((mechanic) => (
              <option key={mechanic.id} value={mechanic.id}>
                {mechanic.firstName} {mechanic.lastName}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="notes">Notes</Label>
          <textarea
            id="notes"
            disabled={readOnly}
            className="min-h-[120px] w-full rounded-2xl border border-ink/15 bg-white px-3 py-2 text-sm text-ink shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/20"
            {...form.register("notes")}
          />
        </div>
      </div>

      {error ? <p className="text-sm text-ember">{error}</p> : null}
      {readOnly ? null : (
        <Button type="submit" disabled={isPending} loading={isPending}>
          {maintenanceId ? "Save maintenance" : "Create maintenance"}
        </Button>
      )}
    </form>
  );
}
