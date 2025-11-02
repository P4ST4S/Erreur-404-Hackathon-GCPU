/**
 * Column Filter Component
 *
 * Individual column filter input for the DataTable.
 */

import type { Column } from "@tanstack/react-table";
import { Search } from "lucide-react";

interface ColumnFilterProps<TData> {
  column: Column<TData, unknown>;
  placeholder?: string;
}

/**
 * Column filter input component
 */
export function ColumnFilter<TData>({
  column,
  placeholder = "Filter...",
}: ColumnFilterProps<TData>) {
  const columnFilterValue = column.getFilterValue();

  return (
    <div className="relative mt-2">
      <Search className="absolute left-2 top-1/2 h-3 w-3 -translate-y-1/2 text-muted-foreground" />
      <input
        type="text"
        value={(columnFilterValue ?? "") as string}
        onChange={(e) => column.setFilterValue(e.target.value)}
        placeholder={placeholder}
        className="h-8 w-full rounded border border-input bg-background pl-7 pr-2 text-xs ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
      />
    </div>
  );
}
