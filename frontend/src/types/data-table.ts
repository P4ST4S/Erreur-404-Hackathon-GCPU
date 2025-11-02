/**
 * Data Table Types
 *
 * Type definitions for the data table component with virtualization,
 * sorting, filtering, and pagination features.
 */

import type { ColumnDef, SortingState, ColumnFiltersState } from "@tanstack/react-table";

/**
 * Medical data row - represents a single row in the dataset
 * This is flexible to support various medical data formats (CSV, Excel, JSON, etc.)
 */
export interface MedicalDataRow {
  /** Unique row identifier */
  id: string;
  /** Dynamic fields based on the uploaded data */
  [key: string]: unknown;
}

/**
 * Column metadata for medical data
 */
export interface ColumnMetadata {
  /** Column identifier */
  id: string;
  /** Display name */
  header: string;
  /** Data type */
  type: "string" | "number" | "date" | "boolean" | "email" | "phone" | "ssn" | "mrn" | "custom";
  /** Whether column contains sensitive data */
  isSensitive?: boolean;
  /** Whether column should be anonymized */
  shouldAnonymize?: boolean;
  /** Format string for display */
  format?: string;
}

/**
 * Dataset information
 */
export interface DatasetInfo {
  /** Total number of rows */
  totalRows: number;
  /** Total number of columns */
  totalColumns: number;
  /** Column metadata */
  columns: ColumnMetadata[];
  /** Source file name */
  fileName: string;
  /** File size in bytes */
  fileSize: number;
  /** Detected sensitive columns count */
  sensitiveColumnsCount: number;
}

/**
 * Table pagination state
 */
export interface PaginationState {
  /** Current page index (0-based) */
  pageIndex: number;
  /** Number of rows per page */
  pageSize: number;
}

/**
 * Table state
 */
export interface TableState {
  /** Current sorting state */
  sorting: SortingState;
  /** Current column filters */
  columnFilters: ColumnFiltersState;
  /** Current pagination state */
  pagination: PaginationState;
  /** Column visibility */
  columnVisibility: Record<string, boolean>;
  /** Global filter (search) */
  globalFilter: string;
}

/**
 * Virtual scrolling configuration
 */
export interface VirtualScrollConfig {
  /** Estimated row height in pixels */
  estimateSize: number;
  /** Number of rows to render outside visible area */
  overscan: number;
}

/**
 * Data table configuration
 */
export interface DataTableConfig {
  /** Enable virtual scrolling */
  enableVirtualization?: boolean;
  /** Enable column resizing */
  enableColumnResizing?: boolean;
  /** Enable sorting */
  enableSorting?: boolean;
  /** Enable filtering */
  enableFiltering?: boolean;
  /** Enable pagination */
  enablePagination?: boolean;
  /** Enable global search */
  enableGlobalFilter?: boolean;
  /** Default page size */
  defaultPageSize?: number;
  /** Available page sizes */
  pageSizeOptions?: number[];
  /** Virtual scroll config */
  virtualScrollConfig?: VirtualScrollConfig;
}

/**
 * Default data table configuration
 */
export const DEFAULT_TABLE_CONFIG: Required<DataTableConfig> = {
  enableVirtualization: true,
  enableColumnResizing: true,
  enableSorting: true,
  enableFiltering: true,
  enablePagination: true,
  enableGlobalFilter: true,
  defaultPageSize: 50,
  pageSizeOptions: [10, 25, 50, 100, 250, 500],
  virtualScrollConfig: {
    estimateSize: 40, // 40px per row
    overscan: 10, // Render 10 extra rows above/below viewport
  },
};

/**
 * Export types from TanStack Table for convenience
 */
export type { ColumnDef, SortingState, ColumnFiltersState };
