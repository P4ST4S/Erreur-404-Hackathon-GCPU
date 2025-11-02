/**
 * Data Quality Indicator Component
 *
 * Visual indicators for data quality metrics
 */

import { CheckCircle2, AlertTriangle, XCircle, Info } from "lucide-react";
import { cn } from "@/lib/utils";

interface DataQualityIndicatorProps {
  score: number;
  label?: string;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
}

export function DataQualityIndicator({
  score,
  label,
  size = "md",
  showLabel = true,
}: DataQualityIndicatorProps) {
  const getScoreInfo = () => {
    if (score >= 80) {
      return {
        icon: CheckCircle2,
        color: "text-green-600",
        bgColor: "bg-green-100",
        borderColor: "border-green-300",
        label: label || "Excellent",
      };
    }
    if (score >= 60) {
      return {
        icon: Info,
        color: "text-yellow-600",
        bgColor: "bg-yellow-100",
        borderColor: "border-yellow-300",
        label: label || "Good",
      };
    }
    if (score >= 40) {
      return {
        icon: AlertTriangle,
        color: "text-orange-600",
        bgColor: "bg-orange-100",
        borderColor: "border-orange-300",
        label: label || "Fair",
      };
    }
    return {
      icon: XCircle,
      color: "text-red-600",
      bgColor: "bg-red-100",
      borderColor: "border-red-300",
      label: label || "Poor",
    };
  };

  const info = getScoreInfo();
  const Icon = info.icon;

  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-5 w-5",
    lg: "h-6 w-6",
  };

  const textSizeClasses = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base",
  };

  return (
    <div className="flex items-center gap-2">
      <div
        className={cn(
          "flex items-center justify-center rounded-full border-2 p-1",
          info.bgColor,
          info.borderColor
        )}
      >
        <Icon className={cn(sizeClasses[size], info.color)} />
      </div>
      {showLabel && (
        <div className="flex flex-col">
          <span className={cn("font-semibold", info.color, textSizeClasses[size])}>
            {score}/100
          </span>
          <span className={cn("text-muted-foreground", textSizeClasses[size])}>
            {info.label}
          </span>
        </div>
      )}
    </div>
  );
}

interface CompletenessBarProps {
  completeness: number;
  className?: string;
}

export function CompletenessBar({ completeness, className }: CompletenessBarProps) {
  const getColor = () => {
    if (completeness >= 95) return "bg-green-500";
    if (completeness >= 80) return "bg-yellow-500";
    if (completeness >= 50) return "bg-orange-500";
    return "bg-red-500";
  };

  return (
    <div className={cn("space-y-1", className)}>
      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground">Completeness</span>
        <span className="font-medium">{completeness.toFixed(1)}%</span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
        <div
          className={cn("h-full transition-all duration-300", getColor())}
          style={{ width: `${completeness}%` }}
        />
      </div>
    </div>
  );
}

interface QualityBadgeProps {
  score: number;
  size?: "sm" | "md" | "lg";
}

export function QualityBadge({ score, size = "md" }: QualityBadgeProps) {
  const getScoreStyle = () => {
    if (score >= 80) {
      return "bg-green-100 text-green-700 border-green-300";
    }
    if (score >= 60) {
      return "bg-yellow-100 text-yellow-700 border-yellow-300";
    }
    if (score >= 40) {
      return "bg-orange-100 text-orange-700 border-orange-300";
    }
    return "bg-red-100 text-red-700 border-red-300";
  };

  const sizeClasses = {
    sm: "text-xs px-1.5 py-0.5",
    md: "text-sm px-2 py-1",
    lg: "text-base px-3 py-1.5",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md border font-medium",
        getScoreStyle(),
        sizeClasses[size]
      )}
    >
      {score}/100
    </span>
  );
}
