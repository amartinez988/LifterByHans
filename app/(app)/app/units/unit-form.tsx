"use client";

import { useEffect, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { unitLookupSchema, unitSchema } from "@/lib/validators";
import {
  createUnitBrandAction,
  createUnitCategoryAction,
  createUnitEquipmentTypeAction,
  createUnitStatusAction
} from "./lookups-actions";
import { createUnitAction, updateUnitAction } from "./actions";

type UnitValues = z.infer<typeof unitSchema>;

type LookupItem = { id: string; name: string };
type LookupFormState = { name: string; description: string };

type UnitFormProps = {
  buildingId: string;
  categories: LookupItem[];
  statuses: LookupItem[];
  equipmentTypes: LookupItem[];
  brands: LookupItem[];
  unitId?: string;
  initialValues?: Partial<UnitValues>;
  readOnly?: boolean;
};

const emptyLookup: LookupFormState = { name: "", description: "" };

export default function UnitForm({
  buildingId,
  categories,
  statuses,
  equipmentTypes,
  brands,
  unitId,
  initialValues,
  readOnly
}: UnitFormProps) {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [categoryList, setCategoryList] = useState(categories);
  const [statusList, setStatusList] = useState(statuses);
  const [equipmentList, setEquipmentList] = useState(equipmentTypes);
  const [brandList, setBrandList] = useState(brands);
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [showStatusForm, setShowStatusForm] = useState(false);
  const [showEquipmentForm, setShowEquipmentForm] = useState(false);
  const [showBrandForm, setShowBrandForm] = useState(false);
  const [categoryForm, setCategoryForm] = useState<LookupFormState>(emptyLookup);
  const [statusForm, setStatusForm] = useState<LookupFormState>(emptyLookup);
  const [equipmentForm, setEquipmentForm] = useState<LookupFormState>(emptyLookup);
  const [brandForm, setBrandForm] = useState<LookupFormState>(emptyLookup);
  const [categoryError, setCategoryError] = useState<string | null>(null);
  const [statusError, setStatusError] = useState<string | null>(null);
  const [equipmentError, setEquipmentError] = useState<string | null>(null);
  const [brandError, setBrandError] = useState<string | null>(null);
  const [categoryPending, setCategoryPending] = useState(false);
  const [statusPending, setStatusPending] = useState(false);
  const [equipmentPending, setEquipmentPending] = useState(false);
  const [brandPending, setBrandPending] = useState(false);

  const form = useForm<UnitValues>({
    resolver: zodResolver(unitSchema),
    defaultValues: {
      identifier: initialValues?.identifier ?? "",
      unitCategoryId: initialValues?.unitCategoryId ?? "",
      unitStatusId: initialValues?.unitStatusId ?? "",
      equipmentTypeId: initialValues?.equipmentTypeId ?? "",
      brandId: initialValues?.brandId ?? "",
      description: initialValues?.description ?? "",
      serialNumber: initialValues?.serialNumber ?? "",
      underContract: initialValues?.underContract ?? false,
      isActive: initialValues?.isActive ?? true,
      agreementStartDate: initialValues?.agreementStartDate ?? "",
      agreementEndDate: initialValues?.agreementEndDate ?? "",
      phoneLineService: initialValues?.phoneLineService ?? false,
      folderUrl: initialValues?.folderUrl ?? "",
      landings: initialValues?.landings ?? undefined,
      capacity: initialValues?.capacity ?? undefined,
      floorLocation: initialValues?.floorLocation ?? undefined,
      machineRoomLocation: initialValues?.machineRoomLocation ?? "",
      buildingNumber: initialValues?.buildingNumber ?? "",
      certificateUrl: initialValues?.certificateUrl ?? "",
      photoUrl: initialValues?.photoUrl ?? "",
      notes: initialValues?.notes ?? ""
    }
  });

  const onSubmit = (values: UnitValues) => {
    if (readOnly) return;
    setError(null);
    startTransition(async () => {
      const result = unitId
        ? await updateUnitAction(unitId, values)
        : await createUnitAction(buildingId, values);
      if (result?.error) {
        setError(result.error);
      }
    });
  };

  const underContract = form.watch("underContract");

  useEffect(() => {
    if (underContract && form.getValues("isActive") === false) {
      form.setValue("isActive", true);
    }
  }, [underContract, form]);

  const handleCreateCategory = async () => {
    const parsed = unitLookupSchema.safeParse(categoryForm);
    if (!parsed.success) {
      setCategoryError(parsed.error.errors[0]?.message ?? "Invalid category.");
      return;
    }
    setCategoryError(null);
    setCategoryPending(true);
    const result = await createUnitCategoryAction(parsed.data);
    setCategoryPending(false);
    if (result?.error) {
      setCategoryError(result.error);
      return;
    }
    if (result?.item) {
      setCategoryList((prev) => [...prev, result.item!]);
      form.setValue("unitCategoryId", result.item.id);
      setCategoryForm(emptyLookup);
      setShowCategoryForm(false);
    }
  };

  const handleCreateStatus = async () => {
    const parsed = unitLookupSchema.safeParse(statusForm);
    if (!parsed.success) {
      setStatusError(parsed.error.errors[0]?.message ?? "Invalid status.");
      return;
    }
    setStatusError(null);
    setStatusPending(true);
    const result = await createUnitStatusAction(parsed.data);
    setStatusPending(false);
    if (result?.error) {
      setStatusError(result.error);
      return;
    }
    if (result?.item) {
      setStatusList((prev) => [...prev, result.item!]);
      form.setValue("unitStatusId", result.item.id);
      setStatusForm(emptyLookup);
      setShowStatusForm(false);
    }
  };

  const handleCreateEquipment = async () => {
    const parsed = unitLookupSchema.safeParse(equipmentForm);
    if (!parsed.success) {
      setEquipmentError(parsed.error.errors[0]?.message ?? "Invalid equipment type.");
      return;
    }
    setEquipmentError(null);
    setEquipmentPending(true);
    const result = await createUnitEquipmentTypeAction(parsed.data);
    setEquipmentPending(false);
    if (result?.error) {
      setEquipmentError(result.error);
      return;
    }
    if (result?.item) {
      setEquipmentList((prev) => [...prev, result.item!]);
      form.setValue("equipmentTypeId", result.item.id);
      setEquipmentForm(emptyLookup);
      setShowEquipmentForm(false);
    }
  };

  const handleCreateBrand = async () => {
    const parsed = unitLookupSchema.safeParse(brandForm);
    if (!parsed.success) {
      setBrandError(parsed.error.errors[0]?.message ?? "Invalid brand.");
      return;
    }
    setBrandError(null);
    setBrandPending(true);
    const result = await createUnitBrandAction(parsed.data);
    setBrandPending(false);
    if (result?.error) {
      setBrandError(result.error);
      return;
    }
    if (result?.item) {
      setBrandList((prev) => [...prev, result.item!]);
      form.setValue("brandId", result.item.id);
      setBrandForm(emptyLookup);
      setShowBrandForm(false);
    }
  };

  return (
    <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="identifier">Unit identifier</Label>
          <Input id="identifier" disabled={readOnly} {...form.register("identifier")} />
          {form.formState.errors.identifier ? (
            <p className="text-xs text-ember">{form.formState.errors.identifier.message}</p>
          ) : null}
        </div>
        <div className="space-y-2">
          <Label htmlFor="unitCategoryId">Category</Label>
          <select
            id="unitCategoryId"
            disabled={readOnly}
            className="flex h-10 w-full rounded-xl border border-ink/15 bg-white px-3 py-2 text-sm text-ink shadow-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/20"
            {...form.register("unitCategoryId")}
          >
            <option value="">Select category</option>
            {categoryList.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
          {form.formState.errors.unitCategoryId ? (
            <p className="text-xs text-ember">
              {form.formState.errors.unitCategoryId.message}
            </p>
          ) : null}
          {!readOnly ? (
            <button
              type="button"
              className="text-xs uppercase tracking-[0.3em] text-ink/60"
              onClick={() => setShowCategoryForm((prev) => !prev)}
            >
              + Create new category
            </button>
          ) : null}
          {showCategoryForm && !readOnly ? (
            <div className="space-y-3 rounded-2xl border border-ink/10 bg-slate-50 p-3">
              <div className="space-y-2">
                <Label htmlFor="new-category-name">Name</Label>
                <Input
                  id="new-category-name"
                  value={categoryForm.name}
                  onChange={(event) =>
                    setCategoryForm((prev) => ({ ...prev, name: event.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-category-description">Description</Label>
                <Input
                  id="new-category-description"
                  value={categoryForm.description}
                  onChange={(event) =>
                    setCategoryForm((prev) => ({
                      ...prev,
                      description: event.target.value
                    }))
                  }
                />
              </div>
              {categoryError ? (
                <p className="text-sm text-ember">{categoryError}</p>
              ) : null}
              <Button type="button" variant="outline" size="sm" onClick={handleCreateCategory}>
                {categoryPending ? "Creating..." : "Create category"}
              </Button>
            </div>
          ) : null}
        </div>
        <div className="space-y-2">
          <Label htmlFor="unitStatusId">Status</Label>
          <select
            id="unitStatusId"
            disabled={readOnly}
            className="flex h-10 w-full rounded-xl border border-ink/15 bg-white px-3 py-2 text-sm text-ink shadow-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/20"
            {...form.register("unitStatusId")}
          >
            <option value="">Select status</option>
            {statusList.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
          {form.formState.errors.unitStatusId ? (
            <p className="text-xs text-ember">{form.formState.errors.unitStatusId.message}</p>
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
            <div className="space-y-3 rounded-2xl border border-ink/10 bg-slate-50 p-3">
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
        <div className="space-y-2">
          <Label htmlFor="equipmentTypeId">Equipment type</Label>
          <select
            id="equipmentTypeId"
            disabled={readOnly}
            className="flex h-10 w-full rounded-xl border border-ink/15 bg-white px-3 py-2 text-sm text-ink shadow-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/20"
            {...form.register("equipmentTypeId")}
          >
            <option value="">Select equipment</option>
            {equipmentList.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
          {form.formState.errors.equipmentTypeId ? (
            <p className="text-xs text-ember">
              {form.formState.errors.equipmentTypeId.message}
            </p>
          ) : null}
          {!readOnly ? (
            <button
              type="button"
              className="text-xs uppercase tracking-[0.3em] text-ink/60"
              onClick={() => setShowEquipmentForm((prev) => !prev)}
            >
              + Create new equipment type
            </button>
          ) : null}
          {showEquipmentForm && !readOnly ? (
            <div className="space-y-3 rounded-2xl border border-ink/10 bg-slate-50 p-3">
              <div className="space-y-2">
                <Label htmlFor="new-equipment-name">Name</Label>
                <Input
                  id="new-equipment-name"
                  value={equipmentForm.name}
                  onChange={(event) =>
                    setEquipmentForm((prev) => ({
                      ...prev,
                      name: event.target.value
                    }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-equipment-description">Description</Label>
                <Input
                  id="new-equipment-description"
                  value={equipmentForm.description}
                  onChange={(event) =>
                    setEquipmentForm((prev) => ({
                      ...prev,
                      description: event.target.value
                    }))
                  }
                />
              </div>
              {equipmentError ? (
                <p className="text-sm text-ember">{equipmentError}</p>
              ) : null}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleCreateEquipment}
              >
                {equipmentPending ? "Creating..." : "Create equipment"}
              </Button>
            </div>
          ) : null}
        </div>
        <div className="space-y-2">
          <Label htmlFor="brandId">Brand</Label>
          <select
            id="brandId"
            disabled={readOnly}
            className="flex h-10 w-full rounded-xl border border-ink/15 bg-white px-3 py-2 text-sm text-ink shadow-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/20"
            {...form.register("brandId")}
          >
            <option value="">Select brand</option>
            {brandList.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
          {form.formState.errors.brandId ? (
            <p className="text-xs text-ember">{form.formState.errors.brandId.message}</p>
          ) : null}
          {!readOnly ? (
            <button
              type="button"
              className="text-xs uppercase tracking-[0.3em] text-ink/60"
              onClick={() => setShowBrandForm((prev) => !prev)}
            >
              + Create new brand
            </button>
          ) : null}
          {showBrandForm && !readOnly ? (
            <div className="space-y-3 rounded-2xl border border-ink/10 bg-slate-50 p-3">
              <div className="space-y-2">
                <Label htmlFor="new-brand-name">Name</Label>
                <Input
                  id="new-brand-name"
                  value={brandForm.name}
                  onChange={(event) =>
                    setBrandForm((prev) => ({ ...prev, name: event.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-brand-description">Description</Label>
                <Input
                  id="new-brand-description"
                  value={brandForm.description}
                  onChange={(event) =>
                    setBrandForm((prev) => ({
                      ...prev,
                      description: event.target.value
                    }))
                  }
                />
              </div>
              {brandError ? <p className="text-sm text-ember">{brandError}</p> : null}
              <Button type="button" variant="outline" size="sm" onClick={handleCreateBrand}>
                {brandPending ? "Creating..." : "Create brand"}
              </Button>
            </div>
          ) : null}
        </div>
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="description">Description</Label>
          <textarea
            id="description"
            disabled={readOnly}
            className="min-h-[120px] w-full rounded-2xl border border-ink/15 bg-white px-3 py-2 text-sm text-ink shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/20"
            {...form.register("description")}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="serialNumber">Serial number</Label>
          <Input id="serialNumber" disabled={readOnly} {...form.register("serialNumber")} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="buildingNumber">Building number</Label>
          <Input id="buildingNumber" disabled={readOnly} {...form.register("buildingNumber")} />
        </div>
        <div className="flex items-center gap-2 md:col-span-2">
          <input
            id="underContract"
            type="checkbox"
            disabled={readOnly}
            className="h-4 w-4 rounded border-ink/20"
            {...form.register("underContract")}
          />
          <Label htmlFor="underContract">Under contract</Label>
        </div>
        <div className="flex items-center gap-2 md:col-span-2">
          <input
            id="isActive"
            type="checkbox"
            disabled={readOnly || underContract}
            className="h-4 w-4 rounded border-ink/20"
            {...form.register("isActive")}
          />
          <Label htmlFor="isActive">Active</Label>
        </div>
        <div className="space-y-2">
          <Label htmlFor="agreementStartDate">Agreement start</Label>
          <Input
            id="agreementStartDate"
            type="date"
            disabled={readOnly}
            {...form.register("agreementStartDate")}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="agreementEndDate">Agreement end</Label>
          <Input
            id="agreementEndDate"
            type="date"
            disabled={readOnly}
            {...form.register("agreementEndDate")}
          />
        </div>
        <div className="flex items-center gap-2 md:col-span-2">
          <input
            id="phoneLineService"
            type="checkbox"
            disabled={readOnly}
            className="h-4 w-4 rounded border-ink/20"
            {...form.register("phoneLineService")}
          />
          <Label htmlFor="phoneLineService">Phone line service</Label>
        </div>
        <div className="space-y-2">
          <Label htmlFor="folderUrl">Folder URL</Label>
          <Input id="folderUrl" disabled={readOnly} {...form.register("folderUrl")} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="certificateUrl">Certificate URL</Label>
          <Input id="certificateUrl" disabled={readOnly} {...form.register("certificateUrl")} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="photoUrl">Photo URL</Label>
          <Input id="photoUrl" disabled={readOnly} {...form.register("photoUrl")} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="landings">Landings</Label>
          <Input
            id="landings"
            type="number"
            disabled={readOnly}
            {...form.register("landings")}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="capacity">Capacity</Label>
          <Input
            id="capacity"
            type="number"
            disabled={readOnly}
            {...form.register("capacity")}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="floorLocation">Floor location</Label>
          <Input
            id="floorLocation"
            type="number"
            disabled={readOnly}
            {...form.register("floorLocation")}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="machineRoomLocation">Machine room location</Label>
          <Input
            id="machineRoomLocation"
            disabled={readOnly}
            {...form.register("machineRoomLocation")}
          />
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
          {unitId ? "Save unit" : "Create unit"}
        </Button>
      )}
    </form>
  );
}
