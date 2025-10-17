/**
 * Stat Card Component
 *
 * Reusable metric card for displaying statistics
 */

import type { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  iconColor: string;
  iconBgColor: string;
  description?: string;
}

export function StatCard({
  title,
  value,
  icon: Icon,
  iconColor,
  iconBgColor,
  description,
}: StatCardProps) {
  return (
    <div className="rounded-lg border bg-card p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="mt-2 text-3xl font-bold">{value}</p>
        </div>
        <div className={`flex h-12 w-12 items-center justify-center rounded-full ${iconBgColor}`}>
          <Icon className={`h-6 w-6 ${iconColor}`} />
        </div>
      </div>
      {description && (
        <p className="mt-4 text-xs text-muted-foreground">{description}</p>
      )}
    </div>
  );
}
