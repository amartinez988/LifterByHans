"use client";

import { useState, useTransition } from "react";
import { Upload, Download, CheckCircle, XCircle, AlertCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { parseCSV, generateCSV, downloadCSV } from "./csv-utils";
import { importJobsAction } from "./actions";

type Props = {
  managementCompanies: { id: string; name: string }[];
  buildings: { id: string; name: string; managementCompanyId: string; managementCompanyName: string }[];
  units: { id: string; identifier: string; buildingId: string; buildingName: string; managementCompanyName: string }[];
  mechanics: { id: string; firstName: string; lastName: string }[];
};

const HEADERS = [
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
  "Notes",
];

const VALID_PRIORITIES = ["LOW", "NORMAL", "HIGH", "URGENT"];
const VALID_JOB_TYPES = ["MAINTENANCE", "INSPECTION", "EMERGENCY", "CALLBACK", "OTHER"];

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
  isValid: boolean;
  errors: string[];
};

export function ImportJobs({ managementCompanies, buildings, units, mechanics }: Props) {
  const [rows, setRows] = useState<ParsedRow[]>([]);
  const [result, setResult] = useState<{ imported: number; skipped: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const mcSet = new Set(managementCompanies.map(mc => mc.name.toLowerCase()));

  const downloadTemplate = () => {
    const sampleRows: string[][] = [];
    
    // Generate samples from existing data
    for (const bldg of buildings.slice(0, 2)) {
      const unit = units.find(u => u.buildingName === bldg.name);
      const mech = mechanics[0];
      sampleRows.push([
        "Monthly maintenance check",
        bldg.managementCompanyName,
        bldg.name,
        unit?.identifier || "",
        mech ? `${mech.firstName} ${mech.lastName}` : "",
        new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
        "09:00",
        "11:00",
        "NORMAL",
        "MAINTENANCE",
        "",
      ]);
    }

    if (sampleRows.length === 0) {
      sampleRows.push([
        "Job Title",
        "Management Company",
        "Building",
        "Unit ID (optional)",
        "Mechanic Name (optional)",
        "2026-02-01",
        "09:00",
        "11:00",
        "NORMAL",
        "MAINTENANCE",
        "Notes",
      ]);
    }

    const content = generateCSV(HEADERS, sampleRows);
    downloadCSV("jobs_template.csv", content);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    setResult(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const parsed = parseCSV(text, HEADERS, (values, rowNumber) => {
        const row: ParsedRow = {
          rowNumber,
          title: values[0] || "",
          managementCompany: values[1] || "",
          building: values[2] || "",
          unit: values[3] || "",
          mechanic: values[4] || "",
          scheduledDate: values[5] || "",
          startTime: values[6] || "",
          endTime: values[7] || "",
          priority: values[8]?.toUpperCase().trim() || "NORMAL",
          jobType: values[9]?.toUpperCase().trim() || "MAINTENANCE",
          notes: values[10] || "",
          isValid: true,
          errors: [],
        };

        // Validation
        if (!row.title.trim()) {
          row.isValid = false;
          row.errors.push("Title required");
        }

        if (!row.managementCompany.trim()) {
          row.isValid = false;
          row.errors.push("MC required");
        } else if (!mcSet.has(row.managementCompany.toLowerCase().trim())) {
          row.isValid = false;
          row.errors.push(`MC "${row.managementCompany}" not found`);
        }

        if (!row.building.trim()) {
          row.isValid = false;
          row.errors.push("Building required");
        } else {
          const bldg = buildings.find(
            b => b.name.toLowerCase() === row.building.toLowerCase().trim() &&
                 b.managementCompanyName.toLowerCase() === row.managementCompany.toLowerCase().trim()
          );
          if (!bldg) {
            row.isValid = false;
            row.errors.push(`Building "${row.building}" not found`);
          }
        }

        if (!row.scheduledDate.trim()) {
          row.isValid = false;
          row.errors.push("Date required");
        } else {
          const date = new Date(row.scheduledDate);
          if (isNaN(date.getTime())) {
            row.isValid = false;
            row.errors.push("Invalid date format");
          }
        }

        if (row.priority && !VALID_PRIORITIES.includes(row.priority)) {
          row.isValid = false;
          row.errors.push(`Invalid priority: ${row.priority}`);
        }

        if (row.jobType && !VALID_JOB_TYPES.includes(row.jobType)) {
          row.isValid = false;
          row.errors.push(`Invalid job type: ${row.jobType}`);
        }

        return row;
      });
      setRows(parsed);
    };
    reader.readAsText(file);
  };

  const handleImport = () => {
    const validRows = rows.filter(r => r.isValid);
    if (validRows.length === 0) {
      setError("No valid rows to import");
      return;
    }

    startTransition(async () => {
      const data = validRows.map(r => ({
        title: r.title,
        managementCompany: r.managementCompany,
        building: r.building,
        unit: r.unit || undefined,
        mechanic: r.mechanic || undefined,
        scheduledDate: r.scheduledDate,
        startTime: r.startTime || undefined,
        endTime: r.endTime || undefined,
        priority: r.priority || undefined,
        jobType: r.jobType || undefined,
        notes: r.notes || undefined,
      }));

      const res = await importJobsAction(data);
      if (res.error) {
        setError(res.error);
      } else {
        setResult({ imported: res.imported || 0, skipped: res.skipped || 0 });
        setRows([]);
      }
    });
  };

  const validCount = rows.filter(r => r.isValid).length;
  const invalidCount = rows.filter(r => !r.isValid).length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-medium">Scheduled Jobs</h3>
          <p className="text-sm text-muted-foreground">
            Import jobs. Requires Management Companies, Buildings, and optionally Units/Mechanics.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={downloadTemplate}>
          <Download className="mr-2 h-4 w-4" />
          Download Template
        </Button>
      </div>

      {buildings.length === 0 && (
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-yellow-600" />
          <p className="text-yellow-800 text-sm">
            No Buildings found. Import Management Companies and Buildings first.
          </p>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 p-3 bg-muted rounded-lg text-xs">
        <div>
          <p className="text-muted-foreground mb-1">Priority options:</p>
          <p className="font-mono">{VALID_PRIORITIES.join(", ")}</p>
        </div>
        <div>
          <p className="text-muted-foreground mb-1">Job Type options:</p>
          <p className="font-mono">{VALID_JOB_TYPES.join(", ")}</p>
        </div>
      </div>

      <div className="border-2 border-dashed border-muted rounded-lg p-6">
        <input
          type="file"
          accept=".csv"
          onChange={handleFileChange}
          className="block w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90 file:cursor-pointer"
        />
      </div>

      {rows.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-4 text-sm">
            <span>{rows.length} rows found</span>
            <span className="text-green-600 flex items-center gap-1">
              <CheckCircle className="h-4 w-4" /> {validCount} valid
            </span>
            {invalidCount > 0 && (
              <span className="text-red-600 flex items-center gap-1">
                <XCircle className="h-4 w-4" /> {invalidCount} with errors
              </span>
            )}
          </div>

          <div className="max-h-[300px] overflow-auto border rounded-lg">
            <table className="w-full text-sm">
              <thead className="bg-muted sticky top-0">
                <tr>
                  <th className="px-2 py-2 text-left">Row</th>
                  <th className="px-2 py-2 text-left">OK</th>
                  <th className="px-2 py-2 text-left">Title</th>
                  <th className="px-2 py-2 text-left">MC</th>
                  <th className="px-2 py-2 text-left">Building</th>
                  <th className="px-2 py-2 text-left">Date</th>
                  <th className="px-2 py-2 text-left">Errors</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.rowNumber} className={row.isValid ? "bg-green-50" : "bg-red-50"}>
                    <td className="px-2 py-2">{row.rowNumber}</td>
                    <td className="px-2 py-2">
                      {row.isValid ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-600" />
                      )}
                    </td>
                    <td className="px-2 py-2 truncate max-w-[150px]">{row.title}</td>
                    <td className="px-2 py-2 truncate max-w-[100px]">{row.managementCompany}</td>
                    <td className="px-2 py-2 truncate max-w-[100px]">{row.building}</td>
                    <td className="px-2 py-2">{row.scheduledDate}</td>
                    <td className="px-2 py-2 text-xs text-red-600 truncate max-w-[200px]">{row.errors.join("; ")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex gap-2">
            <Button onClick={handleImport} disabled={isPending || validCount === 0}>
              <Upload className="mr-2 h-4 w-4" />
              {isPending ? "Importing..." : `Import ${validCount} Jobs`}
            </Button>
            <Button variant="outline" onClick={() => setRows([])}>
              Clear
            </Button>
          </div>
        </div>
      )}

      {result && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-green-800">
            ✓ Imported {result.imported} jobs
            {result.skipped > 0 && ` (${result.skipped} skipped)`}
          </p>
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-800">{error}</p>
        </div>
      )}
    </div>
  );
}
