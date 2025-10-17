/**
 * Data Analysis Utilities
 *
 * Statistical analysis and data quality assessment for medical datasets
 */

import type { MedicalDataRow, ColumnMetadata } from "@/types/data-table";

/**
 * Column statistics
 */
export interface ColumnStatistics {
  columnId: string;
  columnName: string;
  type: ColumnMetadata["type"];

  // Basic stats
  totalValues: number;
  uniqueValues: number;
  nullCount: number;
  emptyCount: number;
  completeness: number; // Percentage (0-100)

  // Type-specific stats
  numericStats?: {
    min: number;
    max: number;
    mean: number;
    median: number;
    stdDev: number;
  };

  stringStats?: {
    minLength: number;
    maxLength: number;
    avgLength: number;
    mostCommon: Array<{ value: string; count: number }>;
  };

  dateStats?: {
    earliest: string;
    latest: string;
    range: string;
  };

  // Data quality
  qualityScore: number; // 0-100
  qualityIssues: string[];
}

/**
 * Dataset statistics
 */
export interface DatasetStatistics {
  totalRows: number;
  totalColumns: number;
  completeness: number; // Overall percentage
  qualityScore: number; // Overall quality (0-100)

  sensitiveColumns: number;
  sensitiveDataPoints: number;

  columnStats: ColumnStatistics[];

  dataQualityIssues: Array<{
    severity: "high" | "medium" | "low";
    message: string;
    affectedColumns: string[];
  }>;
}

/**
 * Calculate statistics for a single column
 */
export function calculateColumnStatistics(
  data: MedicalDataRow[],
  column: ColumnMetadata
): ColumnStatistics {
  const values = data.map((row) => row[column.id]);
  const totalValues = values.length;

  // Count nulls and empties
  const nullCount = values.filter((v) => v === null || v === undefined).length;
  const emptyCount = values.filter((v) => v === "").length;
  const validValues = values.filter((v) => v !== null && v !== undefined && v !== "");

  // Calculate completeness
  const completeness = totalValues > 0
    ? ((totalValues - nullCount - emptyCount) / totalValues) * 100
    : 0;

  // Unique values
  const uniqueValues = new Set(validValues).size;

  // Quality issues
  const qualityIssues: string[] = [];

  if (completeness < 50) {
    qualityIssues.push("More than 50% missing values");
  } else if (completeness < 90) {
    qualityIssues.push("Contains missing values");
  }

  if (uniqueValues === 1 && validValues.length > 0) {
    qualityIssues.push("All values are identical");
  }

  // Base statistics
  const stats: ColumnStatistics = {
    columnId: column.id,
    columnName: column.header,
    type: column.type,
    totalValues,
    uniqueValues,
    nullCount,
    emptyCount,
    completeness: Math.round(completeness * 10) / 10,
    qualityScore: 0,
    qualityIssues,
  };

  // Type-specific statistics
  if (column.type === "number") {
    const numericValues = validValues
      .map((v) => parseFloat(String(v)))
      .filter((v) => !isNaN(v));

    if (numericValues.length > 0) {
      const sorted = [...numericValues].sort((a, b) => a - b);
      const sum = numericValues.reduce((a, b) => a + b, 0);
      const mean = sum / numericValues.length;
      const median = sorted[Math.floor(sorted.length / 2)];

      // Standard deviation
      const squareDiffs = numericValues.map((value) => Math.pow(value - mean, 2));
      const avgSquareDiff = squareDiffs.reduce((a, b) => a + b, 0) / numericValues.length;
      const stdDev = Math.sqrt(avgSquareDiff);

      stats.numericStats = {
        min: sorted[0],
        max: sorted[sorted.length - 1],
        mean: Math.round(mean * 100) / 100,
        median: Math.round(median * 100) / 100,
        stdDev: Math.round(stdDev * 100) / 100,
      };
    }
  } else if (column.type === "string" || column.type === "email" || column.type === "phone") {
    const stringValues = validValues.map(String);

    if (stringValues.length > 0) {
      const lengths = stringValues.map((s) => s.length);
      const minLength = Math.min(...lengths);
      const maxLength = Math.max(...lengths);
      const avgLength = Math.round(lengths.reduce((a, b) => a + b, 0) / lengths.length);

      // Most common values (top 5)
      const valueCounts = new Map<string, number>();
      stringValues.forEach((v) => {
        valueCounts.set(v, (valueCounts.get(v) || 0) + 1);
      });

      const mostCommon = Array.from(valueCounts.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([value, count]) => ({ value, count }));

      stats.stringStats = {
        minLength,
        maxLength,
        avgLength,
        mostCommon,
      };

      // Quality checks for specific types
      if (column.type === "email") {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const invalidEmails = stringValues.filter((v) => !emailRegex.test(v)).length;
        if (invalidEmails > 0) {
          qualityIssues.push(`${invalidEmails} invalid email format(s)`);
        }
      }

      if (column.type === "phone") {
        const phoneRegex = /^[\d\s\-\(\)\+]+$/;
        const invalidPhones = stringValues.filter((v) => !phoneRegex.test(v)).length;
        if (invalidPhones > 0) {
          qualityIssues.push(`${invalidPhones} invalid phone format(s)`);
        }
      }
    }
  } else if (column.type === "date") {
    const dateValues = validValues
      .map((v) => new Date(String(v)))
      .filter((d) => !isNaN(d.getTime()));

    if (dateValues.length > 0) {
      const sorted = [...dateValues].sort((a, b) => a.getTime() - b.getTime());
      const earliest = sorted[0].toISOString().split("T")[0];
      const latest = sorted[sorted.length - 1].toISOString().split("T")[0];
      const rangeDays = Math.floor(
        (sorted[sorted.length - 1].getTime() - sorted[0].getTime()) / (1000 * 60 * 60 * 24)
      );

      stats.dateStats = {
        earliest,
        latest,
        range: `${rangeDays} days`,
      };
    }

    // Check for invalid dates
    const invalidDates = validValues.filter(
      (v) => isNaN(new Date(String(v)).getTime())
    ).length;
    if (invalidDates > 0) {
      qualityIssues.push(`${invalidDates} invalid date format(s)`);
    }
  }

  // Calculate quality score (0-100)
  let qualityScore = 100;

  // Deduct for missing values
  qualityScore -= (nullCount + emptyCount) / totalValues * 50;

  // Deduct for quality issues
  qualityScore -= qualityIssues.length * 10;

  // Deduct if all values are the same (likely an error)
  if (uniqueValues === 1 && validValues.length > 1) {
    qualityScore -= 30;
  }

  stats.qualityScore = Math.max(0, Math.round(qualityScore));

  return stats;
}

/**
 * Calculate overall dataset statistics
 */
export function calculateDatasetStatistics(
  data: MedicalDataRow[],
  columns: ColumnMetadata[]
): DatasetStatistics {
  const columnStats = columns.map((col) => calculateColumnStatistics(data, col));

  const totalRows = data.length;
  const totalColumns = columns.length;

  // Calculate overall completeness
  const totalCells = totalRows * totalColumns;
  const totalMissing = columnStats.reduce(
    (sum, stat) => sum + stat.nullCount + stat.emptyCount,
    0
  );
  const completeness = totalCells > 0
    ? ((totalCells - totalMissing) / totalCells) * 100
    : 0;

  // Calculate overall quality score
  const avgQualityScore = columnStats.length > 0
    ? columnStats.reduce((sum, stat) => sum + stat.qualityScore, 0) / columnStats.length
    : 0;

  // Count sensitive data
  const sensitiveColumns = columns.filter((c) => c.isSensitive).length;
  const sensitiveDataPoints = data.length * sensitiveColumns;

  // Collect data quality issues
  const dataQualityIssues: DatasetStatistics["dataQualityIssues"] = [];

  // High severity issues
  const lowCompletenessColumns = columnStats
    .filter((s) => s.completeness < 50)
    .map((s) => s.columnName);
  if (lowCompletenessColumns.length > 0) {
    dataQualityIssues.push({
      severity: "high",
      message: "Columns with very low completeness (<50%)",
      affectedColumns: lowCompletenessColumns,
    });
  }

  const lowQualityColumns = columnStats
    .filter((s) => s.qualityScore < 50)
    .map((s) => s.columnName);
  if (lowQualityColumns.length > 0) {
    dataQualityIssues.push({
      severity: "high",
      message: "Columns with poor data quality",
      affectedColumns: lowQualityColumns,
    });
  }

  // Medium severity issues
  const someIssuesColumns = columnStats
    .filter((s) => s.qualityIssues.length > 0 && s.qualityScore >= 50)
    .map((s) => s.columnName);
  if (someIssuesColumns.length > 0) {
    dataQualityIssues.push({
      severity: "medium",
      message: "Columns with data quality warnings",
      affectedColumns: someIssuesColumns,
    });
  }

  // Low severity issues
  const missingDataColumns = columnStats
    .filter((s) => s.completeness < 100 && s.completeness >= 90)
    .map((s) => s.columnName);
  if (missingDataColumns.length > 0) {
    dataQualityIssues.push({
      severity: "low",
      message: "Columns with minor missing data",
      affectedColumns: missingDataColumns,
    });
  }

  return {
    totalRows,
    totalColumns,
    completeness: Math.round(completeness * 10) / 10,
    qualityScore: Math.round(avgQualityScore),
    sensitiveColumns,
    sensitiveDataPoints,
    columnStats,
    dataQualityIssues,
  };
}

/**
 * Get quality score color
 */
export function getQualityScoreColor(score: number): string {
  if (score >= 80) return "text-green-600";
  if (score >= 60) return "text-yellow-600";
  if (score >= 40) return "text-orange-600";
  return "text-red-600";
}

/**
 * Get quality score label
 */
export function getQualityScoreLabel(score: number): string {
  if (score >= 80) return "Excellent";
  if (score >= 60) return "Good";
  if (score >= 40) return "Fair";
  return "Poor";
}

/**
 * Get completeness color
 */
export function getCompletenessColor(completeness: number): string {
  if (completeness >= 95) return "text-green-600";
  if (completeness >= 80) return "text-yellow-600";
  if (completeness >= 50) return "text-orange-600";
  return "text-red-600";
}
