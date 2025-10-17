/**
 * Recent Dataset Item Component
 *
 * Display a single recent dataset with stats and actions
 */

import { FileCheck, Calendar, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DataQualityIndicator } from "@/components/data-analysis";

export interface RecentDataset {
  id: string;
  name: string;
  rows: number;
  columns: number;
  sensitiveColumns: number;
  processedDate: string;
  status: "completed" | "processing" | "failed";
  qualityScore: number;
}

interface RecentDatasetItemProps {
  dataset: RecentDataset;
  onDownload?: (datasetId: string) => void;
}

export function RecentDatasetItem({ dataset, onDownload }: RecentDatasetItemProps) {
  return (
    <div className="flex items-center justify-between p-6 transition-colors hover:bg-muted/50">
      <div className="flex items-center gap-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#5dbdb9]/10">
          <FileCheck className="h-5 w-5 text-teal-medical" />
        </div>
        <div>
          <h3 className="font-semibold">{dataset.name}</h3>
          <p className="text-sm text-muted-foreground">
            {dataset.rows.toLocaleString()} rows × {dataset.columns} columns
            <span className="ml-2 text-red-600">
              • {dataset.sensitiveColumns} sensitive
            </span>
          </p>
        </div>
      </div>
      <div className="flex items-center gap-6">
        <div className="text-right">
          <DataQualityIndicator
            score={dataset.qualityScore}
            size="sm"
            showLabel={false}
          />
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="h-4 w-4" />
          {new Date(dataset.processedDate).toLocaleDateString()}
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onDownload?.(dataset.id)}
        >
          <Download className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
