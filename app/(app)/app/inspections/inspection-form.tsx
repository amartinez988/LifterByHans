"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  inspectionResultSchema,
  inspectionSchema,
  inspectionStatusSchema,
  inspectorSchema
} from "@/lib/validators";
import { createInspectorInlineAction } from "../inspectors/actions";
import { createInspectionAction, updateInspectionAction } from "./actions";
import { createInspectionResultAction, createInspectionStatusAction } from "./lookups-actions";

type InspectionValues = z.infer<typeof inspectionSchema>;

type LookupItem = { id: string; name: string };
type InspectorOption = { id: string; name: string };

type InspectionFormProps = {
  inspectionId?: string;
  initialValues?: Partial<InspectionValues>;
  managementCompanies: { id: string; name: string }[];
  buildings: { id: string; name: string; managementCompanyId: string }[];
  units: { id: string; identifier: string; buildingId: string }[];
  inspectors: InspectorOption[];
  statuses: LookupItem[];
  results: LookupItem[];
  readOnly?: boolean;
};

export default function InspectionForm({
  inspectionId,
  initialValues,
  managementCompanies,
  buildings,
  units,
  inspectors,
  statuses,
  results,
  readOnly
}: InspectionFormProps) {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [inspectorList, setInspectorList] = useState(inspectors);
  const [statusList, setStatusList] = useState(statuses);
  const [resultList, setResultList] = useState(results);
  const [showInspectorForm, setShowInspectorForm] = useState(false);
  const [showStatusForm, setShowStatusForm] = useState(false);
  const [showResultForm, setShowResultForm] = useState(false);
  const [inspectorForm, setInspectorForm] = useState({
    firstName: "",
    lastName: "",
    companyName: "",
    email: "",
    phone: "",
    isActive: true
  });
  const [statusForm, setStatusForm] = useState({ name: "", description: "" });
  const [resultForm, setResultForm] = useState({ name: "", description: "" });
  const [inspectorError, setInspectorError] = useState<string | null>(null);
  const [statusError, setStatusError] = useState<string | null>(null);
  const [resultError, setResultError] = useState<string | null>(null);
  const [inspectorPending, setInspectorPending] = useState(false);
  const [statusPending, setStatusPending] = useState(false);
  const [resultPending, setResultPending] = useState(false);

  const form = useForm<InspectionValues>({
    resolver: zodResolver(inspectionSchema),
    defaultValues: {
      managementCompanyId: initialValues?.managementCompanyId ?? "",
      buildingId: initialValues?.buildingId ?? "",
      unitId: initialValues?.unitId ?? "",
      inspectorId: initialValues?.inspectorId ?? "",
      inspectionStatusId: initialValues?.inspectionStatusId ?? "",
      inspectionResultId: initialValues?.inspectionResultId ?? "",
      inspectionDate: initialValues?.inspectionDate ?? "",
      expirationDate: initialValues?.expirationDate ?? "",
      reportUrl: initialValues?.reportUrl ?? "",
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

  const onSubmit = (values: InspectionValues) => {
    if (readOnly) return;
    setError(null);
    startTransition(async () => {
      const result = inspectionId
        ? await updateInspectionAction(inspectionId, values)
        : await createInspectionAction(values);
      if (result?.error) {
        setError(result.error);
      }
    });
  };

  const handleCreateInspector = async () => {
    const parsed = inspectorSchema.safeParse(inspectorForm);
    if (!parsed.success) {
      setInspectorError(parsed.error.errors[0]?.message ?? "Invalid inspector.");
      return;
    }
    setInspectorError(null);
    setInspectorPending(true);
    const result = await createInspectorInlineAction(parsed.data);
    setInspectorPending(false);
    if (result?.error) {
      setInspectorError(result.error);
      return;
    }
    if (result?.inspector) {
      setInspectorList((prev) => [...prev, result.inspector!]);
      form.setValue("inspectorId", result.inspector.id);
      setInspectorForm({
        firstName: "",
        lastName: "",
        companyName: "",
        email: "",
        phone: "",
        isActive: true
      });
      setShowInspectorForm(false);
    }
  };

  const handleCreateStatus = async () => {
    const parsed = inspectionStatusSchema.safeParse(statusForm);
    if (!parsed.success) {
      setStatusError(parsed.error.errors[0]?.message ?? "Invalid status.");
      return;
    }
    setStatusError(null);
    setStatusPending(true);
    const result = await createInspectionStatusAction(parsed.data);
    setStatusPending(false);
    if (result?.error) {
      setStatusError(result.error);
      return;
    }
    if (result?.item) {
      setStatusList((prev) => [...prev, result.item!]);
      form.setValue("inspectionStatusId", result.item.id);
      setStatusForm({ name: "", description: "" });
      setShowStatusForm(false);
    }
  };

  const handleCreateResult = async () => {
    const parsed = inspectionResultSchema.safeParse(resultForm);
    if (!parsed.success) {
      setResultError(parsed.error.errors[0]?.message ?? "Invalid result.");
      return;
    }
    setResultError(null);
    setResultPending(true);
    const result = await createInspectionResultAction(parsed.data);
    setResultPending(false);
    if (result?.error) {
      setResultError(result.error);
      return;
    }
    if (result?.item) {
      setResultList((prev) => [...prev, result.item!]);
      form.setValue("inspectionResultId", result.item.id);
      setResultForm({ name: "", description: "" });
      setShowResultForm(false);
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
          <Label htmlFor="inspectionDate">Inspection date</Label>
          <Input
            id="inspectionDate"
            type="date"
            disabled={readOnly}
            {...form.register("inspectionDate")}
          />
          {form.formState.errors.inspectionDate ? (
            <p className="text-xs text-ember">
              {form.formState.errors.inspectionDate.message}
            </p>
          ) : null}
        </div>
        <div className="space-y-2">
          <Label htmlFor="expirationDate">Expiration date</Label>
          <Input
            id="expirationDate"
            type="date"
            disabled={readOnly}
            {...form.register("expirationDate")}
          />
        </div>
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="inspectionStatusId">Status</Label>
          <select
            id="inspectionStatusId"
            disabled={readOnly}
            className="flex h-10 w-full rounded-xl border border-ink/15 bg-white px-3 py-2 text-sm text-ink shadow-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/20"
            {...form.register("inspectionStatusId")}
          >
            <option value="">Select status</option>
            {statusList.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
          {form.formState.errors.inspectionStatusId ? (
            <p className="text-xs text-ember">
              {form.formState.errors.inspectionStatusId.message}
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
                <Label htmlFor="new-status-name">Name</Label>
                <Input
                  id="new-status-name"
                  value={statusForm.name}
                  onChange={(event) =>
                    setStatusForm((prev) => ({ ...prev, name: event.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-status-description">Description</Label>
                <Input
                  id="new-status-description"
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
          <Label htmlFor="inspectionResultId">Result</Label>
          <select
            id="inspectionResultId"
            disabled={readOnly}
            className="flex h-10 w-full rounded-xl border border-ink/15 bg-white px-3 py-2 text-sm text-ink shadow-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/20"
            {...form.register("inspectionResultId")}
          >
            <option value="">Select result</option>
            {resultList.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
          {!readOnly ? (
            <button
              type="button"
              className="text-xs uppercase tracking-[0.3em] text-ink/60"
              onClick={() => setShowResultForm((prev) => !prev)}
            >
              + Create new result
            </button>
          ) : null}
          {showResultForm && !readOnly ? (
            <div className="space-y-3 rounded-2xl border border-ink/10 bg-haze p-3">
              <div className="space-y-2">
                <Label htmlFor="new-result-name">Name</Label>
                <Input
                  id="new-result-name"
                  value={resultForm.name}
                  onChange={(event) =>
                    setResultForm((prev) => ({ ...prev, name: event.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-result-description">Description</Label>
                <Input
                  id="new-result-description"
                  value={resultForm.description}
                  onChange={(event) =>
                    setResultForm((prev) => ({
                      ...prev,
                      description: event.target.value
                    }))
                  }
                />
              </div>
              {resultError ? <p className="text-sm text-ember">{resultError}</p> : null}
              <Button type="button" variant="outline" size="sm" onClick={handleCreateResult}>
                {resultPending ? "Creating..." : "Create result"}
              </Button>
            </div>
          ) : null}
        </div>
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="inspectorId">Inspector</Label>
          <select
            id="inspectorId"
            disabled={readOnly}
            className="flex h-10 w-full rounded-xl border border-ink/15 bg-white px-3 py-2 text-sm text-ink shadow-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/20"
            {...form.register("inspectorId")}
          >
            <option value="">Unassigned</option>
            {inspectorList.map((inspector) => (
              <option key={inspector.id} value={inspector.id}>
                {inspector.name}
              </option>
            ))}
          </select>
          {!readOnly ? (
            <button
              type="button"
              className="text-xs uppercase tracking-[0.3em] text-ink/60"
              onClick={() => setShowInspectorForm((prev) => !prev)}
            >
              + Create new inspector
            </button>
          ) : null}
          {showInspectorForm && !readOnly ? (
            <div className="space-y-3 rounded-2xl border border-ink/10 bg-haze p-3">
              <div className="grid gap-3 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="new-inspector-first">First name</Label>
                  <Input
                    id="new-inspector-first"
                    value={inspectorForm.firstName}
                    onChange={(event) =>
                      setInspectorForm((prev) => ({
                        ...prev,
                        firstName: event.target.value
                      }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="new-inspector-last">Last name</Label>
                  <Input
                    id="new-inspector-last"
                    value={inspectorForm.lastName}
                    onChange={(event) =>
                      setInspectorForm((prev) => ({
                        ...prev,
                        lastName: event.target.value
                      }))
                    }
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-inspector-company">Company</Label>
                <Input
                  id="new-inspector-company"
                  value={inspectorForm.companyName}
                  onChange={(event) =>
                    setInspectorForm((prev) => ({
                      ...prev,
                      companyName: event.target.value
                    }))
                  }
                />
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="new-inspector-email">Email</Label>
                  <Input
                    id="new-inspector-email"
                    type="email"
                    value={inspectorForm.email}
                    onChange={(event) =>
                      setInspectorForm((prev) => ({
                        ...prev,
                        email: event.target.value
                      }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="new-inspector-phone">Phone</Label>
                  <Input
                    id="new-inspector-phone"
                    value={inspectorForm.phone}
                    onChange={(event) =>
                      setInspectorForm((prev) => ({
                        ...prev,
                        phone: event.target.value
                      }))
                    }
                  />
                </div>
              </div>
              {inspectorError ? <p className="text-sm text-ember">{inspectorError}</p> : null}
              <Button type="button" variant="outline" size="sm" onClick={handleCreateInspector}>
                {inspectorPending ? "Creating..." : "Create inspector"}
              </Button>
            </div>
          ) : null}
        </div>
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="reportUrl">Report URL</Label>
          <Input id="reportUrl" disabled={readOnly} {...form.register("reportUrl")} />
          {form.formState.errors.reportUrl ? (
            <p className="text-xs text-ember">{form.formState.errors.reportUrl.message}</p>
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
          {isPending ? "Saving..." : inspectionId ? "Save inspection" : "Create inspection"}
        </Button>
      )}
    </form>
  );
}
