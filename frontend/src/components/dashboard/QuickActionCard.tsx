/**
 * Quick Action Card Component
 *
 * Interactive action card with icon and description
 */

import type { LucideIcon } from "lucide-react";
import { ChevronRight } from "lucide-react";

interface QuickActionCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  iconColor: string;
  iconBgColor: string;
  hoverBorderColor: string;
  actionTextColor: string;
  actionText: string;
  onClick: () => void;
}

export function QuickActionCard({
  title,
  description,
  icon: Icon,
  iconColor,
  iconBgColor,
  hoverBorderColor,
  actionTextColor,
  actionText,
  onClick,
}: QuickActionCardProps) {
  return (
    <button
      onClick={onClick}
      className={`group rounded-lg border bg-card p-6 text-left transition-all ${hoverBorderColor} hover:shadow-md`}
    >
      <div className={`mb-4 flex h-12 w-12 items-center justify-center rounded-full ${iconBgColor} transition-colors group-hover:opacity-80`}>
        <Icon className={`h-6 w-6 ${iconColor}`} />
      </div>
      <h3 className="mb-2 text-lg font-semibold">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
      <div className={`mt-4 flex items-center text-sm font-medium ${actionTextColor}`}>
        {actionText}
        <ChevronRight className="ml-1 h-4 w-4" />
      </div>
    </button>
  );
}
