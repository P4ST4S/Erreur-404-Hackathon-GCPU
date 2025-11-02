import type { FileValidationResult } from "@/types/file-upload";

/**
 * File Utility Functions
 *
 * Utility functions for file validation, formatting, and processing
 * in the medical data anonymization system.
 */

/**
 * Validate a file against size and format constraints
 *
 * @param file - The file to validate
 * @param maxSize - Maximum file size in bytes
 * @param acceptedFormats - Array of accepted file extensions (e.g., ['.csv', '.json'])
 * @returns Validation result with error details if invalid
 *
 * @example
 * ```ts
 * const result = validateFile(file, 50 * 1024 * 1024, ['.csv', '.json']);
 * if (!result.isValid) {
 *   console.error(result.message);
 * }
 * ```
 */
export function validateFile(
  file: File,
  maxSize: number,
  acceptedFormats: string[]
): FileValidationResult {
  if (file.size > maxSize) {
    return {
      isValid: false,
      error: "file-too-large",
      message: `File size (${formatFileSize(file.size)}) exceeds maximum allowed size (${formatFileSize(maxSize)})`,
    };
  }
  const fileExtension = getFileExtension(file.name);
  const isValidFormat = acceptedFormats.some((format) =>
    fileExtension.toLowerCase().endsWith(format.toLowerCase())
  );

  if (!isValidFormat) {
    return {
      isValid: false,
      error: "file-invalid-type",
      message: `File type "${fileExtension}" is not supported. Accepted formats: ${acceptedFormats.join(", ")}`,
    };
  }
  const validation = validateMedicalFileFormat(file);
  if (!validation.isValid) {
    return validation;
  }

  return {
    isValid: true,
  };
}

/**
 * Validate medical-specific file formats
 *
 * @param file - The file to validate
 * @returns Validation result
 */
function validateMedicalFileFormat(file: File): FileValidationResult {
  const extension = getFileExtension(file.name).toLowerCase();
  if (extension === ".fhir" || file.type === "application/fhir+json") {
    if (!file.type.includes("json") && extension !== ".json") {
      return {
        isValid: false,
        error: "validation-error",
        message: "FHIR files must be in JSON format",
      };
    }
  }
  if (extension === ".xlsx" || extension === ".xls") {
    const validExcelTypes = [
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/vnd.ms-excel",
    ];
    if (file.type && !validExcelTypes.includes(file.type)) {
      return {
        isValid: false,
        error: "file-invalid-type",
        message: "Invalid Excel file format",
      };
    }
  }

  return {
    isValid: true,
  };
}

/**
 * Format file size to human-readable string
 *
 * @param bytes - File size in bytes
 * @param decimals - Number of decimal places (default: 2)
 * @returns Formatted file size string
 *
 * @example
 * ```ts
 * formatFileSize(1024) // "1 KB"
 * formatFileSize(1536000) // "1.46 MB"
 * formatFileSize(52428800) // "50 MB"
 * ```
 */
export function formatFileSize(bytes: number, decimals: number = 2): string {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

/**
 * Get file extension from filename
 *
 * @param filename - The filename
 * @returns File extension with dot (e.g., '.csv')
 *
 * @example
 * ```ts
 * getFileExtension('data.csv') // ".csv"
 * getFileExtension('report.backup.json') // ".json"
 * ```
 */
export function getFileExtension(filename: string): string {
  const lastDotIndex = filename.lastIndexOf(".");
  if (lastDotIndex === -1) return "";
  return filename.slice(lastDotIndex);
}

/**
 * Get human-readable file type from filename or MIME type
 *
 * @param file - The file object
 * @returns Human-readable file type
 *
 * @example
 * ```ts
 * getFileType(csvFile) // "CSV"
 * getFileType(jsonFile) // "JSON"
 * getFileType(excelFile) // "Excel"
 * ```
 */
export function getFileType(file: File): string {
  const extension = getFileExtension(file.name).toLowerCase();
  const typeMap: Record<string, string> = {
    ".csv": "CSV",
    ".json": "JSON",
    ".xlsx": "Excel",
    ".xls": "Excel",
    ".fhir": "FHIR",
    ".xml": "XML",
    ".pdf": "PDF",
    ".docx": "Word Document",
    ".doc": "Word Document",
    ".txt": "Text",
    ".png": "Image",
    ".jpg": "Image",
    ".jpeg": "Image",
    ".tiff": "Image",
    ".tif": "Image",
  };

  return typeMap[extension] || extension.slice(1).toUpperCase();
}

/**
 * Check if a file is a structured data format (CSV, JSON, Excel, FHIR)
 *
 * @param file - The file to check
 * @returns True if the file is a structured data format
 */
export function isStructuredDataFormat(file: File): boolean {
  const extension = getFileExtension(file.name).toLowerCase();
  const structuredFormats = [".csv", ".json", ".xlsx", ".xls", ".fhir", ".xml"];
  return structuredFormats.includes(extension);
}

/**
 * Check if a file is a document format (PDF, DOCX, TXT)
 *
 * @param file - The file to check
 * @returns True if the file is a document format
 */
export function isDocumentFormat(file: File): boolean {
  const extension = getFileExtension(file.name).toLowerCase();
  const documentFormats = [".pdf", ".docx", ".doc", ".txt"];
  return documentFormats.includes(extension);
}

/**
 * Check if a file is an image format
 *
 * @param file - The file to check
 * @returns True if the file is an image format
 */
export function isImageFormat(file: File): boolean {
  const extension = getFileExtension(file.name).toLowerCase();
  const imageFormats = [".png", ".jpg", ".jpeg", ".tiff", ".tif"];
  return imageFormats.includes(extension);
}

/**
 * Generate a unique file ID
 *
 * @param file - The file object
 * @returns Unique file identifier
 */
export function generateFileId(file: File): string {
  return `${file.name}-${file.size}-${Date.now()}-${Math.random().toString(36).substring(7)}`;
}

/**
 * Read file as text (for CSV, JSON, TXT, FHIR files)
 *
 * @param file - The file to read
 * @returns Promise resolving to file content as string
 */
export function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      resolve(content);
    };
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsText(file);
  });
}

/**
 * Read file as data URL (for images)
 *
 * @param file - The file to read
 * @returns Promise resolving to file content as data URL
 */
export function readFileAsDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      resolve(dataUrl);
    };
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });
}

/**
 * Validate JSON file content
 *
 * @param file - The JSON file to validate
 * @returns Promise resolving to validation result
 */
export async function validateJsonFile(
  file: File
): Promise<FileValidationResult> {
  try {
    const content = await readFileAsText(file);
    JSON.parse(content);
    return { isValid: true };
  } catch (error) {
    return {
      isValid: false,
      error: "validation-error",
      message: "Invalid JSON format",
    };
  }
}

/**
 * Validate FHIR file content
 *
 * @param file - The FHIR file to validate
 * @returns Promise resolving to validation result
 */
export async function validateFhirFile(
  file: File
): Promise<FileValidationResult> {
  try {
    const content = await readFileAsText(file);
    const data = JSON.parse(content);
    if (!data.resourceType) {
      return {
        isValid: false,
        error: "validation-error",
        message: "Invalid FHIR format: missing resourceType",
      };
    }

    return { isValid: true };
  } catch (error) {
    return {
      isValid: false,
      error: "validation-error",
      message: "Invalid FHIR format",
    };
  }
}
