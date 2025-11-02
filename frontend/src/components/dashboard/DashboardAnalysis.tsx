/**
 * Dashboard Analysis Section
 *
 * Display sample dataset analysis with statistics
 */

import { Button } from "@/components/ui/button";
import { DatasetStatsCard, ColumnStatsCard } from "@/components/data-analysis";
import type { DatasetStatistics } from "@/utils/data-analysis";

interface DashboardAnalysisProps {
  statistics: DatasetStatistics;
  onHide: () => void;
  onNavigateToAnonymize: () => void;
}

export function DashboardAnalysis({
  statistics,
  onHide,
  onNavigateToAnonymize,
}: DashboardAnalysisProps) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Sample Dataset Analysis</h2>
          <p className="text-sm text-muted-foreground">
            Preview of data analysis capabilities
          </p>
        </div>
        <Button variant="outline" onClick={onHide}>
          Hide Preview
        </Button>
      </div>

      {/* Dataset Overview */}
      <DatasetStatsCard statistics={statistics} />

      {/* Top Columns Preview */}
      <div>
        <h3 className="mb-4 text-lg font-semibold">Column Statistics (Top 6)</h3>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {statistics.columnStats.slice(0, 6).map((colStat) => (
            <ColumnStatsCard key={colStat.columnId} statistics={colStat} />
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="rounded-lg border bg-muted/50 p-6 text-center">
        <p className="text-sm text-muted-foreground">
          This is a preview. Upload your own data in the{" "}
          <button
            onClick={onNavigateToAnonymize}
            className="font-medium text-teal-medical hover:underline"
          >
            Anonymize page
          </button>{" "}
          for full analysis.
        </p>
      </div>
    </div>
  );
}
