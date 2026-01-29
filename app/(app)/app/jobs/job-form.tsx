"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { scheduledJobSchema } from "@/lib/validators";
import { createJobAction, updateJobAction } from "./actions";

type JobValues = z.infer<typeof scheduledJobSchema>;

type JobFormProps = {
  jobId?: string;
  initialValues?: Partial<JobValues>;
  managementCompanies: { id: string; name: string }[];
  buildings: { id: string; name: string; managementCompanyId: string }[];
  units: { id: string; identifier: string; buildingId: string }[];
  mechanics: { id: string; firstName: string; lastName: string }[];
  readOnly?: boolean;
};

export default function JobForm({
  jobId,
  initialValues,
  managementCompanies,
  buildings,
  units,
  mechanics,
  readOnly
}: JobFormProps) {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const form = useForm<JobValues>({
    resolver: zodResolver(scheduledJobSchema),
    defaultValues: {
      title: initialValues?.title ?? "",
      description: initialValues?.description ?? "",
      managementCompanyId: initialValues?.managementCompanyId ?? "",
      buildingId: initialValues?.buildingId ?? "",
      unitId: initialValues?.unitId ?? "",
      mechanicId: initialValues?.mechanicId ?? "",
      scheduledDate: initialValues?.scheduledDate ?? "",
      scheduledStartTime: initialValues?.scheduledStartTime ?? "",
      scheduledEndTime: initialValues?.scheduledEndTime ?? "",
      status: initialValues?.status ?? "SCHEDULED",
      priority: initialValues?.priority ?? "NORMAL",
      jobType: initialValues?.jobType ?? "MAINTENANCE",
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

  const onSubmit = (values: JobValues) => {
    if (readOnly) return;
    setError(null);
    startTransition(async () => {
      const result = jobId
        ? await updateJobAction(jobId, values)
        : await createJobAction(values);
      if (result?.error) {
        setError(result.error);
      }
    });
  };

  return (
    <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
      <div className="grid gap-4 md:grid-cols-2">
        {/* Title */}
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            placeholder="Brief description of the job"
            disabled={readOnly}
            {...form.register("title")}
          />
          {form.formState.errors.title ? (
            <p className="text-xs text-ember">{form.formState.errors.title.message}</p>
          ) : null}
        </div>

        {/* Job Type & Priority */}
        <div className="space-y-2">
          <Label htmlFor="jobType">Job type</Label>
          <select
            id="jobType"
            disabled={readOnly}
            className="flex h-10 w-full rounded-xl border border-ink/15 bg-white px-3 py-2 text-sm text-ink shadow-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/20"
            {...form.register("jobType")}
          >
            <option value="MAINTENANCE">Maintenance</option>
            <option value="INSPECTION">Inspection</option>
            <option value="EMERGENCY">Emergency</option>
            <option value="CALLBACK">Callback</option>
            <option value="OTHER">Other</option>
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="priority">Priority</Label>
          <select
            id="priority"
            disabled={readOnly}
            className="flex h-10 w-full rounded-xl border border-ink/15 bg-white px-3 py-2 text-sm text-ink shadow-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/20"
            {...form.register("priority")}
          >
            <option value="LOW">Low</option>
            <option value="NORMAL">Normal</option>
            <option value="HIGH">High</option>
            <option value="URGENT">Urgent</option>
          </select>
        </div>

        {/* Management Company */}
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

        {/* Building & Unit */}
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
          <Label htmlFor="unitId">Unit (optional)</Label>
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
        </div>

        {/* Schedule */}
        <div className="space-y-2">
          <Label htmlFor="scheduledDate">Scheduled date</Label>
          <Input
            id="scheduledDate"
            type="date"
            disabled={readOnly}
            {...form.register("scheduledDate")}
          />
          {form.formState.errors.scheduledDate ? (
            <p className="text-xs text-ember">
              {form.formState.errors.scheduledDate.message}
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
            <option value="SCHEDULED">Scheduled</option>
            <option value="EN_ROUTE">En Route</option>
            <option value="ON_SITE">On Site</option>
            <option value="COMPLETED">Completed</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="scheduledStartTime">Start time</Label>
          <Input
            id="scheduledStartTime"
            type="time"
            disabled={readOnly}
            {...form.register("scheduledStartTime")}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="scheduledEndTime">End time</Label>
          <Input
            id="scheduledEndTime"
            type="time"
            disabled={readOnly}
            {...form.register("scheduledEndTime")}
          />
        </div>

        {/* Mechanic */}
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

        {/* Description */}
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="description">Description</Label>
          <textarea
            id="description"
            disabled={readOnly}
            placeholder="Detailed description of the work to be done"
            className="min-h-[80px] w-full rounded-2xl border border-ink/15 bg-white px-3 py-2 text-sm text-ink shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/20"
            {...form.register("description")}
          />
        </div>

        {/* Notes */}
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="notes">Notes</Label>
          <textarea
            id="notes"
            disabled={readOnly}
            placeholder="Internal notes, dispatch instructions, etc."
            className="min-h-[80px] w-full rounded-2xl border border-ink/15 bg-white px-3 py-2 text-sm text-ink shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/20"
            {...form.register("notes")}
          />
        </div>
      </div>

      {error ? <p className="text-sm text-ember">{error}</p> : null}
      {readOnly ? null : (
        <Button type="submit" disabled={isPending}>
          {isPending ? "Saving..." : jobId ? "Save job" : "Create job"}
        </Button>
      )}
    </form>
  );
}
