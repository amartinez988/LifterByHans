"use client";

import { useState, useTransition } from "react";
import { Upload, Download, CheckCircle, XCircle, AlertCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { parseCSV, generateCSV, downloadCSV } from "./csv-utils";
import { importBuildingsAction } from "./actions";

type Props = {
  managementCompanies: { id: string; name: string }[];
  existingBuildings: { id: string; name: string; managementCompanyId: string; address: string }[];
};

const HEADERS = [
  "Management Company",
  "Building Name",
  "Address",
  "Local Phone",
  "Jurisdiction",
  "Notes",
];

type ParsedRow = {
  rowNumber: number;
  managementCompany: string;
  name: string;
  address: string;
  localPhone: string;
  jurisdiction: string;
  notes: string;
  isValid: boolean;
  errors: string[];
};

export function ImportBuildings({ managementCompanies, existingBuildings }: Props) {
  const [rows, setRows] = useState<ParsedRow[]>([]);
  const [result, setResult] = useState<{ imported: number; skipped: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const mcNames = managementCompanies.map(mc => mc.name);
  const mcSet = new Set(mcNames.map(n => n.toLowerCase()));

  const downloadTemplate = () => {
    const sampleRows: string[][] = [];
    
    // Add rows showing existing MCs
    for (const mc of managementCompanies.slice(0, 3)) {
      const existingBldg = existingBuildings.find(b => b.managementCompanyId === mc.id);
      sampleRows.push([
        mc.name,
        existingBldg ? existingBldg.name + " (existing)" : "New Building Name",
        existingBldg?.address || "123 Main Street, City, State 12345",
        "(555) 123-4567",
        "Miami-Dade",
        "",
      ]);
    }

    if (sampleRows.length === 0) {
      sampleRows.push([
        "Management Company Name",
        "Building Name",
        "123 Main Street, City, State 12345",
        "(555) 123-4567",
        "Jurisdiction",
        "Notes",
      ]);
    }

    const content = generateCSV(HEADERS, sampleRows);
    downloadCSV("buildings_template.csv", content);
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
          managementCompany: values[0] || "",
          name: values[1] || "",
          address: values[2] || "",
          localPhone: values[3] || "",
          jurisdiction: values[4] || "",
          notes: values[5] || "",
          isValid: true,
          errors: [],
        };

        // Validation
        if (!row.managementCompany.trim()) {
          row.isValid = false;
          row.errors.push("Management Company is required");
        } else if (!mcSet.has(row.managementCompany.toLowerCase().trim())) {
          row.isValid = false;
          row.errors.push(`Management Company "${row.managementCompany}" not found`);
        }

        if (!row.name.trim()) {
          row.isValid = false;
          row.errors.push("Building Name is required");
        }

        if (!row.address.trim()) {
          row.isValid = false;
          row.errors.push("Address is required");
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
        managementCompany: r.managementCompany,
        name: r.name,
        address: r.address,
        localPhone: r.localPhone || undefined,
        jurisdiction: r.jurisdiction || undefined,
        notes: r.notes || undefined,
      }));

      const res = await importBuildingsAction(data);
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
          <h3 className="font-medium">Buildings</h3>
          <p className="text-sm text-muted-foreground">
            Import buildings. Requires Management Companies to exist first.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={downloadTemplate}>
          <Download className="mr-2 h-4 w-4" />
          Download Template
        </Button>
      </div>

      {managementCompanies.length === 0 && (
        <div className="p-4 bg-warning-50 border border-warning-200 rounded-lg flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-warning-600" />
          <p className="text-yellow-800 text-sm">
            No Management Companies found. Import those first before importing Buildings.
          </p>
        </div>
      )}

      {managementCompanies.length > 0 && (
        <div className="p-3 bg-muted rounded-lg">
          <p className="text-xs text-muted-foreground mb-1">Available Management Companies:</p>
          <p className="text-sm font-mono">{mcNames.slice(0, 10).join(", ")}{mcNames.length > 10 ? `, ... (+${mcNames.length - 10} more)` : ""}</p>
        </div>
      )}

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
            <span className="text-success-600 flex items-center gap-1">
              <CheckCircle className="h-4 w-4" /> {validCount} valid
            </span>
            {invalidCount > 0 && (
              <span className="text-danger-600 flex items-center gap-1">
                <XCircle className="h-4 w-4" /> {invalidCount} with errors
              </span>
            )}
          </div>

          <div className="max-h-[300px] overflow-auto border rounded-lg">
            <table className="w-full text-sm">
              <thead className="bg-muted sticky top-0">
                <tr>
                  <th className="px-3 py-2 text-left">Row</th>
                  <th className="px-3 py-2 text-left">Status</th>
                  <th className="px-3 py-2 text-left">Management Co</th>
                  <th className="px-3 py-2 text-left">Building</th>
                  <th className="px-3 py-2 text-left">Address</th>
                  <th className="px-3 py-2 text-left">Errors</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.rowNumber} className={row.isValid ? "bg-success-50" : "bg-danger-50"}>
                    <td className="px-3 py-2">{row.rowNumber}</td>
                    <td className="px-3 py-2">
                      {row.isValid ? (
                        <CheckCircle className="h-4 w-4 text-success-600" />
                      ) : (
                        <XCircle className="h-4 w-4 text-danger-600" />
                      )}
                    </td>
                    <td className="px-3 py-2 truncate max-w-[150px]">{row.managementCompany}</td>
                    <td className="px-3 py-2 truncate max-w-[150px]">{row.name}</td>
                    <td className="px-3 py-2 truncate max-w-[200px]">{row.address}</td>
                    <td className="px-3 py-2 text-xs text-danger-600">{row.errors.join("; ")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex gap-2">
            <Button onClick={handleImport} disabled={isPending || validCount === 0}>
              <Upload className="mr-2 h-4 w-4" />
              {isPending ? "Importing..." : `Import ${validCount} Buildings`}
            </Button>
            <Button variant="outline" onClick={() => setRows([])}>
              Clear
            </Button>
          </div>
        </div>
      )}

      {result && (
        <div className="p-4 bg-success-50 border border-success-200 rounded-lg">
          <p className="text-success-800">
            ✓ Imported {result.imported} buildings
            {result.skipped > 0 && ` (${result.skipped} skipped)`}
          </p>
        </div>
      )}

      {error && (
        <div className="p-4 bg-danger-50 border border-danger-200 rounded-lg">
          <p className="text-danger-800">{error}</p>
        </div>
      )}
    </div>
  );
}
