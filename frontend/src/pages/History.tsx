/**
 * History Page
 *
 * Displays all datasets with filtering, sorting, and search capabilities
 */

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Download,
  Filter,
  Calendar,
  FileCheck,
  SortAsc,
  SortDesc,
  ChevronLeft,
  Trash2,
  Eye,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { DataQualityIndicator } from "@/components/data-analysis/DataQualityIndicator";

interface Dataset {
  id: string;
  name: string;
  rows: number;
  columns: number;
  sensitiveColumns: number;
  qualityScore: number;
  processedDate: string;
  status: "completed" | "processing" | "failed";
  fileSize: string;
  format: "CSV" | "JSON" | "Excel";
}

export function History() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"date" | "name" | "quality">("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [filterStatus, setFilterStatus] = useState<"all" | "completed" | "processing" | "failed">("all");
  const [datasets] = useState<Dataset[]>([
    {
      id: "1",
      name: "patient_records_2024.csv",
      rows: 15420,
      columns: 24,
      sensitiveColumns: 8,
      qualityScore: 94,
      processedDate: "2024-03-15T10:30:00Z",
      status: "completed",
      fileSize: "2.3 MB",
      format: "CSV",
    },
    {
      id: "2",
      name: "medical_diagnoses_q1.json",
      rows: 8930,
      columns: 18,
      sensitiveColumns: 5,
      qualityScore: 88,
      processedDate: "2024-03-14T14:22:00Z",
      status: "completed",
      fileSize: "1.8 MB",
      format: "JSON",
    },
    {
      id: "3",
      name: "lab_results_march.xlsx",
      rows: 12500,
      columns: 32,
      sensitiveColumns: 10,
      qualityScore: 91,
      processedDate: "2024-03-13T09:15:00Z",
      status: "completed",
      fileSize: "3.1 MB",
      format: "Excel",
    },
    {
      id: "4",
      name: "treatment_history.csv",
      rows: 6780,
      columns: 20,
      sensitiveColumns: 7,
      qualityScore: 85,
      processedDate: "2024-03-12T16:45:00Z",
      status: "completed",
      fileSize: "1.2 MB",
      format: "CSV",
    },
    {
      id: "5",
      name: "insurance_claims_2024.json",
      rows: 20150,
      columns: 28,
      sensitiveColumns: 12,
      qualityScore: 96,
      processedDate: "2024-03-11T11:00:00Z",
      status: "completed",
      fileSize: "4.5 MB",
      format: "JSON",
    },
  ]);

  const handleDownload = (datasetId: string) => {
    console.log("Download dataset:", datasetId);
  };

  const handleView = (datasetId: string) => {
    console.log("View dataset:", datasetId);
    navigate("/anonymize"); // Navigate to anonymize page with dataset
  };

  const handleDelete = (datasetId: string) => {
    console.log("Delete dataset:", datasetId);
  };

  const toggleSort = (field: "date" | "name" | "quality") => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("desc");
    }
  };
  const filteredDatasets = datasets
    .filter((ds) => {
      const matchesSearch = ds.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = filterStatus === "all" || ds.status === filterStatus;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      let comparison = 0;
      if (sortBy === "date") {
        comparison = new Date(a.processedDate).getTime() - new Date(b.processedDate).getTime();
      } else if (sortBy === "name") {
        comparison = a.name.localeCompare(b.name);
      } else if (sortBy === "quality") {
        comparison = a.qualityScore - b.qualityScore;
      }
      return sortOrder === "asc" ? comparison : -comparison;
    });

  const getStatusBadge = (status: Dataset["status"]) => {
    const styles = {
      completed: "bg-green-500/10 text-green-600 border-green-500/20",
      processing: "bg-blue-500/10 text-blue-600 border-blue-500/20",
      failed: "bg-red-500/10 text-red-600 border-red-500/20",
    };
    return (
      <span className={`rounded-full border px-2.5 py-0.5 text-xs font-medium ${styles[status]}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/dashboard")}
            className="mb-4 -ml-2"
          >
            <ChevronLeft className="mr-1 h-4 w-4" />
            Back to Dashboard
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">Dataset History</h1>
          <p className="mt-2 text-muted-foreground">
            View and manage all processed medical datasets
          </p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative flex-1 lg:max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search datasets..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-10 w-full rounded-md border border-input bg-background pl-9 pr-3 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Status Filter */}
          <div className="flex items-center gap-2 rounded-md border bg-background px-3 py-1.5">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as typeof filterStatus)}
              className="border-none bg-transparent text-sm outline-none"
            >
              <option value="all">All Status</option>
              <option value="completed">Completed</option>
              <option value="processing">Processing</option>
              <option value="failed">Failed</option>
            </select>
          </div>

          {/* Sort Buttons */}
          <Button
            variant={sortBy === "date" ? "default" : "outline"}
            size="sm"
            onClick={() => toggleSort("date")}
          >
            <Calendar className="mr-1 h-4 w-4" />
            Date
            {sortBy === "date" && (
              sortOrder === "asc" ? <SortAsc className="ml-1 h-4 w-4" /> : <SortDesc className="ml-1 h-4 w-4" />
            )}
          </Button>

          <Button
            variant={sortBy === "name" ? "default" : "outline"}
            size="sm"
            onClick={() => toggleSort("name")}
          >
            Name
            {sortBy === "name" && (
              sortOrder === "asc" ? <SortAsc className="ml-1 h-4 w-4" /> : <SortDesc className="ml-1 h-4 w-4" />
            )}
          </Button>

          <Button
            variant={sortBy === "quality" ? "default" : "outline"}
            size="sm"
            onClick={() => toggleSort("quality")}
          >
            Quality
            {sortBy === "quality" && (
              sortOrder === "asc" ? <SortAsc className="ml-1 h-4 w-4" /> : <SortDesc className="ml-1 h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      {/* Results count */}
      <div className="text-sm text-muted-foreground">
        Showing {filteredDatasets.length} of {datasets.length} datasets
      </div>

      {/* Datasets Grid */}
      <div className="grid gap-4">
        {filteredDatasets.length === 0 ? (
          <div className="rounded-lg border bg-card p-12 text-center">
            <FileCheck className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
            <p className="text-lg font-medium">No datasets found</p>
            <p className="mt-2 text-sm text-muted-foreground">
              {searchQuery
                ? "Try adjusting your search or filters"
                : "Upload your first dataset to get started"}
            </p>
            <Button className="mt-4" onClick={() => navigate("/anonymize")}>
              Upload Dataset
            </Button>
          </div>
        ) : (
          filteredDatasets.map((dataset) => (
            <div
              key={dataset.id}
              className="rounded-lg border bg-card p-6 transition-colors hover:bg-muted/50"
            >
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                {/* Dataset Info */}
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#5dbdb9]/10">
                    <FileCheck className="h-6 w-6 text-teal-medical" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{dataset.name}</h3>
                      {getStatusBadge(dataset.status)}
                    </div>
                    <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                      <span>{dataset.rows.toLocaleString()} rows</span>
                      <span>•</span>
                      <span>{dataset.columns} columns</span>
                      <span>•</span>
                      <span className="text-red-600">{dataset.sensitiveColumns} sensitive</span>
                      <span>•</span>
                      <span>{dataset.fileSize}</span>
                      <span>•</span>
                      <span className="rounded bg-muted px-1.5 py-0.5 text-xs">{dataset.format}</span>
                    </div>
                    <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      {new Date(dataset.processedDate).toLocaleString()}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-4">
                  <DataQualityIndicator score={dataset.qualityScore} size="sm" showLabel />
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleView(dataset.id)}
                      title="View dataset"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDownload(dataset.id)}
                      title="Download dataset"
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(dataset.id)}
                      className="text-red-600 hover:bg-red-500/10 hover:text-red-600"
                      title="Delete dataset"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
