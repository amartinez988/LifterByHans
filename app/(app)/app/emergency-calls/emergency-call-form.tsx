"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { emergencyCallSchema, emergencyCallStatusSchema } from "@/lib/validators";
import { createEmergencyCallAction, updateEmergencyCallAction } from "./actions";
import { createEmergencyCallStatusAction } from "./lookups-actions";

type EmergencyValues = z.infer<typeof emergencyCallSchema>;

type EmergencyCallFormProps = {
  emergencyId?: string;
  initialValues?: Partial<EmergencyValues>;
  managementCompanies: { id: string; name: string }[];
  buildings: { id: string; name: string; managementCompanyId: string }[];
  units: { id: string; identifier: string; buildingId: string }[];
  mechanics: { id: string; firstName: string; lastName: string }[];
  statuses: { id: string; name: string }[];
  readOnly?: boolean;
};

export default function EmergencyCallForm({
  emergencyId,
  initialValues,
  managementCompanies,
  buildings,
  units,
  mechanics,
  statuses,
  readOnly
}: EmergencyCallFormProps) {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [statusList, setStatusList] = useState(statuses);
  const [showStatusForm, setShowStatusForm] = useState(false);
  const [statusError, setStatusError] = useState<string | null>(null);
  const [statusPending, setStatusPending] = useState(false);
  const [statusForm, setStatusForm] = useState({ name: "", description: "" });

  const form = useForm<EmergencyValues>({
    resolver: zodResolver(emergencyCallSchema),
    defaultValues: {
      managementCompanyId: initialValues?.managementCompanyId ?? "",
      buildingId: initialValues?.buildingId ?? "",
      unitId: initialValues?.unitId ?? "",
      mechanicId: initialValues?.mechanicId ?? "",
      emergencyCallStatusId: initialValues?.emergencyCallStatusId ?? "",
      callInAt: initialValues?.callInAt ?? "",
      completedAt: initialValues?.completedAt ?? "",
      ticketNumber: initialValues?.ticketNumber ?? "",
      issueDescription: initialValues?.issueDescription ?? "",
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

  const onSubmit = (values: EmergencyValues) => {
    if (readOnly) return;
    setError(null);
    startTransition(async () => {
      const result = emergencyId
        ? await updateEmergencyCallAction(emergencyId, values)
        : await createEmergencyCallAction(values);
      if (result?.error) {
        setError(result.error);
      }
    });
  };

  const handleCreateStatus = async () => {
    const parsed = emergencyCallStatusSchema.safeParse(statusForm);
    if (!parsed.success) {
      setStatusError(parsed.error.errors[0]?.message ?? "Invalid status.");
      return;
    }
    setStatusError(null);
    setStatusPending(true);
    const result = await createEmergencyCallStatusAction(parsed.data);
    setStatusPending(false);
    if (result?.error) {
      setStatusError(result.error);
      return;
    }
    if (result?.item) {
      setStatusList((prev) => [...prev, result.item!]);
      form.setValue("emergencyCallStatusId", result.item.id);
      setStatusForm({ name: "", description: "" });
      setShowStatusForm(false);
    }
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
          <Label htmlFor="callInAt">Call-in time</Label>
          <Input
            id="callInAt"
            type="datetime-local"
            disabled={readOnly}
            {...form.register("callInAt")}
          />
          {form.formState.errors.callInAt ? (
            <p className="text-xs text-ember">{form.formState.errors.callInAt.message}</p>
          ) : null}
        </div>
        <div className="space-y-2">
          <Label htmlFor="completedAt">Completed at</Label>
          <Input
            id="completedAt"
            type="datetime-local"
            disabled={readOnly}
            {...form.register("completedAt")}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="ticketNumber">Ticket number</Label>
          <Input id="ticketNumber" disabled={readOnly} {...form.register("ticketNumber")} />
        </div>
        <div className="space-y-2">
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
          <Label htmlFor="emergencyCallStatusId">Status</Label>
          <select
            id="emergencyCallStatusId"
            disabled={readOnly}
            className="flex h-10 w-full rounded-xl border border-ink/15 bg-white px-3 py-2 text-sm text-ink shadow-sm transition focus-visible:outline-none focus-visible:ring-ink/20"
            {...form.register("emergencyCallStatusId")}
          >
            <option value="">Select status</option>
            {statusList.map((status) => (
              <option key={status.id} value={status.id}>
                {status.name}
              </option>
            ))}
          </select>
          {form.formState.errors.emergencyCallStatusId ? (
            <p className="text-xs text-ember">
              {form.formState.errors.emergencyCallStatusId.message}
            </p>
          ) : null}
          {!readOnly ? (
            <button
              type="button"
              className="text-xs uppercase tracking-[0.3em] text-ink/60"
              onClick={() => setShowStatusForm((prev) => !prev)}
            >
              + Create new status
            </button>
          ) : null}
          {showStatusForm && !readOnly ? (
            <div className="space-y-3 rounded-2xl border border-ink/10 bg-haze p-3">
              <div className="space-y-2">
                <Label htmlFor="new-emergency-status-name">Name</Label>
                <Input
                  id="new-emergency-status-name"
                  value={statusForm.name}
                  onChange={(event) =>
                    setStatusForm((prev) => ({ ...prev, name: event.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-emergency-status-description">Description</Label>
                <Input
                  id="new-emergency-status-description"
                  value={statusForm.description}
                  onChange={(event) =>
                    setStatusForm((prev) => ({
                      ...prev,
                      description: event.target.value
                    }))
                  }
                />
              </div>
              {statusError ? <p className="text-sm text-ember">{statusError}</p> : null}
              <Button type="button" variant="outline" size="sm" onClick={handleCreateStatus}>
                {statusPending ? "Creating..." : "Create status"}
              </Button>
            </div>
          ) : null}
        </div>
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="issueDescription">Issue description</Label>
          <textarea
            id="issueDescription"
            disabled={readOnly}
            className="min-h-[120px] w-full rounded-2xl border border-ink/15 bg-white px-3 py-2 text-sm text-ink shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/20"
            {...form.register("issueDescription")}
          />
          {form.formState.errors.issueDescription ? (
            <p className="text-xs text-ember">
              {form.formState.errors.issueDescription.message}
            </p>
          ) : null}
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
        <Button type="submit" disabled={isPending}>
          {isPending ? "Saving..." : emergencyId ? "Save emergency call" : "Create emergency call"}
        </Button>
      )}
    </form>
  );
}
