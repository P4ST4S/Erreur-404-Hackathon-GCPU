/**
 * Column Type Detector Component
 *
 * UI for displaying and editing column type detection
 */

import { useState } from "react";
import { Hash, Type, Calendar, Mail, Phone, ShieldAlert, User, CheckCircle2 } from "lucide-react";
import type { ColumnMetadata } from "@/types/data-table";
import { cn } from "@/lib/utils";

interface ColumnTypeDetectorProps {
  column: ColumnMetadata;
  onTypeChange?: (columnId: string, newType: ColumnMetadata["type"]) => void;
  onSensitiveToggle?: (columnId: string, isSensitive: boolean) => void;
}

const TYPE_ICONS: Record<ColumnMetadata["type"], typeof Type> = {
  string: Type,
  number: Hash,
  date: Calendar,
  email: Mail,
  phone: Phone,
  ssn: ShieldAlert,
  mrn: User,
  boolean: CheckCircle2,
  custom: Type,
};

const TYPE_LABELS: Record<ColumnMetadata["type"], string> = {
  string: "Text",
  number: "Number",
  date: "Date",
  email: "Email",
  phone: "Phone",
  ssn: "SSN",
  mrn: "MRN",
  boolean: "Boolean",
  custom: "Custom",
};

const TYPE_COLORS: Record<ColumnMetadata["type"], string> = {
  string: "bg-blue-500/10 text-blue-600 border-blue-200",
  number: "bg-purple-500/10 text-purple-600 border-purple-200",
  date: "bg-green-500/10 text-green-600 border-green-200",
  email: "bg-cyan-500/10 text-cyan-600 border-cyan-200",
  phone: "bg-indigo-500/10 text-indigo-600 border-indigo-200",
  ssn: "bg-red-500/10 text-red-600 border-red-200",
  mrn: "bg-orange-500/10 text-orange-600 border-orange-200",
  boolean: "bg-teal-500/10 text-teal-600 border-teal-200",
  custom: "bg-gray-500/10 text-gray-600 border-gray-200",
};

export function ColumnTypeDetector({
  column,
  onTypeChange,
  onSensitiveToggle,
}: ColumnTypeDetectorProps) {
  const [isEditing, setIsEditing] = useState(false);

  const Icon = TYPE_ICONS[column.type];
  const typeLabel = TYPE_LABELS[column.type];
  const typeColor = TYPE_COLORS[column.type];

  const handleTypeChange = (newType: ColumnMetadata["type"]) => {
    onTypeChange?.(column.id, newType);
    setIsEditing(false);
  };

  const handleSensitiveToggle = () => {
    onSensitiveToggle?.(column.id, !column.isSensitive);
  };

  return (
    <div className="flex items-center gap-2">
      {/* Type Badge */}
      {isEditing ? (
        <select
          value={column.type}
          onChange={(e) => handleTypeChange(e.target.value as ColumnMetadata["type"])}
          onBlur={() => setIsEditing(false)}
          autoFocus
          className="h-6 rounded-md border border-input bg-background px-2 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-ring"
        >
          {Object.entries(TYPE_LABELS).map(([type, label]) => (
            <option key={type} value={type}>
              {label}
            </option>
          ))}
        </select>
      ) : (
        <button
          onClick={() => setIsEditing(true)}
          className={cn(
            "flex items-center gap-1 rounded-md border px-2 py-1 text-xs font-medium transition-colors hover:opacity-80",
            typeColor
          )}
          title="Click to change type"
        >
          <Icon className="h-3 w-3" />
          {typeLabel}
        </button>
      )}

      {/* Sensitive Toggle */}
      <button
        onClick={handleSensitiveToggle}
        className={cn(
          "flex items-center gap-1 rounded-md border px-2 py-1 text-xs font-medium transition-colors",
          column.isSensitive
            ? "border-red-200 bg-red-500/10 text-red-600 hover:bg-red-500/20"
            : "border-gray-200 bg-gray-500/10 text-gray-600 hover:bg-gray-500/20"
        )}
        title={column.isSensitive ? "Mark as non-sensitive" : "Mark as sensitive"}
      >
        <ShieldAlert className="h-3 w-3" />
        {column.isSensitive ? "Sensitive" : "Public"}
      </button>
    </div>
  );
}
