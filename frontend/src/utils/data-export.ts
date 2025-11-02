/**
 * Data Export Utilities
 *
 * Export data to various formats (CSV, JSON, Excel)
 */

import type { MedicalDataRow, ColumnMetadata } from "@/types/data-table";

/**
 * Export formats
 */
export type ExportFormat = "csv" | "json" | "xlsx";

/**
 * Export options
 */
export interface ExportOptions {
  filename?: string;
  includeSensitiveData?: boolean;
  selectedColumns?: string[]; // Column IDs to include
  format: ExportFormat;
}

/**
 * Convert data to CSV format
 */
function convertToCSV(
  data: MedicalDataRow[],
  columns: ColumnMetadata[],
  options: ExportOptions
): string {
  const selectedColumns = options.selectedColumns
    ? columns.filter((c) => options.selectedColumns!.includes(c.id))
    : columns;

  // Filter out sensitive columns if needed
  const exportColumns = options.includeSensitiveData
    ? selectedColumns
    : selectedColumns.filter((c) => !c.isSensitive);

  if (exportColumns.length === 0) {
    throw new Error("No columns selected for export");
  }

  // Header row
  const headers = exportColumns.map((c) => escapeCSVValue(c.header));
  const csvLines = [headers.join(",")];

  // Data rows
  data.forEach((row) => {
    const values = exportColumns.map((col) => {
      const value = row[col.id];
      if (value === null || value === undefined) return "";
      return escapeCSVValue(String(value));
    });
    csvLines.push(values.join(","));
  });

  return csvLines.join("\n");
}

/**
 * Escape CSV value (handle quotes and commas)
 */
function escapeCSVValue(value: string): string {
  if (value.includes(",") || value.includes('"') || value.includes("\n")) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

/**
 * Convert data to JSON format
 */
function convertToJSON(
  data: MedicalDataRow[],
  columns: ColumnMetadata[],
  options: ExportOptions
): string {
  const selectedColumns = options.selectedColumns
    ? columns.filter((c) => options.selectedColumns!.includes(c.id))
    : columns;

  // Filter out sensitive columns if needed
  const exportColumns = options.includeSensitiveData
    ? selectedColumns
    : selectedColumns.filter((c) => !c.isSensitive);

  if (exportColumns.length === 0) {
    throw new Error("No columns selected for export");
  }

  // Create objects with only selected columns
  const exportData = data.map((row) => {
    const obj: Record<string, unknown> = {};
    exportColumns.forEach((col) => {
      obj[col.header] = row[col.id];
    });
    return obj;
  });

  return JSON.stringify(exportData, null, 2);
}

/**
 * Download a file
 */
function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Export data to specified format
 */
export async function exportData(
  data: MedicalDataRow[],
  columns: ColumnMetadata[],
  options: ExportOptions
): Promise<void> {
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, -5);
  const defaultFilename = `medical-data-export-${timestamp}`;
  const filename = options.filename || defaultFilename;

  try {
    switch (options.format) {
      case "csv": {
        const csv = convertToCSV(data, columns, options);
        downloadFile(csv, `${filename}.csv`, "text/csv;charset=utf-8;");
        break;
      }

      case "json": {
        const json = convertToJSON(data, columns, options);
        downloadFile(json, `${filename}.json`, "application/json;charset=utf-8;");
        break;
      }

      case "xlsx": {
        // For Excel export, we'd need a library like xlsx or exceljs
        // For now, fall back to CSV
        console.warn("XLSX export not yet implemented, exporting as CSV");
        const csv = convertToCSV(data, columns, options);
        downloadFile(csv, `${filename}.csv`, "text/csv;charset=utf-8;");
        break;
      }

      default:
        throw new Error(`Unsupported export format: ${options.format}`);
    }
  } catch (error) {
    console.error("Export failed:", error);
    throw error;
  }
}

/**
 * Get export statistics
 */
export function getExportStats(
  data: MedicalDataRow[],
  columns: ColumnMetadata[],
  options: ExportOptions
): {
  totalRows: number;
  totalColumns: number;
  sensitiveColumns: number;
  exportedColumns: number;
  estimatedSize: string;
} {
  const selectedColumns = options.selectedColumns
    ? columns.filter((c) => options.selectedColumns!.includes(c.id))
    : columns;

  const exportColumns = options.includeSensitiveData
    ? selectedColumns
    : selectedColumns.filter((c) => !c.isSensitive);

  const sensitiveColumns = selectedColumns.filter((c) => c.isSensitive).length;

  // Rough size estimation
  let estimatedBytes = 0;
  if (options.format === "csv") {
    // Estimate CSV size
    const headerSize = exportColumns.reduce((sum, col) => sum + col.header.length, 0);
    const avgRowSize = exportColumns.length * 20; // Assume avg 20 chars per cell
    estimatedBytes = headerSize + data.length * avgRowSize;
  } else if (options.format === "json") {
    // JSON is typically larger due to formatting
    const avgRowSize = exportColumns.length * 30;
    estimatedBytes = data.length * avgRowSize * 1.5;
  }

  const estimatedSize =
    estimatedBytes < 1024
      ? `${estimatedBytes} B`
      : estimatedBytes < 1024 * 1024
        ? `${(estimatedBytes / 1024).toFixed(1)} KB`
        : `${(estimatedBytes / (1024 * 1024)).toFixed(1)} MB`;

  return {
    totalRows: data.length,
    totalColumns: columns.length,
    sensitiveColumns,
    exportedColumns: exportColumns.length,
    estimatedSize,
  };
}
