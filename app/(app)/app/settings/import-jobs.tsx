"use client";

import { useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { bulkImportJobsAction } from "./actions";

type LookupData = {
  managementCompanies: { id: string; name: string }[];
  buildings: { id: string; name: string; managementCompanyId: string }[];
  units: { id: string; identifier: string; buildingId: string }[];
  mechanics: { id: string; firstName: string; lastName: string }[];
};

type ParsedRow = {
  rowNumber: number;
  title: string;
  managementCompany: string;
  building: string;
  unit: string;
  mechanic: string;
  scheduledDate: string;
  startTime: string;
  endTime: string;
  priority: string;
  jobType: string;
  notes: string;
};

type ValidatedRow = ParsedRow & {
  isValid: boolean;
  errors: string[];
  resolvedIds: {
    managementCompanyId?: string;
    buildingId?: string;
    unitId?: string;
    mechanicId?: string;
  };
};

const TEMPLATE_HEADERS = [
  "Title",
  "Management Company",
  "Building",
  "Unit",
  "Mechanic",
  "Scheduled Date",
  "Start Time",
  "End Time",
  "Priority",
  "Job Type",
  "Notes"
];

const VALID_PRIORITIES = ["LOW", "NORMAL", "HIGH", "URGENT"];
const VALID_JOB_TYPES = ["MAINTENANCE", "INSPECTION", "EMERGENCY", "CALLBACK", "OTHER"];

export function ImportJobs({ managementCompanies, buildings, units, mechanics }: LookupData) {
  const [file, setFile] = useState<File | null>(null);
  const [parsedRows, setParsedRows] = useState<ValidatedRow[]>([]);
  const [importResult, setImportResult] = useState<{ success: number; failed: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const downloadTemplate = () => {
    const csvContent = TEMPLATE_HEADERS.join(",") + "\n" +
      "Repair elevator motor,MC Royal,Main Building,Torre 1,Pepe Forte,2026-02-01,09:00,11:00,NORMAL,MAINTENANCE,Example notes\n" +
      "Monthly inspection,MC Royal,Edificio Sur,,Pepe Forte,2026-02-02,14:00,,HIGH,INSPECTION,";
    
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "jobs_import_template.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const parseCSV = (text: string): ParsedRow[] => {
    const lines = text.split("\n").filter(line => line.trim());
    if (lines.length < 2) return [];

    const rows: ParsedRow[] = [];
    for (let i = 1; i < lines.length; i++) {
      const values = parseCSVLine(lines[i]);
      rows.push({
        rowNumber: i + 1,
        title: values[0]?.trim() || "",
        managementCompany: values[1]?.trim() || "",
        building: values[2]?.trim() || "",
        unit: values[3]?.trim() || "",
        mechanic: values[4]?.trim() || "",
        scheduledDate: values[5]?.trim() || "",
        startTime: values[6]?.trim() || "",
        endTime: values[7]?.trim() || "",
        priority: values[8]?.trim().toUpperCase() || "NORMAL",
        jobType: values[9]?.trim().toUpperCase() || "MAINTENANCE",
        notes: values[10]?.trim() || ""
      });
    }
    return rows;
  };

  const parseCSVLine = (line: string): string[] => {
    const result: string[] = [];
    let current = "";
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === "," && !inQuotes) {
        result.push(current);
        current = "";
      } else {
        current += char;
      }
    }
    result.push(current);
    return result;
  };

  const validateRows = (rows: ParsedRow[]): ValidatedRow[] => {
    return rows.map(row => {
      const errors: string[] = [];
      const resolvedIds: ValidatedRow["resolvedIds"] = {};

      // Required: Title
      if (!row.title) {
        errors.push("Title is required");
      }

      // Required: Management Company
      if (!row.managementCompany) {
        errors.push("Management Company is required");
      } else {
        const mc = managementCompanies.find(
          c => c.name.toLowerCase() === row.managementCompany.toLowerCase()
        );
        if (!mc) {
          errors.push(`Management Company "${row.managementCompany}" not found`);
        } else {
          resolvedIds.managementCompanyId = mc.id;
        }
      }

      // Required: Building (must be under the management company)
      if (!row.building) {
        errors.push("Building is required");
      } else if (resolvedIds.managementCompanyId) {
        const bldg = buildings.find(
          b => b.name.toLowerCase() === row.building.toLowerCase() &&
               b.managementCompanyId === resolvedIds.managementCompanyId
        );
        if (!bldg) {
          errors.push(`Building "${row.building}" not found under "${row.managementCompany}"`);
        } else {
          resolvedIds.buildingId = bldg.id;
        }
      }

      // Optional: Unit (must be under the building)
      if (row.unit && resolvedIds.buildingId) {
        const unit = units.find(
          u => u.identifier.toLowerCase() === row.unit.toLowerCase() &&
               u.buildingId === resolvedIds.buildingId
        );
        if (!unit) {
          errors.push(`Unit "${row.unit}" not found under "${row.building}"`);
        } else {
          resolvedIds.unitId = unit.id;
        }
      }

      // Optional: Mechanic
      if (row.mechanic) {
        const nameParts = row.mechanic.toLowerCase().split(" ");
        const mech = mechanics.find(m => {
          const fullName = `${m.firstName} ${m.lastName}`.toLowerCase();
          return fullName === row.mechanic.toLowerCase() ||
                 (nameParts.length === 1 && m.firstName.toLowerCase() === nameParts[0]);
        });
        if (!mech) {
          errors.push(`Mechanic "${row.mechanic}" not found`);
        } else {
          resolvedIds.mechanicId = mech.id;
        }
      }

      // Required: Scheduled Date
      if (!row.scheduledDate) {
        errors.push("Scheduled Date is required");
      } else {
        const date = parseDate(row.scheduledDate);
        if (!date) {
          errors.push(`Invalid date format "${row.scheduledDate}" (use YYYY-MM-DD or MM/DD/YYYY)`);
        }
      }

      // Validate Priority
      if (row.priority && !VALID_PRIORITIES.includes(row.priority)) {
        errors.push(`Invalid priority "${row.priority}" (use: ${VALID_PRIORITIES.join(", ")})`);
      }

      // Validate Job Type
      if (row.jobType && !VALID_JOB_TYPES.includes(row.jobType)) {
        errors.push(`Invalid job type "${row.jobType}" (use: ${VALID_JOB_TYPES.join(", ")})`);
      }

      return {
        ...row,
        isValid: errors.length === 0,
        errors,
        resolvedIds
      };
    });
  };

  const parseDate = (dateStr: string): Date | null => {
    // Try YYYY-MM-DD
    let date = new Date(dateStr);
    if (!isNaN(date.getTime())) return date;

    // Try MM/DD/YYYY
    const parts = dateStr.split("/");
    if (parts.length === 3) {
      date = new Date(`${parts[2]}-${parts[0].padStart(2, "0")}-${parts[1].padStart(2, "0")}`);
      if (!isNaN(date.getTime())) return date;
    }

    return null;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setError(null);
    setImportResult(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const rows = parseCSV(text);
      const validated = validateRows(rows);
      setParsedRows(validated);
    };
    reader.onerror = () => {
      setError("Failed to read file");
    };
    reader.readAsText(selectedFile);
  };

  const handleImport = () => {
    const validRows = parsedRows.filter(r => r.isValid);
    if (validRows.length === 0) {
      setError("No valid rows to import");
      return;
    }

    const jobsToImport = validRows.map(row => ({
      title: row.title,
      managementCompanyId: row.resolvedIds.managementCompanyId!,
      buildingId: row.resolvedIds.buildingId!,
      unitId: row.resolvedIds.unitId || null,
      mechanicId: row.resolvedIds.mechanicId || null,
      scheduledDate: parseDate(row.scheduledDate)!.toISOString(),
      scheduledStartTime: row.startTime || null,
      scheduledEndTime: row.endTime || null,
      priority: row.priority || "NORMAL",
      jobType: row.jobType || "MAINTENANCE",
      notes: row.notes || null
    }));

    startTransition(async () => {
      const result = await bulkImportJobsAction(jobsToImport);
      if (result.error) {
        setError(result.error);
      } else {
        setImportResult({ success: result.imported || 0, failed: parsedRows.length - validRows.length });
        setParsedRows([]);
        setFile(null);
      }
    });
  };

  const validCount = parsedRows.filter(r => r.isValid).length;
  const invalidCount = parsedRows.filter(r => !r.isValid).length;

  return (
    <div className="space-y-4">
      {/* Step 1: Download Template */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" onClick={downloadTemplate}>
          Download CSV Template
        </Button>
        <span className="text-xs text-ink/60">
          Fill in your data using the template format
        </span>
      </div>

      {/* Step 2: Upload File */}
      <div className="border-2 border-dashed border-ink/20 rounded-xl p-6">
        <input
          type="file"
          accept=".csv"
          onChange={handleFileChange}
          className="block w-full text-sm text-ink/60 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-ink file:text-white hover:file:bg-ink/90 file:cursor-pointer"
        />
        {file && (
          <p className="mt-2 text-sm text-ink/60">
            Selected: {file.name}
          </p>
        )}
      </div>

      {/* Step 3: Validation Preview */}
      {parsedRows.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-ink">
              {parsedRows.length} rows found
            </span>
            <span className="text-sm text-green-600">
              ✓ {validCount} valid
            </span>
            {invalidCount > 0 && (
              <span className="text-sm text-red-600">
                ✗ {invalidCount} with errors
              </span>
            )}
          </div>

          <div className="max-h-[400px] overflow-auto border border-ink/10 rounded-xl">
            <table className="w-full text-sm">
              <thead className="bg-ink/5 sticky top-0">
                <tr>
                  <th className="px-3 py-2 text-left">Row</th>
                  <th className="px-3 py-2 text-left">Status</th>
                  <th className="px-3 py-2 text-left">Title</th>
                  <th className="px-3 py-2 text-left">Company</th>
                  <th className="px-3 py-2 text-left">Building</th>
                  <th className="px-3 py-2 text-left">Date</th>
                  <th className="px-3 py-2 text-left">Errors</th>
                </tr>
              </thead>
              <tbody>
                {parsedRows.map((row) => (
                  <tr
                    key={row.rowNumber}
                    className={row.isValid ? "bg-green-50" : "bg-red-50"}
                  >
                    <td className="px-3 py-2">{row.rowNumber}</td>
                    <td className="px-3 py-2">
                      {row.isValid ? (
                        <span className="text-green-600">✓</span>
                      ) : (
                        <span className="text-red-600">✗</span>
                      )}
                    </td>
                    <td className="px-3 py-2 truncate max-w-[150px]">{row.title}</td>
                    <td className="px-3 py-2 truncate max-w-[120px]">{row.managementCompany}</td>
                    <td className="px-3 py-2 truncate max-w-[120px]">{row.building}</td>
                    <td className="px-3 py-2">{row.scheduledDate}</td>
                    <td className="px-3 py-2 text-xs text-red-600">
                      {row.errors.join("; ")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex items-center gap-4">
            <Button
              onClick={handleImport}
              disabled={isPending || validCount === 0}
            >
              {isPending ? "Importing..." : `Import ${validCount} Jobs`}
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setParsedRows([]);
                setFile(null);
              }}
            >
              Clear
            </Button>
          </div>
        </div>
      )}

      {/* Result Message */}
      {importResult && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-xl">
          <p className="text-green-800">
            ✓ Successfully imported {importResult.success} jobs
            {importResult.failed > 0 && (
              <span className="text-red-600"> ({importResult.failed} skipped due to errors)</span>
            )}
          </p>
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Help Text */}
      <div className="text-xs text-ink/50 space-y-1">
        <p><strong>Tips:</strong></p>
        <ul className="list-disc list-inside space-y-0.5">
          <li>Management Company and Building names must match exactly (case-insensitive)</li>
          <li>Unit and Mechanic are optional</li>
          <li>Date formats: YYYY-MM-DD or MM/DD/YYYY</li>
          <li>Priority: LOW, NORMAL, HIGH, URGENT</li>
          <li>Job Type: MAINTENANCE, INSPECTION, EMERGENCY, CALLBACK, OTHER</li>
        </ul>
      </div>
    </div>
  );
}
