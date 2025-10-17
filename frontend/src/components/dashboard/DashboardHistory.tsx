/**
 * Dashboard History Section
 *
 * Display list of recent datasets
 */

import { ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RecentDatasetItem, type RecentDataset } from "./RecentDatasetItem";

interface DashboardHistoryProps {
  datasets: RecentDataset[];
  onViewAll: () => void;
  onDownload?: (datasetId: string) => void;
}

export function DashboardHistory({
  datasets,
  onViewAll,
  onDownload,
}: DashboardHistoryProps) {
  return (
    <div className="rounded-lg border bg-card">
      {/* Header */}
      <div className="border-b p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold">Recent Datasets</h2>
            <p className="text-sm text-muted-foreground">
              Latest analyzed medical datasets
            </p>
          </div>
          <Button variant="ghost" size="sm" onClick={onViewAll}>
            View All
            <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Dataset List */}
      <div className="divide-y">
        {datasets.length > 0 ? (
          datasets.map((dataset) => (
            <RecentDatasetItem
              key={dataset.id}
              dataset={dataset}
              onDownload={onDownload}
            />
          ))
        ) : (
          <div className="p-12 text-center text-muted-foreground">
            <p>No recent datasets. Upload your first dataset to get started!</p>
          </div>
        )}
      </div>
    </div>
  );
}
