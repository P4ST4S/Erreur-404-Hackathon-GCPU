/**
 * Dashboard Actions Section
 *
 * Quick action cards for common tasks
 */

import { Upload, Eye, Clock } from "lucide-react";
import { QuickActionCard } from "./QuickActionCard";

interface DashboardActionsProps {
  onUploadNew: () => void;
  onViewSample: () => void;
  onViewHistory: () => void;
}

export function DashboardActions({
  onUploadNew,
  onViewSample,
  onViewHistory,
}: DashboardActionsProps) {
  return (
    <div className="grid gap-6 md:grid-cols-3">
      <QuickActionCard
        title="Upload New Dataset"
        description="Upload and analyze medical data files (CSV, JSON, Excel)"
        icon={Upload}
        iconColor="text-teal-medical"
        iconBgColor="bg-[#5dbdb9]/10"
        hoverBorderColor="hover:border-teal-medical"
        actionTextColor="text-teal-medical"
        actionText="Get started"
        onClick={onUploadNew}
      />

      <QuickActionCard
        title="View Sample Data"
        description="Load demo dataset to explore analysis features"
        icon={Eye}
        iconColor="text-blue-600"
        iconBgColor="bg-blue-500/10"
        hoverBorderColor="hover:border-blue-500"
        actionTextColor="text-blue-600"
        actionText="Load demo"
        onClick={onViewSample}
      />

      <QuickActionCard
        title="View History"
        description="Access previously analyzed and anonymized datasets"
        icon={Clock}
        iconColor="text-purple-600"
        iconBgColor="bg-purple-500/10"
        hoverBorderColor="hover:border-purple-500"
        actionTextColor="text-purple-600"
        actionText="View all"
        onClick={onViewHistory}
      />
    </div>
  );
}
