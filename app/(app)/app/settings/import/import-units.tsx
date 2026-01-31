"use client";

import { useState, useTransition } from "react";
import { Upload, Download, CheckCircle, XCircle, AlertCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { parseCSV, generateCSV, downloadCSV } from "./csv-utils";
import { importUnitsAction } from "./actions";

type Props = {
  managementCompanies: { id: string; name: string }[];
  buildings: { id: string; name: string; managementCompanyId: string; managementCompanyName: string }[];
  existingUnits: { id: string; identifier: string; buildingId: string }[];
  categories: { id: string; name: string }[];
  statuses: { id: string; name: string }[];
  equipmentTypes: { id: string; name: string }[];
  brands: { id: string; name: string }[];
};

const HEADERS = [
  "Management Company",
  "Building",
  "Unit ID",
  "Description",
  "Serial Number",
  "Category",
  "Status",
  "Equipment Type",
  "Brand",
  "Under Contract",
  "Notes",
];

type ParsedRow = {
  rowNumber: number;
  managementCompany: string;
  building: string;
  identifier: string;
  description: string;
  serialNumber: string;
  category: string;
  status: string;
  equipmentType: string;
  brand: string;
  underContract: boolean;
  notes: string;
  isValid: boolean;
  errors: string[];
};

export function ImportUnits({ 
  managementCompanies, 
  buildings, 
  existingUnits,
  categories,
  statuses,
  equipmentTypes,
  brands,
}: Props) {
  const [rows, setRows] = useState<ParsedRow[]>([]);
  const [result, setResult] = useState<{ imported: number; skipped: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const mcSet = new Set(managementCompanies.map(mc => mc.name.toLowerCase()));
  const categorySet = new Set(categories.map(c => c.name.toLowerCase()));
  const statusSet = new Set(statuses.map(s => s.name.toLowerCase()));
  const equipmentTypeSet = new Set(equipmentTypes.map(e => e.name.toLowerCase()));
  const brandSet = new Set(brands.map(b => b.name.toLowerCase()));

  const downloadTemplate = () => {
    const sampleRows: string[][] = [];
    
    // Generate sample rows from existing data
    for (const bldg of buildings.slice(0, 3)) {
      sampleRows.push([
        bldg.managementCompanyName,
        bldg.name,
        "EL-001",
        "Main lobby elevator",
        "SN-12345",
        categories[0]?.name || "Passenger",
        statuses[0]?.name || "Active",
        equipmentTypes[0]?.name || "Traction",
        brands[0]?.name || "Otis",
        "Yes",
        "",
      ]);
    }

    if (sampleRows.length === 0) {
      sampleRows.push([
        "Management Company Name",
        "Building Name",
        "EL-001",
        "Main elevator",
        "SN-12345",
        categories[0]?.name || "Category",
        statuses[0]?.name || "Status",
        equipmentTypes[0]?.name || "Equipment Type",
        brands[0]?.name || "Brand",
        "Yes",
        "Notes",
      ]);
    }

    const content = generateCSV(HEADERS, sampleRows);
    downloadCSV("units_template.csv", content);
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
          building: values[1] || "",
          identifier: values[2] || "",
          description: values[3] || "",
          serialNumber: values[4] || "",
          category: values[5] || "",
          status: values[6] || "",
          equipmentType: values[7] || "",
          brand: values[8] || "",
          underContract: ["yes", "true", "1", "y"].includes(values[9]?.toLowerCase().trim() || ""),
          notes: values[10] || "",
          isValid: true,
          errors: [],
        };

        // Validation
        if (!row.managementCompany.trim()) {
          row.isValid = false;
          row.errors.push("Management Company required");
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
            row.errors.push(`Building "${row.building}" not found under "${row.managementCompany}"`);
          }
        }

        if (!row.identifier.trim()) {
          row.isValid = false;
          row.errors.push("Unit ID required");
        }

        if (!row.category.trim() || !categorySet.has(row.category.toLowerCase().trim())) {
          row.isValid = false;
          row.errors.push(`Category "${row.category}" not found`);
        }

        if (!row.status.trim() || !statusSet.has(row.status.toLowerCase().trim())) {
          row.isValid = false;
          row.errors.push(`Status "${row.status}" not found`);
        }

        if (!row.equipmentType.trim() || !equipmentTypeSet.has(row.equipmentType.toLowerCase().trim())) {
          row.isValid = false;
          row.errors.push(`Equipment Type "${row.equipmentType}" not found`);
        }

        if (!row.brand.trim() || !brandSet.has(row.brand.toLowerCase().trim())) {
          row.isValid = false;
          row.errors.push(`Brand "${row.brand}" not found`);
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
        building: r.building,
        identifier: r.identifier,
        description: r.description || undefined,
        serialNumber: r.serialNumber || undefined,
        category: r.category,
        status: r.status,
        equipmentType: r.equipmentType,
        brand: r.brand,
        underContract: r.underContract,
        notes: r.notes || undefined,
      }));

      const res = await importUnitsAction(data);
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

  const missingLookups = 
    categories.length === 0 || 
    statuses.length === 0 || 
    equipmentTypes.length === 0 || 
    brands.length === 0;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-medium">Units (Elevators/Escalators)</h3>
          <p className="text-sm text-muted-foreground">
            Import units. Requires Buildings and lookup values (Categories, Statuses, etc.)
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={downloadTemplate}>
          <Download className="mr-2 h-4 w-4" />
          Download Template
        </Button>
      </div>

      {buildings.length === 0 && (
        <div className="p-4 bg-warning-50 border border-warning-200 rounded-lg flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-warning-600" />
          <p className="text-warning-800 text-sm">
            No Buildings found. Import Management Companies and Buildings first.
          </p>
        </div>
      )}

      {missingLookups && (
        <div className="p-4 bg-warning-50 border border-warning-200 rounded-lg flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-warning-600" />
          <p className="text-warning-800 text-sm">
            Missing lookup values. Create Categories, Statuses, Equipment Types, and Brands in the app first.
          </p>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 p-3 bg-muted rounded-lg text-xs">
        <div>
          <p className="text-muted-foreground mb-1">Categories:</p>
          <p className="font-mono">{categories.map(c => c.name).join(", ") || "None"}</p>
        </div>
        <div>
          <p className="text-muted-foreground mb-1">Statuses:</p>
          <p className="font-mono">{statuses.map(s => s.name).join(", ") || "None"}</p>
        </div>
        <div>
          <p className="text-muted-foreground mb-1">Equipment Types:</p>
          <p className="font-mono">{equipmentTypes.map(e => e.name).join(", ") || "None"}</p>
        </div>
        <div>
          <p className="text-muted-foreground mb-1">Brands:</p>
          <p className="font-mono">{brands.map(b => b.name).join(", ") || "None"}</p>
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
                  <th className="px-2 py-2 text-left">Row</th>
                  <th className="px-2 py-2 text-left">OK</th>
                  <th className="px-2 py-2 text-left">MC</th>
                  <th className="px-2 py-2 text-left">Building</th>
                  <th className="px-2 py-2 text-left">Unit ID</th>
                  <th className="px-2 py-2 text-left">Category</th>
                  <th className="px-2 py-2 text-left">Errors</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.rowNumber} className={row.isValid ? "bg-success-50" : "bg-danger-50"}>
                    <td className="px-2 py-2">{row.rowNumber}</td>
                    <td className="px-2 py-2">
                      {row.isValid ? (
                        <CheckCircle className="h-4 w-4 text-success-600" />
                      ) : (
                        <XCircle className="h-4 w-4 text-danger-600" />
                      )}
                    </td>
                    <td className="px-2 py-2 truncate max-w-[100px]">{row.managementCompany}</td>
                    <td className="px-2 py-2 truncate max-w-[100px]">{row.building}</td>
                    <td className="px-2 py-2">{row.identifier}</td>
                    <td className="px-2 py-2">{row.category}</td>
                    <td className="px-2 py-2 text-xs text-danger-600 max-w-[200px] truncate">{row.errors.join("; ")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex gap-2">
            <Button onClick={handleImport} disabled={isPending || validCount === 0}>
              <Upload className="mr-2 h-4 w-4" />
              {isPending ? "Importing..." : `Import ${validCount} Units`}
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
            ✓ Imported {result.imported} units
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
