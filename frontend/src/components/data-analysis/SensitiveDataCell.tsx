/**
 * Sensitive Data Cell Component
 *
 * Cell renderer with visual highlighting for sensitive data
 */

import { useState } from "react";
import { Eye, EyeOff, ShieldAlert } from "lucide-react";
import { cn } from "@/lib/utils";

interface SensitiveDataCellProps {
  value: unknown;
  isSensitive?: boolean;
  type?: string;
  className?: string;
}

export function SensitiveDataCell({
  value,
  isSensitive = false,
  type,
  className,
}: SensitiveDataCellProps) {
  const [isRevealed, setIsRevealed] = useState(false);

  if (value === null || value === undefined) {
    return <span className="text-muted-foreground">—</span>;
  }

  const stringValue = String(value);

  // For sensitive data, show masked version by default
  const getMaskedValue = () => {
    if (type === "email") {
      const [username, domain] = stringValue.split("@");
      if (!domain) return "***@***";
      return `${username.slice(0, 2)}***@${domain}`;
    }

    if (type === "phone") {
      return stringValue.replace(/\d(?=\d{4})/g, "*");
    }

    if (type === "ssn") {
      return stringValue.replace(/\d(?=\d{4})/g, "*");
    }

    // Default masking: show first 2 and last 2 characters
    if (stringValue.length > 6) {
      return `${stringValue.slice(0, 2)}${"*".repeat(stringValue.length - 4)}${stringValue.slice(-2)}`;
    }

    return "*".repeat(stringValue.length);
  };

  if (!isSensitive) {
    return <span className={className}>{stringValue}</span>;
  }

  return (
    <div className="group flex items-center gap-2">
      <span
        className={cn(
          "rounded px-1.5 py-0.5 font-mono text-xs",
          isRevealed
            ? "bg-red-50 text-red-900"
            : "bg-red-100/50 text-red-600/70",
          className
        )}
      >
        {isRevealed ? stringValue : getMaskedValue()}
      </span>

      <button
        onClick={() => setIsRevealed(!isRevealed)}
        className="opacity-0 transition-opacity group-hover:opacity-100"
        title={isRevealed ? "Hide value" : "Reveal value"}
      >
        {isRevealed ? (
          <EyeOff className="h-3 w-3 text-muted-foreground hover:text-foreground" />
        ) : (
          <Eye className="h-3 w-3 text-muted-foreground hover:text-foreground" />
        )}
      </button>
    </div>
  );
}

/**
 * Sensitive column header with icon
 */
export function SensitiveColumnHeader({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-1.5">
      <ShieldAlert className="h-3.5 w-3.5 text-red-600" />
      {children}
    </div>
  );
}
