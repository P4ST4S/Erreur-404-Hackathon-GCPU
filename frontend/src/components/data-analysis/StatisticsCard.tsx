/**
 * Statistics Card Component
 *
 * Display statistical information for datasets and columns
 */

import {
  AlertTriangle,
  ShieldAlert,
  Database,
  Percent,
  Award
} from "lucide-react";
import type { DatasetStatistics, ColumnStatistics } from "@/utils/data-analysis";
import {
  getQualityScoreColor,
  getQualityScoreLabel,
  getCompletenessColor,
} from "@/utils/data-analysis";
import { cn } from "@/lib/utils";

interface DatasetStatsCardProps {
  statistics: DatasetStatistics;
}

export function DatasetStatsCard({ statistics }: DatasetStatsCardProps) {
  const qualityColor = getQualityScoreColor(statistics.qualityScore);
  const qualityLabel = getQualityScoreLabel(statistics.qualityScore);
  const completenessColor = getCompletenessColor(statistics.completeness);

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Total Rows & Columns */}
        <div className="rounded-lg border bg-card p-4">
          <div className="flex items-center gap-2">
            <Database className="h-5 w-5 text-blue-600" />
            <h3 className="text-sm font-medium">Dataset Size</h3>
          </div>
          <div className="mt-2">
            <p className="text-2xl font-bold">{statistics.totalRows.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">
              {statistics.totalColumns} columns
            </p>
          </div>
        </div>

        {/* Data Quality Score */}
        <div className="rounded-lg border bg-card p-4">
          <div className="flex items-center gap-2">
            <Award className="h-5 w-5 text-purple-600" />
            <h3 className="text-sm font-medium">Quality Score</h3>
          </div>
          <div className="mt-2">
            <p className={cn("text-2xl font-bold", qualityColor)}>
              {statistics.qualityScore}/100
            </p>
            <p className={cn("text-xs font-medium", qualityColor)}>
              {qualityLabel}
            </p>
          </div>
        </div>

        {/* Completeness */}
        <div className="rounded-lg border bg-card p-4">
          <div className="flex items-center gap-2">
            <Percent className="h-5 w-5 text-green-600" />
            <h3 className="text-sm font-medium">Completeness</h3>
          </div>
          <div className="mt-2">
            <p className={cn("text-2xl font-bold", completenessColor)}>
              {statistics.completeness.toFixed(1)}%
            </p>
            <p className="text-xs text-muted-foreground">
              Data coverage
            </p>
          </div>
        </div>

        {/* Sensitive Data */}
        <div className="rounded-lg border bg-card p-4">
          <div className="flex items-center gap-2">
            <ShieldAlert className="h-5 w-5 text-red-600" />
            <h3 className="text-sm font-medium">Sensitive Data</h3>
          </div>
          <div className="mt-2">
            <p className="text-2xl font-bold text-red-600">
              {statistics.sensitiveColumns}
            </p>
            <p className="text-xs text-muted-foreground">
              {statistics.sensitiveDataPoints.toLocaleString()} data points
            </p>
          </div>
        </div>
      </div>

      {/* Data Quality Issues */}
      {statistics.dataQualityIssues.length > 0 && (
        <div className="rounded-lg border bg-card p-4">
          <div className="mb-3 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-600" />
            <h3 className="font-medium">Data Quality Issues</h3>
          </div>
          <div className="space-y-2">
            {statistics.dataQualityIssues.map((issue, index) => (
              <div
                key={index}
                className={cn(
                  "rounded-md border-l-4 p-3 text-sm",
                  issue.severity === "high" && "border-l-red-500 bg-red-50/50",
                  issue.severity === "medium" && "border-l-orange-500 bg-orange-50/50",
                  issue.severity === "low" && "border-l-yellow-500 bg-yellow-50/50"
                )}
              >
                <p className="font-medium">{issue.message}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Affected columns: {issue.affectedColumns.join(", ")}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

interface ColumnStatsCardProps {
  statistics: ColumnStatistics;
}

export function ColumnStatsCard({ statistics }: ColumnStatsCardProps) {
  const qualityColor = getQualityScoreColor(statistics.qualityScore);
  const completenessColor = getCompletenessColor(statistics.completeness);

  return (
    <div className="space-y-3 rounded-lg border bg-card p-4">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-semibold">{statistics.columnName}</h3>
          <p className="text-xs text-muted-foreground capitalize">{statistics.type}</p>
        </div>
        <div className="text-right">
          <p className={cn("text-sm font-bold", qualityColor)}>
            {statistics.qualityScore}/100
          </p>
          <p className="text-xs text-muted-foreground">Quality</p>
        </div>
      </div>

      {/* Basic Stats */}
      <div className="grid grid-cols-3 gap-2 text-sm">
        <div>
          <p className="text-xs text-muted-foreground">Unique</p>
          <p className="font-medium">{statistics.uniqueValues.toLocaleString()}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Missing</p>
          <p className="font-medium">{statistics.nullCount + statistics.emptyCount}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Complete</p>
          <p className={cn("font-medium", completenessColor)}>
            {statistics.completeness.toFixed(1)}%
          </p>
        </div>
      </div>

      {/* Numeric Stats */}
      {statistics.numericStats && (
        <div className="rounded-md bg-purple-50/50 p-3">
          <p className="mb-2 text-xs font-medium text-purple-700">Numeric Statistics</p>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Min:</span>
              <span className="font-medium">{statistics.numericStats.min}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Max:</span>
              <span className="font-medium">{statistics.numericStats.max}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Mean:</span>
              <span className="font-medium">{statistics.numericStats.mean}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Median:</span>
              <span className="font-medium">{statistics.numericStats.median}</span>
            </div>
          </div>
        </div>
      )}

      {/* String Stats */}
      {statistics.stringStats && (
        <div className="rounded-md bg-blue-50/50 p-3">
          <p className="mb-2 text-xs font-medium text-blue-700">Text Statistics</p>
          <div className="space-y-1 text-xs">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Length range:</span>
              <span className="font-medium">
                {statistics.stringStats.minLength} - {statistics.stringStats.maxLength}
              </span>
            </div>
            {statistics.stringStats.mostCommon.length > 0 && (
              <div>
                <p className="mt-2 text-muted-foreground">Most common:</p>
                <div className="mt-1 space-y-0.5">
                  {statistics.stringStats.mostCommon.slice(0, 3).map((item, i) => (
                    <div key={i} className="flex justify-between">
                      <span className="truncate font-medium" title={item.value}>
                        {item.value.length > 20 ? `${item.value.slice(0, 20)}...` : item.value}
                      </span>
                      <span className="ml-2 text-muted-foreground">({item.count})</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Date Stats */}
      {statistics.dateStats && (
        <div className="rounded-md bg-green-50/50 p-3">
          <p className="mb-2 text-xs font-medium text-green-700">Date Statistics</p>
          <div className="space-y-1 text-xs">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Earliest:</span>
              <span className="font-medium">{statistics.dateStats.earliest}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Latest:</span>
              <span className="font-medium">{statistics.dateStats.latest}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Range:</span>
              <span className="font-medium">{statistics.dateStats.range}</span>
            </div>
          </div>
        </div>
      )}

      {/* Quality Issues */}
      {statistics.qualityIssues.length > 0 && (
        <div className="rounded-md border-l-4 border-l-orange-500 bg-orange-50/50 p-2">
          <p className="mb-1 text-xs font-medium text-orange-700">Issues:</p>
          <ul className="list-inside list-disc space-y-0.5 text-xs text-orange-600">
            {statistics.qualityIssues.map((issue, i) => (
              <li key={i}>{issue}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
