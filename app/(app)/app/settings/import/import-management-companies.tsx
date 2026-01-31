"use client";

import { useState, useTransition } from "react";
import { Upload, Download, CheckCircle, XCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { parseCSV, generateCSV, downloadCSV } from "./csv-utils";
import { importManagementCompaniesAction } from "./actions";

type Props = {
  existingCompanies: { id: string; name: string }[];
};

const HEADERS = [
  "Name",
  "Account Number",
  "Website",
  "Main Phone",
  "Emergency Phone",
  "Notes",
];

type ParsedRow = {
  rowNumber: number;
  name: string;
  accountNumber: string;
  website: string;
  mainPhone: string;
  emergencyPhone: string;
  notes: string;
  isValid: boolean;
  errors: string[];
};

export function ImportManagementCompanies({ existingCompanies }: Props) {
  const [rows, setRows] = useState<ParsedRow[]>([]);
  const [result, setResult] = useState<{ imported: number; skipped: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const downloadTemplate = () => {
    const sampleRows: string[][] = [];
    
    // Add example rows using existing data or placeholders
    if (existingCompanies.length > 0) {
      sampleRows.push([
        existingCompanies[0].name + " (example)",
        "ACC-001",
        "https://example.com",
        "(555) 123-4567",
        "(555) 987-6543",
        "Sample notes",
      ]);
    }
    
    sampleRows.push([
      "New Property Management Co",
      "ACC-002",
      "",
      "(555) 111-2222",
      "",
      "",
    ]);

    const content = generateCSV(HEADERS, sampleRows);
    downloadCSV("management_companies_template.csv", content);
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
          name: values[0] || "",
          accountNumber: values[1] || "",
          website: values[2] || "",
          mainPhone: values[3] || "",
          emergencyPhone: values[4] || "",
          notes: values[5] || "",
          isValid: true,
          errors: [],
        };

        // Validation
        if (!row.name.trim()) {
          row.isValid = false;
          row.errors.push("Name is required");
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
        name: r.name,
        accountNumber: r.accountNumber || undefined,
        website: r.website || undefined,
        mainPhone: r.mainPhone || undefined,
        emergencyPhone: r.emergencyPhone || undefined,
        notes: r.notes || undefined,
      }));

      const res = await importManagementCompaniesAction(data);
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
          <h3 className="font-medium">Management Companies</h3>
          <p className="text-sm text-muted-foreground">
            Import property management companies. No dependencies required.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={downloadTemplate}>
          <Download className="mr-2 h-4 w-4" />
          Download Template
        </Button>
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
                  <th className="px-3 py-2 text-left">Name</th>
                  <th className="px-3 py-2 text-left">Account #</th>
                  <th className="px-3 py-2 text-left">Phone</th>
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
                    <td className="px-3 py-2">{row.name}</td>
                    <td className="px-3 py-2">{row.accountNumber}</td>
                    <td className="px-3 py-2">{row.mainPhone}</td>
                    <td className="px-3 py-2 text-xs text-danger-600">{row.errors.join("; ")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex gap-2">
            <Button onClick={handleImport} disabled={isPending || validCount === 0}>
              <Upload className="mr-2 h-4 w-4" />
              {isPending ? "Importing..." : `Import ${validCount} Companies`}
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
            ✓ Imported {result.imported} companies
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
