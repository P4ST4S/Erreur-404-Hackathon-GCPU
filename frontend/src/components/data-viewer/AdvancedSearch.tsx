/**
 * Advanced Search Component
 *
 * Search with highlighting and navigation through results
 */

import { useState, useMemo } from "react";
import { Search, X, ChevronDown, ChevronUp, ChevronsDown, ChevronsUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { MedicalDataRow, ColumnMetadata } from "@/types/data-table";

interface SearchResult {
  rowIndex: number;
  columnId: string;
  value: string;
  matchText: string;
}

interface AdvancedSearchProps {
  data: MedicalDataRow[];
  columns: ColumnMetadata[];
  onResultSelect?: (rowIndex: number, columnId: string) => void;
  className?: string;
}

export function AdvancedSearch({
  data,
  columns,
  onResultSelect,
  className,
}: AdvancedSearchProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentResultIndex, setCurrentResultIndex] = useState(0);
  const [caseSensitive, setCaseSensitive] = useState(false);
  const searchResults = useMemo<SearchResult[]>(() => {
    if (!searchQuery.trim()) return [];

    const results: SearchResult[] = [];
    const query = caseSensitive ? searchQuery : searchQuery.toLowerCase();

    data.forEach((row, rowIndex) => {
      columns.forEach((column) => {
        const value = row[column.id];
        if (value !== null && value !== undefined) {
          const stringValue = String(value);
          const searchValue = caseSensitive ? stringValue : stringValue.toLowerCase();

          if (searchValue.includes(query)) {
            results.push({
              rowIndex,
              columnId: column.id,
              value: stringValue,
              matchText: column.header,
            });
          }
        }
      });
    });

    return results;
  }, [data, columns, searchQuery, caseSensitive]);

  const handleNext = () => {
    if (searchResults.length === 0) return;
    const nextIndex = (currentResultIndex + 1) % searchResults.length;
    setCurrentResultIndex(nextIndex);
    const result = searchResults[nextIndex];
    onResultSelect?.(result.rowIndex, result.columnId);
  };

  const handlePrevious = () => {
    if (searchResults.length === 0) return;
    const prevIndex = (currentResultIndex - 1 + searchResults.length) % searchResults.length;
    setCurrentResultIndex(prevIndex);
    const result = searchResults[prevIndex];
    onResultSelect?.(result.rowIndex, result.columnId);
  };

  const handleFirst = () => {
    if (searchResults.length === 0) return;
    setCurrentResultIndex(0);
    const result = searchResults[0];
    onResultSelect?.(result.rowIndex, result.columnId);
  };

  const handleLast = () => {
    if (searchResults.length === 0) return;
    const lastIndex = searchResults.length - 1;
    setCurrentResultIndex(lastIndex);
    const result = searchResults[lastIndex];
    onResultSelect?.(result.rowIndex, result.columnId);
  };

  const handleClear = () => {
    setSearchQuery("");
    setCurrentResultIndex(0);
  };

  return (
    <div className={className}>
      <div className="flex items-center gap-2">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search in all columns..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentResultIndex(0);
            }}
            className="h-10 w-full rounded-md border border-input bg-background pl-10 pr-10 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          />
          {searchQuery && (
            <button
              onClick={handleClear}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Case Sensitive Toggle */}
        <Button
          variant={caseSensitive ? "default" : "outline"}
          size="sm"
          onClick={() => setCaseSensitive(!caseSensitive)}
          className="shrink-0"
        >
          Aa
        </Button>

        {/* Results Count */}
        {searchQuery && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>
              {searchResults.length > 0
                ? `${currentResultIndex + 1} of ${searchResults.length}`
                : "No results"}
            </span>
          </div>
        )}

        {/* Navigation Buttons */}
        {searchResults.length > 0 && (
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleFirst}
              disabled={currentResultIndex === 0}
              title="First result"
            >
              <ChevronsUp className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handlePrevious}
              disabled={searchResults.length === 0}
              title="Previous result"
            >
              <ChevronUp className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleNext}
              disabled={searchResults.length === 0}
              title="Next result"
            >
              <ChevronDown className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleLast}
              disabled={currentResultIndex === searchResults.length - 1}
              title="Last result"
            >
              <ChevronsDown className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>

      {/* Current Result Info */}
      {searchQuery && searchResults.length > 0 && (
        <div className="mt-2 rounded-md border bg-muted/50 p-2 text-xs">
          <span className="font-medium">Current match:</span>{" "}
          <span className="text-muted-foreground">
            Row {searchResults[currentResultIndex].rowIndex + 1} •{" "}
            {searchResults[currentResultIndex].matchText} •{" "}
            {searchResults[currentResultIndex].value}
          </span>
        </div>
      )}
    </div>
  );
}

/**
 * Highlight search text in a string
 */
export function HighlightedText({
  text,
  highlight,
  caseSensitive = false,
}: {
  text: string;
  highlight: string;
  caseSensitive?: boolean;
}) {
  if (!highlight.trim()) {
    return <span>{text}</span>;
  }

  const searchText = caseSensitive ? text : text.toLowerCase();
  const searchHighlight = caseSensitive ? highlight : highlight.toLowerCase();
  const index = searchText.indexOf(searchHighlight);

  if (index === -1) {
    return <span>{text}</span>;
  }

  const before = text.slice(0, index);
  const match = text.slice(index, index + highlight.length);
  const after = text.slice(index + highlight.length);

  return (
    <span>
      {before}
      <mark className="bg-yellow-200 font-semibold">{match}</mark>
      {after}
    </span>
  );
}
