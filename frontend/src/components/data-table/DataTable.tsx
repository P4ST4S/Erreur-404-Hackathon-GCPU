/**
 * DataTable Component
 *
 * Advanced data table with virtual scrolling, column resizing,
 * sorting, filtering, and pagination for large medical datasets.
 */

import { useMemo, useState } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  flexRender,
  type ColumnDef,
} from "@tanstack/react-table";
import { useVirtualizer } from "@tanstack/react-virtual";
import { ChevronDown, ChevronUp, ChevronsUpDown, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import type {
  MedicalDataRow,
  DataTableConfig,
  TableState,
} from "@/types/data-table";
import { DEFAULT_TABLE_CONFIG } from "@/types/data-table";
import { cn } from "@/lib/utils";

export interface DataTableProps<TData extends MedicalDataRow> {
  /** Table data */
  data: TData[];
  /** Column definitions */
  columns: ColumnDef<TData>[];
  /** Table configuration */
  config?: Partial<DataTableConfig>;
  /** Class name for the table container */
  className?: string;
  /** Height of the table container (for virtual scrolling) */
  height?: string;
}

/**
 * DataTable component with virtualization and advanced features
 */
export function DataTable<TData extends MedicalDataRow>({
  data,
  columns,
  config: userConfig,
  className,
  height = "600px",
}: DataTableProps<TData>) {
  // Merge user config with defaults
  const config = useMemo(
    () => ({ ...DEFAULT_TABLE_CONFIG, ...userConfig }),
    [userConfig]
  );

  // Table state
  const [sorting, setSorting] = useState<TableState["sorting"]>([]);
  const [columnFilters, setColumnFilters] = useState<TableState["columnFilters"]>([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [columnVisibility, setColumnVisibility] = useState<Record<string, boolean>>({});
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: config.defaultPageSize,
  });

  // Initialize table
  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnFilters,
      globalFilter,
      columnVisibility,
      pagination,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    onColumnVisibilityChange: setColumnVisibility,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: config.enableSorting ? getSortedRowModel() : undefined,
    getFilteredRowModel: config.enableFiltering ? getFilteredRowModel() : undefined,
    getPaginationRowModel: config.enablePagination ? getPaginationRowModel() : undefined,
    enableColumnResizing: config.enableColumnResizing,
    columnResizeMode: "onChange",
    manualPagination: false,
  });

  // Get rows for rendering
  const rows = config.enablePagination ? table.getRowModel().rows : table.getRowModel().rows;

  // Table container ref for virtualization
  const tableContainerRef = useMemo(() => {
    return { current: null as HTMLDivElement | null };
  }, []);

  // Virtual row renderer
  const rowVirtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => tableContainerRef.current,
    estimateSize: () => config.virtualScrollConfig.estimateSize,
    overscan: config.virtualScrollConfig.overscan,
    enabled: config.enableVirtualization && !config.enablePagination,
  });

  // Calculate virtual items
  const virtualRows = config.enableVirtualization && !config.enablePagination
    ? rowVirtualizer.getVirtualItems()
    : rows.map((_, index) => ({ index, start: 0, size: 0 }));

  const totalSize = config.enableVirtualization && !config.enablePagination
    ? rowVirtualizer.getTotalSize()
    : 0;

  // Padding for virtual scrolling
  const paddingTop = virtualRows.length > 0 ? virtualRows[0]?.start || 0 : 0;
  const paddingBottom =
    virtualRows.length > 0
      ? totalSize - (virtualRows[virtualRows.length - 1]?.start || 0) - (virtualRows[virtualRows.length - 1]?.size || 0)
      : 0;

  return (
    <div className={cn("space-y-4", className)}>
      {/* Global Search */}
      {config.enableGlobalFilter && (
        <div className="flex items-center gap-2">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search all columns..."
              value={globalFilter}
              onChange={(e) => setGlobalFilter(e.target.value)}
              className="h-10 w-full rounded-md border border-input bg-background pl-10 pr-10 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            />
            {globalFilter && (
              <button
                onClick={() => setGlobalFilter("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          <div className="text-sm text-muted-foreground">
            {table.getFilteredRowModel().rows.length} of {data.length} rows
          </div>
        </div>
      )}

      {/* Table Container */}
      <div
        ref={tableContainerRef}
        style={{ height }}
        className="relative overflow-auto rounded-md border"
      >
        <table className="w-full border-collapse text-sm">
          {/* Table Header */}
          <thead className="sticky top-0 z-10 bg-muted/95 backdrop-blur">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id} className="border-b">
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    style={{
                      width: header.getSize(),
                      position: "relative",
                    }}
                    className="h-12 px-4 text-left align-middle font-medium text-muted-foreground"
                  >
                    {header.isPlaceholder ? null : (
                      <div className="flex items-center gap-2">
                        {/* Column Header with Sorting */}
                        {config.enableSorting && header.column.getCanSort() ? (
                          <button
                            onClick={header.column.getToggleSortingHandler()}
                            className="flex items-center gap-1 hover:text-foreground"
                          >
                            {flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                            {header.column.getIsSorted() === "asc" ? (
                              <ChevronUp className="h-4 w-4" />
                            ) : header.column.getIsSorted() === "desc" ? (
                              <ChevronDown className="h-4 w-4" />
                            ) : (
                              <ChevronsUpDown className="h-4 w-4 opacity-50" />
                            )}
                          </button>
                        ) : (
                          flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )
                        )}

                        {/* Column Resizer */}
                        {config.enableColumnResizing && header.column.getCanResize() && (
                          <div
                            onMouseDown={header.getResizeHandler()}
                            onTouchStart={header.getResizeHandler()}
                            className={cn(
                              "absolute right-0 top-0 h-full w-1 cursor-col-resize select-none touch-none bg-border opacity-0 hover:opacity-100",
                              header.column.getIsResizing() && "bg-primary opacity-100"
                            )}
                          />
                        )}
                      </div>
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>

          {/* Table Body */}
          <tbody>
            {config.enableVirtualization && !config.enablePagination && paddingTop > 0 && (
              <tr>
                <td style={{ height: `${paddingTop}px` }} />
              </tr>
            )}

            {virtualRows.map((virtualRow) => {
              const row = rows[virtualRow.index];
              if (!row) return null;

              return (
                <tr
                  key={row.id}
                  className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted"
                >
                  {row.getVisibleCells().map((cell) => (
                    <td
                      key={cell.id}
                      style={{ width: cell.column.getSize() }}
                      className="px-4 py-3 align-middle"
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              );
            })}

            {config.enableVirtualization && !config.enablePagination && paddingBottom > 0 && (
              <tr>
                <td style={{ height: `${paddingBottom}px` }} />
              </tr>
            )}

            {/* Empty State */}
            {rows.length === 0 && (
              <tr>
                <td
                  colSpan={columns.length}
                  className="h-24 text-center text-muted-foreground"
                >
                  No results found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {config.enablePagination && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <p className="text-sm text-muted-foreground">
              Rows per page:
            </p>
            <select
              value={table.getState().pagination.pageSize}
              onChange={(e) => {
                table.setPageSize(Number(e.target.value));
              }}
              className="h-8 rounded-md border border-input bg-background px-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {config.pageSizeOptions.map((pageSize) => (
                <option key={pageSize} value={pageSize}>
                  {pageSize}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-6">
            <p className="text-sm text-muted-foreground">
              Page {table.getState().pagination.pageIndex + 1} of{" "}
              {table.getPageCount()}
            </p>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.setPageIndex(0)}
                disabled={!table.getCanPreviousPage()}
              >
                First
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                Next
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                disabled={!table.getCanNextPage()}
              >
                Last
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
