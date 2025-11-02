import { FileText, AlertCircle, Brain, Sparkles, Table2, Download, BarChart3, ChevronDown, ChevronUp } from "lucide-react";
import { FileUpload } from "@/components/upload/FileUpload";
import type { UploadedFile } from "@/types/file-upload";
import { useState, useMemo, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/data-table";
import type { MedicalDataRow, ColumnMetadata } from "@/types/data-table";
import type { ColumnDef } from "@tanstack/react-table";
import { parseFile, generateSampleData } from "@/utils/data-parser";
import { ColumnFilter } from "@/components/data-table/ColumnFilter";
import {
  DatasetStatsCard,
  ColumnStatsCard,
  SensitiveDataCell,
  ColumnTypeDetector,
  DataQualityIndicator,
} from "@/components/data-analysis";
import {
  calculateDatasetStatistics,
  type DatasetStatistics,
} from "@/utils/data-analysis";
import {
  RowDetailView,
  AdvancedSearch,
  ExportDialog,
} from "@/components/data-viewer";

/**
 * Anonymize page - Document upload and anonymization interface
 * Uses Vertex AI for intelligent medical data anonymization
 */
export function Anonymize() {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [tableData, setTableData] = useState<MedicalDataRow[]>([]);
  const [columnMetadata, setColumnMetadata] = useState<ColumnMetadata[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const [useSampleData, setUseSampleData] = useState(false);
  const [datasetStats, setDatasetStats] = useState<DatasetStatistics | null>(null);
  const [showAnalysis, setShowAnalysis] = useState(true);
  const [showColumnStats, setShowColumnStats] = useState(false);

  // Row detail view state
  const [selectedRow, setSelectedRow] = useState<MedicalDataRow | null>(null);
  const [selectedRowIndex, setSelectedRowIndex] = useState<number>(-1);
  const [isRowDetailOpen, setIsRowDetailOpen] = useState(false);

  // Export dialog state
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);

  // Calculate statistics when data changes
  useEffect(() => {
    if (tableData.length > 0 && columnMetadata.length > 0) {
      const stats = calculateDatasetStatistics(tableData, columnMetadata);
      setDatasetStats(stats);
    } else {
      setDatasetStats(null);
    }
  }, [tableData, columnMetadata]);

  /**
   * Handle files selected by the user
   */
  const handleFilesSelected = async (files: UploadedFile[]) => {
    setUploadedFiles((prev) => [...prev, ...files]);

    // Auto-parse the first file for preview
    if (files.length > 0 && files[0].status === "success") {
      try {
        const parsed = await parseFile(files[0].file);
        setTableData(parsed.data);
        setColumnMetadata(parsed.columns);
        setShowPreview(true);
      } catch (error) {
        console.error("Failed to parse file:", error);
      }
    }
  };

  /**
   * Handle files removed by the user
   */
  const handleFilesRemoved = (fileIds: string[]) => {
    setUploadedFiles((prev) =>
      prev.filter((file) => !fileIds.includes(file.id))
    );

    // Clear preview if all files are removed
    if (uploadedFiles.length === fileIds.length) {
      setTableData([]);
      setColumnMetadata([]);
      setShowPreview(false);
    }
  };

  /**
   * Load sample data for testing
   */
  const handleLoadSampleData = () => {
    const { data, columns } = generateSampleData(1000);
    setTableData(data);
    setColumnMetadata(columns);
    setShowPreview(true);
    setUseSampleData(true);
  };

  /**
   * Process files with Vertex AI anonymization
   * TODO: Integrate with backend Vertex AI API
   */
  const handleAnonymize = async () => {
    if (uploadedFiles.length === 0 && !useSampleData) return;

    setIsProcessing(true);
    try {
      // TODO: Send files to backend for Vertex AI processing
      // const response = await fetch('/api/anonymize', {
      //   method: 'POST',
      //   body: formData,
      // });

      // Simulate processing for now
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Show success message or navigate to results
      console.log("Files processed:", uploadedFiles);
      console.log("Data rows:", tableData.length);
    } catch (error) {
      console.error("Anonymization failed:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  /**
   * Handle column type change
   */
  const handleColumnTypeChange = (columnId: string, newType: ColumnMetadata["type"]) => {
    setColumnMetadata((prev) =>
      prev.map((col) =>
        col.id === columnId ? { ...col, type: newType } : col
      )
    );
  };

  /**
   * Handle sensitive toggle
   */
  const handleSensitiveToggle = (columnId: string, isSensitive: boolean) => {
    setColumnMetadata((prev) =>
      prev.map((col) =>
        col.id === columnId
          ? { ...col, isSensitive, shouldAnonymize: isSensitive }
          : col
      )
    );
  };

  /**
   * Handle row click to show detail view
   */
  const handleRowClick = (row: MedicalDataRow, index: number) => {
    setSelectedRow(row);
    setSelectedRowIndex(index);
    setIsRowDetailOpen(true);
  };

  /**
   * Navigate between rows in detail view
   */
  const handleRowNavigate = (direction: "prev" | "next") => {
    if (direction === "prev" && selectedRowIndex > 0) {
      const newIndex = selectedRowIndex - 1;
      setSelectedRow(tableData[newIndex]);
      setSelectedRowIndex(newIndex);
    } else if (direction === "next" && selectedRowIndex < tableData.length - 1) {
      const newIndex = selectedRowIndex + 1;
      setSelectedRow(tableData[newIndex]);
      setSelectedRowIndex(newIndex);
    }
  };

  /**
   * Generate column definitions for the table
   */
  const columns = useMemo<ColumnDef<MedicalDataRow>[]>(() => {
    const dataColumns: ColumnDef<MedicalDataRow>[] = columnMetadata.map((col) => ({
      id: col.id,
      accessorKey: col.id, // Use col.id instead of col.header to match the data keys
      header: ({ column }: { column: any }) => (
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <span className="font-semibold">{col.header}</span>
          </div>
          <ColumnTypeDetector
            column={col}
            onTypeChange={handleColumnTypeChange}
            onSensitiveToggle={handleSensitiveToggle}
          />
          <ColumnFilter column={column} placeholder={`Filter ${col.header}...`} />
        </div>
      ),
      cell: ({ getValue }: { getValue: () => any }) => {
        const value = getValue();
        return (
          <SensitiveDataCell
            value={value}
            isSensitive={col.isSensitive}
            type={col.type}
          />
        );
      },
      enableSorting: true,
      enableColumnFilter: true,
    }));

    // Add action column
    const actionColumn: ColumnDef<MedicalDataRow> = {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleRowClick(row.original, row.index)}
        >
          View Details
        </Button>
      ),
      enableSorting: false,
      enableColumnFilter: false,
    };

    return [...dataColumns, actionColumn];
  }, [columnMetadata, handleRowClick]);

  return (
    <div className="space-y-8">
      {/* Page header */}
      <div>
        <h1 className="flex items-center gap-3 text-3xl font-bold tracking-tight">
          Anonymize Documents
          <Brain className="text-teal-medical h-8 w-8" />
        </h1>
        <p className="text-muted-foreground mt-2">
          Upload medical documents to automatically identify and redact
          sensitive patient information using AI-powered anonymization.
        </p>
      </div>

      {/* File Upload Component */}
      <FileUpload
        onFilesSelected={handleFilesSelected}
        onFilesRemoved={handleFilesRemoved}
        maxFileSize={50 * 1024 * 1024} // 50MB
        maxFiles={10}
        multiple
      />

      {/* Action Buttons */}
      <div className="flex items-center justify-center gap-4">
        {/* Load Sample Data Button */}
        {!showPreview && uploadedFiles.length === 0 && (
          <Button
            size="lg"
            variant="outline"
            onClick={handleLoadSampleData}
            className="font-semibold"
          >
            <Table2 className="h-5 w-5" />
            Load Sample Data (1000 rows)
          </Button>
        )}

        {/* Anonymize Button */}
        {(uploadedFiles.length > 0 || useSampleData) && (
          <Button
            size="lg"
            onClick={handleAnonymize}
            disabled={isProcessing}
            className="bg-teal-medical hover:bg-teal-medical-dark font-semibold text-white shadow-lg transition-all hover:scale-105 hover:shadow-xl"
          >
            <Sparkles className="h-5 w-5" />
            {isProcessing
              ? "Processing with AI..."
              : useSampleData
                ? "Anonymize Sample Data"
                : `Anonymize ${uploadedFiles.length} ${uploadedFiles.length === 1 ? "File" : "Files"}`}
          </Button>
        )}
      </div>

      {/* Data Analysis & Statistics */}
      {showPreview && tableData.length > 0 && datasetStats && (
        <div className="space-y-6">
          {/* Analysis Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <BarChart3 className="h-6 w-6 text-teal-medical" />
              <div>
                <h2 className="text-2xl font-bold">Data Analysis</h2>
                <p className="text-sm text-muted-foreground">
                  Statistical insights and quality metrics
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <DataQualityIndicator score={datasetStats.qualityScore} />
            </div>
          </div>

          {/* Dataset Statistics */}
          {showAnalysis && (
            <div>
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-semibold">Dataset Overview</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowAnalysis(!showAnalysis)}
                >
                  {showAnalysis ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </Button>
              </div>
              <DatasetStatsCard statistics={datasetStats} />
            </div>
          )}

          {/* Column Statistics */}
          <div>
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold">Column Statistics</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowColumnStats(!showColumnStats)}
              >
                {showColumnStats ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </Button>
            </div>
            {showColumnStats && (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {datasetStats.columnStats.map((colStat) => (
                  <ColumnStatsCard key={colStat.columnId} statistics={colStat} />
                ))}
              </div>
            )}
          </div>

          {/* Data Table */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="flex items-center gap-2 text-2xl font-bold">
                  <Table2 className="h-6 w-6 text-teal-medical" />
                  Data Preview
                </h2>
                <p className="text-muted-foreground mt-1 text-sm">
                  {tableData.length.toLocaleString()} rows × {columnMetadata.length} columns
                  {columnMetadata.filter((c) => c.isSensitive).length > 0 && (
                    <span className="ml-2 text-red-600">
                      • {columnMetadata.filter((c) => c.isSensitive).length} sensitive column
                      {columnMetadata.filter((c) => c.isSensitive).length !== 1 ? "s" : ""} detected
                    </span>
                  )}
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsExportDialogOpen(true)}
              >
                <Download className="h-4 w-4" />
                Export
              </Button>
            </div>

            {/* Advanced Search */}
            <AdvancedSearch
              data={tableData}
              columns={columnMetadata}
              onResultSelect={(rowIndex) => {
                const row = tableData[rowIndex];
                handleRowClick(row, rowIndex);
              }}
            />

            <DataTable
              data={tableData}
              columns={columns}
              height="600px"
              config={{
                enableVirtualization: tableData.length > 100,
                enablePagination: tableData.length > 100,
                enableSorting: true,
                enableFiltering: true,
                enableColumnResizing: true,
                enableGlobalFilter: false, // Disabled: using AdvancedSearch instead
                defaultPageSize: 50,
              }}
            />
          </div>
        </div>
      )}

      {/* Row Detail View */}
      <RowDetailView
        row={selectedRow}
        columns={columnMetadata}
        isOpen={isRowDetailOpen}
        onClose={() => setIsRowDetailOpen(false)}
        onNavigate={handleRowNavigate}
        canNavigatePrev={selectedRowIndex > 0}
        canNavigateNext={selectedRowIndex < tableData.length - 1}
        rowIndex={selectedRowIndex}
        totalRows={tableData.length}
      />

      {/* Export Dialog */}
      <ExportDialog
        data={tableData}
        columns={columnMetadata}
        isOpen={isExportDialogOpen}
        onClose={() => setIsExportDialogOpen(false)}
      />

      {/* Info cards */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Supported data types */}
        <div className="bg-card rounded-lg border p-6">
          <div className="mb-4 flex items-center gap-2">
            <FileText className="text-teal-medical h-5 w-5" />
            <h3 className="font-semibold">Detected Information</h3>
          </div>
          <ul className="text-muted-foreground space-y-2 text-sm">
            <li>• Patient names and identifiers</li>
            <li>• Medical record numbers (MRN)</li>
            <li>• Social Security Numbers (SSN)</li>
            <li>• Dates of birth and ages</li>
            <li>• Phone numbers and addresses</li>
            <li>• Email addresses</li>
            <li>• Medical device identifiers</li>
          </ul>
        </div>

        {/* Security notice */}
        <div className="border-teal-medical/20 rounded-lg border bg-[#5dbdb9]/5 p-6">
          <div className="mb-4 flex items-center gap-2">
            <AlertCircle className="text-teal-medical h-5 w-5" />
            <h3 className="font-semibold">Security & Compliance</h3>
          </div>
          <p className="text-muted-foreground text-sm">
            All documents are encrypted in transit and at rest. Our AI processes
            data in compliance with HIPAA and GDPR regulations. Original
            documents are securely deleted after anonymization.
          </p>
        </div>
      </div>
    </div>
  );
}
