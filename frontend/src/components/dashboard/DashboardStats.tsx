/**
 * Dashboard Stats Section
 *
 * Grid of statistic cards showing key metrics
 */

import { Database, BarChart3, ShieldAlert, TrendingUp } from "lucide-react";
import { StatCard } from "./StatCard";
import type { RecentDataset } from "./RecentDatasetItem";

interface DashboardStatsProps {
  datasets: RecentDataset[];
}

export function DashboardStats({ datasets }: DashboardStatsProps) {
  const totalRows = datasets.reduce((sum, ds) => sum + ds.rows, 0);
  const totalSensitiveColumns = datasets.reduce((sum, ds) => sum + ds.sensitiveColumns, 0);
  const avgQuality = Math.round(
    datasets.reduce((sum, ds) => sum + ds.qualityScore, 0) / datasets.length
  );

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      <StatCard
        title="Total Datasets"
        value={datasets.length}
        icon={Database}
        iconColor="text-teal-medical"
        iconBgColor="bg-[#5dbdb9]/10"
        description="Analyzed this month"
      />

      <StatCard
        title="Total Data Points"
        value={totalRows.toLocaleString()}
        icon={BarChart3}
        iconColor="text-blue-600"
        iconBgColor="bg-blue-500/10"
        description="Rows processed"
      />

      <StatCard
        title="Sensitive Columns"
        value={totalSensitiveColumns}
        icon={ShieldAlert}
        iconColor="text-red-600"
        iconBgColor="bg-red-500/10"
        description="Require anonymization"
      />

      <StatCard
        title="Avg Quality Score"
        value={`${avgQuality}/100`}
        icon={TrendingUp}
        iconColor="text-green-600"
        iconBgColor="bg-green-500/10"
        description="Data quality metric"
      />
    </div>
  );
}
