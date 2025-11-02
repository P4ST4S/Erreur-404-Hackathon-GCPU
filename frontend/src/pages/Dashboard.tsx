/**
 * Dashboard page - Data Preview & Analysis Dashboard
 * Overview of data analysis, statistics, and anonymization activity
 */

import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { generateSampleData } from "@/utils/data-parser";
import {
  calculateDatasetStatistics,
  type DatasetStatistics,
} from "@/utils/data-analysis";
import {
  DashboardStats,
  DashboardActions,
  DashboardAnalysis,
  DashboardHistory,
  type RecentDataset,
} from "@/components/dashboard";

export function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [datasetStats, setDatasetStats] = useState<DatasetStatistics | null>(null);
  const recentDatasets: RecentDataset[] = [
    {
      id: "1",
      name: "Patient Records Q4 2024",
      rows: 15420,
      columns: 12,
      sensitiveColumns: 7,
      processedDate: "2024-12-15",
      status: "completed",
      qualityScore: 92,
    },
    {
      id: "2",
      name: "Clinical Trial Data Set A",
      rows: 8934,
      columns: 18,
      sensitiveColumns: 10,
      processedDate: "2024-12-10",
      status: "completed",
      qualityScore: 88,
    },
    {
      id: "3",
      name: "Insurance Claims 2024",
      rows: 23567,
      columns: 15,
      sensitiveColumns: 9,
      processedDate: "2024-12-05",
      status: "completed",
      qualityScore: 95,
    },
  ];
  const handleLoadDemoData = () => {
    const { data, columns } = generateSampleData(100);
    const stats = calculateDatasetStatistics(data, columns);
    setDatasetStats(stats);
    setShowAnalysis(true);
  };

  const handleDownload = (datasetId: string) => {
    console.log("Download dataset:", datasetId);
  };

  return (
    <div className="space-y-8">
      {/* Page header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Data Preview & Analysis Dashboard
        </h1>
        <p className="mt-2 text-muted-foreground">
          Welcome back, {user?.name}. Analyze and preview your medical data before anonymization.
        </p>
      </div>

      {/* Quick Stats */}
      <DashboardStats datasets={recentDatasets} />

      {/* Quick Actions */}
      <DashboardActions
        onUploadNew={() => navigate("/anonymize")}
        onViewSample={handleLoadDemoData}
        onViewHistory={() => navigate("/history")}
      />

      {/* Demo Analysis */}
      {showAnalysis && datasetStats && (
        <DashboardAnalysis
          statistics={datasetStats}
          onHide={() => setShowAnalysis(false)}
          onNavigateToAnonymize={() => navigate("/anonymize")}
        />
      )}

      {/* Recent Datasets */}
      <DashboardHistory
        datasets={recentDatasets}
        onViewAll={() => navigate("/history")}
        onDownload={handleDownload}
      />
    </div>
  );
}
