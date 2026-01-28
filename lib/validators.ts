import { z } from "zod";

export const signUpSchema = z.object({
  name: z.string().min(2, "Name is required."),
  email: z.string().email("Enter a valid email."),
  password: z.string().min(8, "Password must be at least 8 characters.")
});

export const signInSchema = z.object({
  email: z.string().email("Enter a valid email."),
  password: z.string().min(8, "Password must be at least 8 characters.")
});

export const onboardingSchema = z.object({
  companyName: z.string().min(2, "Company name is required.")
});

export const inviteSchema = z.object({
  email: z.string().email("Enter a valid email."),
  role: z.enum(["ADMIN", "MEMBER"])
});

export const managementCompanySchema = z.object({
  name: z.string().min(2, "Name is required."),
  accountNumber: z.string().optional().nullable(),
  website: z.string().optional().nullable(),
  mainPhone: z.string().optional().nullable(),
  emergencyPhone: z.string().optional().nullable(),
  notes: z.string().optional().nullable()
});

export const contactCategorySchema = z.object({
  name: z.string().min(2, "Category name is required."),
  description: z.string().optional().nullable()
});

export const contactSchema = z.object({
  managementCompanyId: z.string().min(1, "Select a management company."),
  contactCategoryId: z.string().min(1, "Select a category."),
  firstName: z.string().min(1, "First name is required."),
  lastName: z.string().min(1, "Last name is required."),
  email: z.string().email("Enter a valid email.").optional().or(z.literal("")),
  phone: z.string().optional().nullable(),
  isPrimary: z.boolean().optional(),
  notes: z.string().optional().nullable()
});

export const buildingSchema = z.object({
  name: z.string().min(2, "Name is required."),
  address: z.string().min(2, "Address is required."),
  localPhone: z.string().optional().nullable(),
  jurisdiction: z.string().optional().nullable(),
  notes: z.string().optional().nullable()
});

export const unitLookupSchema = z.object({
  name: z.string().min(2, "Name is required."),
  description: z.string().optional().nullable()
});

const optionalInt = z.preprocess((value) => {
  if (value === "" || value === null || value === undefined) {
    return undefined;
  }
  if (typeof value === "string" && value.trim() === "") {
    return undefined;
  }
  return value;
}, z.coerce.number().int());

export const unitSchema = z.object({
  identifier: z.string().min(1, "Unit identifier is required."),
  unitCategoryId: z.string().min(1, "Select a category."),
  unitStatusId: z.string().min(1, "Select a status."),
  equipmentTypeId: z.string().min(1, "Select an equipment type."),
  brandId: z.string().min(1, "Select a brand."),
  description: z.string().optional().nullable(),
  serialNumber: z.string().optional().nullable(),
  underContract: z.boolean().optional(),
  isActive: z.boolean().optional(),
  agreementStartDate: z.string().optional().nullable(),
  agreementEndDate: z.string().optional().nullable(),
  phoneLineService: z.boolean().optional(),
  folderUrl: z.string().url("Enter a valid URL.").optional().nullable().or(z.literal("")),
  landings: optionalInt.optional().nullable(),
  capacity: optionalInt.optional().nullable(),
  floorLocation: optionalInt.optional().nullable(),
  machineRoomLocation: z.string().optional().nullable(),
  buildingNumber: z.string().optional().nullable(),
  certificateUrl: z.string().url("Enter a valid URL.").optional().nullable().or(z.literal("")),
  photoUrl: z.string().url("Enter a valid URL.").optional().nullable().or(z.literal("")),
  notes: z.string().optional().nullable()
});

export const mechanicSchema = z.object({
  mechanicLevelId: z.string().min(1, "Select a mechanic level."),
  firstName: z.string().min(1, "First name is required."),
  lastName: z.string().min(1, "Last name is required."),
  email: z.string().email("Enter a valid email.").optional().or(z.literal("")),
  phone: z.string().optional().nullable(),
  isActive: z.boolean().optional()
});

export const mechanicLevelSchema = z.object({
  name: z.string().min(2, "Level name is required."),
  description: z.string().optional().nullable()
});

export const maintenanceSchema = z.object({
  managementCompanyId: z.string().min(1, "Select a management company."),
  buildingId: z.string().min(1, "Select a building."),
  unitId: z.string().min(1, "Select a unit."),
  mechanicId: z.string().optional().nullable(),
  status: z.enum(["OPEN", "COMPLETED"]).optional(),
  maintenanceDate: z.string().min(1, "Maintenance date is required."),
  notes: z.string().optional().nullable()
});

export const inspectorSchema = z.object({
  firstName: z.string().min(1, "First name is required."),
  lastName: z.string().min(1, "Last name is required."),
  companyName: z.string().optional().nullable(),
  email: z.string().email("Enter a valid email.").optional().or(z.literal("")),
  phone: z.string().optional().nullable(),
  isActive: z.boolean().optional()
});

export const inspectionStatusSchema = z.object({
  name: z.string().min(2, "Status name is required."),
  description: z.string().optional().nullable()
});

export const inspectionResultSchema = z.object({
  name: z.string().min(2, "Result name is required."),
  description: z.string().optional().nullable()
});

export const inspectionSchema = z.object({
  managementCompanyId: z.string().min(1, "Select a management company."),
  buildingId: z.string().min(1, "Select a building."),
  unitId: z.string().min(1, "Select a unit."),
  inspectorId: z.string().optional().nullable(),
  inspectionStatusId: z.string().min(1, "Select a status."),
  inspectionResultId: z.string().optional().nullable(),
  inspectionDate: z.string().min(1, "Inspection date is required."),
  expirationDate: z.string().optional().nullable(),
  reportUrl: z.string().url("Enter a valid URL.").optional().nullable().or(z.literal("")),
  notes: z.string().optional().nullable()
});

export const emergencyCallStatusSchema = z.object({
  name: z.string().min(2, "Status name is required."),
  description: z.string().optional().nullable()
});

export const emergencyCallSchema = z.object({
  managementCompanyId: z.string().min(1, "Select a management company."),
  buildingId: z.string().min(1, "Select a building."),
  unitId: z.string().min(1, "Select a unit."),
  mechanicId: z.string().optional().nullable(),
  emergencyCallStatusId: z.string().min(1, "Select a status."),
  callInAt: z.string().min(1, "Call-in time is required."),
  completedAt: z.string().optional().nullable(),
  ticketNumber: z.string().optional().nullable(),
  issueDescription: z.string().min(1, "Issue description is required."),
  notes: z.string().optional().nullable()
});
