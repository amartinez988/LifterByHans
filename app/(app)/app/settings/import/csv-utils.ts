// CSV parsing utilities

export function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === "," && !inQuotes) {
      result.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}

export function parseCSV<T>(
  text: string,
  headers: string[],
  mapRow: (values: string[], rowNumber: number) => T
): T[] {
  const lines = text.split("\n").filter(line => line.trim());
  if (lines.length < 2) return [];

  const rows: T[] = [];
  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);
    // Pad values array to match headers length
    while (values.length < headers.length) {
      values.push("");
    }
    rows.push(mapRow(values, i + 1));
  }
  return rows;
}

export function generateCSV(headers: string[], rows: string[][]): string {
  const escapeValue = (val: string) => {
    if (val.includes(",") || val.includes('"') || val.includes("\n")) {
      return `"${val.replace(/"/g, '""')}"`;
    }
    return val;
  };

  const headerLine = headers.map(escapeValue).join(",");
  const dataLines = rows.map(row => row.map(escapeValue).join(","));
  
  return [headerLine, ...dataLines].join("\n");
}

export function downloadCSV(filename: string, content: string) {
  const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
