/**
 * Type definitions for conflict detection and resolution
 */

export interface ColumnInfo {
  name: string;
  dtype: string;
  file_id: number;
  file_name: string;
  samples?: string[];
}

export interface ColumnConflict {
  column_name: string;
  variations: ColumnInfo[];
  is_missing?: boolean;
  is_duplicate?: boolean;
}

export interface ConflictDetectionResponse {
  dataset_id: number;
  has_conflicts: boolean;
  conflicts: ColumnConflict[];
  total_columns: number;
  message: string;
}

export interface MergeMapping {
  [finalColumnName: string]: string[]; // final name -> list of original column names
}

export interface MergeRequest {
  dataset_id: number;
  merges: MergeMapping;
}

export interface MergeResponse {
  status: string;
  message: string;
  merged_file_id?: number;
}

export interface ColumnMappingGroup {
  finalName: string;
  selectedColumns: Map<number, string>; // file_id -> column_name
  availableColumns: ColumnInfo[];
}
