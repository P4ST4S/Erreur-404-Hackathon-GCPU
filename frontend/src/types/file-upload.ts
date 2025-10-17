/**
 * File Upload Types
 *
 * Type definitions for the medical document file upload system.
 * Supports CSV, JSON, Excel, FHIR, and other medical data formats.
 */

/**
 * Status of an uploaded file
 */
export type FileUploadStatus = "pending" | "uploading" | "success" | "error";

/**
 * Uploaded file representation
 */
export interface UploadedFile {
  /** Unique identifier for the file */
  id: string;
  /** The actual File object */
  file: File;
  /** File name */
  name: string;
  /** File size in bytes */
  size: number;
  /** MIME type */
  type: string;
  /** Upload status */
  status: FileUploadStatus;
  /** Upload progress (0-100) */
  progress?: number;
  /** Error message if upload failed */
  error?: string;
  /** Preview URL for images/PDFs (optional) */
  preview?: string;
}

/**
 * File upload error types
 */
export type FileErrorType =
  | "file-too-large"
  | "file-invalid-type"
  | "max-files-exceeded"
  | "upload-failed"
  | "validation-error";

/**
 * File upload error
 */
export interface FileUploadError {
  /** Error type */
  type: FileErrorType;
  /** Error message */
  message: string;
  /** File name that caused the error (optional) */
  fileName?: string;
}

/**
 * File validation result
 */
export interface FileValidationResult {
  /** Whether the file is valid */
  isValid: boolean;
  /** Error type if invalid */
  error?: FileErrorType;
  /** Error message if invalid */
  message?: string;
}

/**
 * Supported medical file formats
 */
export const MEDICAL_FILE_FORMATS = {
  // Structured data formats
  CSV: ".csv",
  JSON: ".json",
  EXCEL: [".xlsx", ".xls"],
  FHIR: ".fhir",
  XML: ".xml",

  // Document formats
  PDF: ".pdf",
  DOCX: ".docx",
  DOC: ".doc",
  TXT: ".txt",

  // Image formats (for scanned documents)
  PNG: ".png",
  JPG: [".jpg", ".jpeg"],
  TIFF: [".tiff", ".tif"],
} as const;

/**
 * MIME types for medical file formats
 */
export const MEDICAL_MIME_TYPES = {
  // Structured data
  "text/csv": "CSV",
  "application/json": "JSON",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": "Excel",
  "application/vnd.ms-excel": "Excel",
  "application/fhir+json": "FHIR",
  "application/xml": "XML",
  "text/xml": "XML",

  // Documents
  "application/pdf": "PDF",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
    "DOCX",
  "application/msword": "DOC",
  "text/plain": "TXT",

  // Images
  "image/png": "PNG",
  "image/jpeg": "JPEG",
  "image/tiff": "TIFF",
} as const;

/**
 * File upload configuration
 */
export interface FileUploadConfig {
  /** Maximum file size in bytes */
  maxFileSize: number;
  /** Maximum number of files */
  maxFiles: number;
  /** Accepted file extensions */
  acceptedFormats: string[];
  /** Whether to allow multiple files */
  multiple: boolean;
}

/**
 * Default file upload configuration for medical documents
 */
export const DEFAULT_UPLOAD_CONFIG: FileUploadConfig = {
  maxFileSize: 50 * 1024 * 1024, // 50MB
  maxFiles: 10,
  acceptedFormats: [
    ".csv",
    ".json",
    ".xlsx",
    ".xls",
    ".fhir",
    ".xml",
    ".pdf",
    ".docx",
    ".doc",
    ".txt",
    ".png",
    ".jpg",
    ".jpeg",
  ],
  multiple: true,
};
