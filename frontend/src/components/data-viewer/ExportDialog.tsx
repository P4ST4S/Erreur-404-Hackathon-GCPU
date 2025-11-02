/**
 * Export Dialog Component
 *
 * Modal dialog for configuring and exporting data
 */

import { useState, useMemo } from "react";
import { Download, FileText, FileJson, FileSpreadsheet, AlertTriangle, CheckCircle2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { MedicalDataRow, ColumnMetadata } from "@/types/data-table";
import { exportData, getExportStats, type ExportFormat } from "@/utils/data-export";

interface ExportDialogProps {
  data: MedicalDataRow[];
  columns: ColumnMetadata[];
  isOpen: boolean;
  onClose: () => void;
}

export function ExportDialog({ data, columns, isOpen, onClose }: ExportDialogProps) {
  const [format, setFormat] = useState<ExportFormat>("csv");
  const [includeSensitive, setIncludeSensitive] = useState(false);
  const [selectedColumns, setSelectedColumns] = useState<string[]>([]);
  const [isExporting, setIsExporting] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);
  useMemo(() => {
    if (columns.length > 0 && selectedColumns.length === 0) {
      setSelectedColumns(columns.map((c) => c.id));
    }
  }, [columns, selectedColumns.length]);

  const stats = useMemo(() => {
    return getExportStats(data, columns, {
      format,
      includeSensitiveData: includeSensitive,
      selectedColumns: selectedColumns.length > 0 ? selectedColumns : undefined,
    });
  }, [data, columns, format, includeSensitive, selectedColumns]);

  const handleExport = async () => {
    setIsExporting(true);
    setExportSuccess(false);

    try {
      await exportData(data, columns, {
        format,
        includeSensitiveData: includeSensitive,
        selectedColumns: selectedColumns.length > 0 ? selectedColumns : undefined,
      });
      setExportSuccess(true);
      setTimeout(() => {
        setExportSuccess(false);
        onClose();
      }, 2000);
    } catch (error) {
      console.error("Export failed:", error);
      alert("Export failed. Please try again.");
    } finally {
      setIsExporting(false);
    }
  };

  const toggleColumn = (columnId: string) => {
    setSelectedColumns((prev) =>
      prev.includes(columnId)
        ? prev.filter((id) => id !== columnId)
        : [...prev, columnId]
    );
  };

  const toggleAllColumns = () => {
    setSelectedColumns(
      selectedColumns.length === columns.length ? [] : columns.map((c) => c.id)
    );
  };

  if (!isOpen) return null;

  const sensitiveColumnsSelected = columns
    .filter((c) => c.isSensitive && selectedColumns.includes(c.id))
    .length;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/50 transition-opacity"
        onClick={onClose}
      />

      {/* Dialog */}
      <div className="fixed left-1/2 top-1/2 z-50 w-full max-w-2xl -translate-x-1/2 -translate-y-1/2 rounded-lg bg-background shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b px-6 py-4">
          <div className="flex items-center gap-2">
            <Download className="h-5 w-5 text-teal-medical" />
            <h2 className="text-xl font-semibold">Export Data</h2>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="space-y-6 px-6 py-4">
          {/* Format Selection */}
          <div>
            <label className="mb-2 block text-sm font-medium">Export Format</label>
            <div className="grid grid-cols-3 gap-3">
              <button
                onClick={() => setFormat("csv")}
                className={`flex flex-col items-center gap-2 rounded-lg border-2 p-4 transition-colors ${
                  format === "csv"
                    ? "border-teal-medical bg-teal-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <FileText className="h-6 w-6" />
                <span className="text-sm font-medium">CSV</span>
              </button>
              <button
                onClick={() => setFormat("json")}
                className={`flex flex-col items-center gap-2 rounded-lg border-2 p-4 transition-colors ${
                  format === "json"
                    ? "border-teal-medical bg-teal-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <FileJson className="h-6 w-6" />
                <span className="text-sm font-medium">JSON</span>
              </button>
              <button
                onClick={() => setFormat("xlsx")}
                className={`flex flex-col items-center gap-2 rounded-lg border-2 p-4 transition-colors ${
                  format === "xlsx"
                    ? "border-teal-medical bg-teal-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <FileSpreadsheet className="h-6 w-6" />
                <span className="text-sm font-medium">Excel</span>
              </button>
            </div>
          </div>

          {/* Sensitive Data Warning */}
          {sensitiveColumnsSelected > 0 && (
            <div className="rounded-lg border-2 border-orange-200 bg-orange-50 p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 shrink-0 text-orange-600" />
                <div className="flex-1">
                  <p className="font-medium text-orange-900">
                    {sensitiveColumnsSelected} sensitive column{sensitiveColumnsSelected !== 1 ? "s" : ""} selected
                  </p>
                  <p className="mt-1 text-sm text-orange-700">
                    Sensitive data will only be exported if you enable the option below.
                  </p>
                  <label className="mt-3 flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={includeSensitive}
                      onChange={(e) => setIncludeSensitive(e.target.checked)}
                      className="h-4 w-4 rounded border-gray-300 text-teal-medical focus:ring-teal-medical"
                    />
                    <span className="text-sm font-medium text-orange-900">
                      Include sensitive data in export
                    </span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Column Selection */}
          <div>
            <div className="mb-3 flex items-center justify-between">
              <label className="text-sm font-medium">Select Columns</label>
              <Button variant="ghost" size="sm" onClick={toggleAllColumns}>
                {selectedColumns.length === columns.length ? "Deselect All" : "Select All"}
              </Button>
            </div>
            <div className="max-h-48 overflow-y-auto rounded-lg border p-3">
              <div className="space-y-2">
                {columns.map((column) => (
                  <label
                    key={column.id}
                    className="flex items-center gap-2 rounded p-2 hover:bg-muted"
                  >
                    <input
                      type="checkbox"
                      checked={selectedColumns.includes(column.id)}
                      onChange={() => toggleColumn(column.id)}
                      className="h-4 w-4 rounded border-gray-300 text-teal-medical focus:ring-teal-medical"
                    />
                    <span className="flex-1 text-sm">{column.header}</span>
                    {column.isSensitive && (
                      <span className="rounded bg-red-100 px-2 py-0.5 text-xs font-medium text-red-600">
                        Sensitive
                      </span>
                    )}
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Export Stats */}
          <div className="rounded-lg bg-muted p-4">
            <h3 className="mb-3 font-medium">Export Summary</h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-muted-foreground">Rows:</span>{" "}
                <span className="font-medium">{stats.totalRows.toLocaleString()}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Columns:</span>{" "}
                <span className="font-medium">{stats.exportedColumns} / {stats.totalColumns}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Estimated Size:</span>{" "}
                <span className="font-medium">{stats.estimatedSize}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Format:</span>{" "}
                <span className="font-medium uppercase">{format}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t px-6 py-4">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleExport}
            disabled={isExporting || selectedColumns.length === 0 || exportSuccess}
            className="bg-teal-medical hover:bg-teal-medical-dark"
          >
            {exportSuccess ? (
              <>
                <CheckCircle2 className="h-4 w-4" />
                Exported!
              </>
            ) : isExporting ? (
              "Exporting..."
            ) : (
              <>
                <Download className="h-4 w-4" />
                Export {format.toUpperCase()}
              </>
            )}
          </Button>
        </div>
      </div>
    </>
  );
}
