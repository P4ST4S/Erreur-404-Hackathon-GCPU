/**
 * Row Detail View Component
 *
 * Slide-over panel to display detailed view of a single data row
 */

import { X, ChevronLeft, ChevronRight, Eye, EyeOff, Copy, Check } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import type { MedicalDataRow, ColumnMetadata } from "@/types/data-table";
import { SensitiveDataCell } from "@/components/data-analysis";
import { cn } from "@/lib/utils";

interface RowDetailViewProps {
  row: MedicalDataRow | null;
  columns: ColumnMetadata[];
  isOpen: boolean;
  onClose: () => void;
  onNavigate?: (direction: "prev" | "next") => void;
  canNavigatePrev?: boolean;
  canNavigateNext?: boolean;
  rowIndex?: number;
  totalRows?: number;
}

export function RowDetailView({
  row,
  columns,
  isOpen,
  onClose,
  onNavigate,
  canNavigatePrev = false,
  canNavigateNext = false,
  rowIndex,
  totalRows,
}: RowDetailViewProps) {
  const [revealAllSensitive, setRevealAllSensitive] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  if (!isOpen || !row) return null;

  const handleCopy = (value: string, fieldId: string) => {
    navigator.clipboard.writeText(value);
    setCopiedField(fieldId);
    setTimeout(() => setCopiedField(null), 2000);
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/50 transition-opacity"
        onClick={onClose}
      />

      {/* Slide-over Panel */}
      <div className="fixed inset-y-0 right-0 z-50 flex w-full max-w-2xl flex-col bg-background shadow-xl">
        {/* Header */}
        <div className="border-b px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">Row Details</h2>
              {rowIndex !== undefined && totalRows !== undefined && (
                <p className="text-sm text-muted-foreground">
                  Row {rowIndex + 1} of {totalRows}
                </p>
              )}
            </div>
            <div className="flex items-center gap-2">
              {/* Reveal All Toggle */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setRevealAllSensitive(!revealAllSensitive)}
              >
                {revealAllSensitive ? (
                  <>
                    <EyeOff className="h-4 w-4" />
                    Hide All
                  </>
                ) : (
                  <>
                    <Eye className="h-4 w-4" />
                    Reveal All
                  </>
                )}
              </Button>
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>

        {/* Navigation */}
        {onNavigate && (
          <div className="flex items-center justify-between border-b px-6 py-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onNavigate("prev")}
              disabled={!canNavigatePrev}
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            <span className="text-sm text-muted-foreground">
              Navigate rows
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onNavigate("next")}
              disabled={!canNavigateNext}
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          <div className="space-y-4">
            {columns.map((column) => {
              const value = row[column.id];
              const stringValue = value !== null && value !== undefined ? String(value) : "";
              const isCopied = copiedField === column.id;

              return (
                <div
                  key={column.id}
                  className={cn(
                    "rounded-lg border p-4 transition-colors",
                    column.isSensitive && "border-red-200 bg-red-50/30"
                  )}
                >
                  <div className="mb-2 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{column.header}</span>
                      {column.isSensitive && (
                        <span className="rounded bg-red-500/10 px-2 py-0.5 text-xs font-medium text-red-600">
                          Sensitive
                        </span>
                      )}
                      <span className="rounded bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">
                        {column.type}
                      </span>
                    </div>
                    {stringValue && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCopy(stringValue, column.id)}
                      >
                        {isCopied ? (
                          <>
                            <Check className="h-3 w-3 text-green-600" />
                            Copied
                          </>
                        ) : (
                          <>
                            <Copy className="h-3 w-3" />
                            Copy
                          </>
                        )}
                      </Button>
                    )}
                  </div>

                  <div className="break-words">
                    {column.isSensitive && !revealAllSensitive ? (
                      <SensitiveDataCell
                        value={value}
                        isSensitive={true}
                        type={column.type}
                      />
                    ) : (
                      <p className="font-mono text-sm">
                        {value !== null && value !== undefined ? (
                          stringValue
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t px-6 py-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {columns.filter((c) => c.isSensitive).length} sensitive field
              {columns.filter((c) => c.isSensitive).length !== 1 ? "s" : ""}
            </p>
            <Button onClick={onClose}>Close</Button>
          </div>
        </div>
      </div>
    </>
  );
}
