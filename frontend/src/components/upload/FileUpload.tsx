import * as React from "react";
import { Upload, X, FileText, AlertCircle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { UploadedFile, FileUploadError } from "@/types/file-upload";
import { validateFile, formatFileSize } from "@/lib/file-utils";

/**
 * FileUpload component props
 */
export interface FileUploadProps {
  /** Callback when files are successfully uploaded */
  onFilesSelected: (files: UploadedFile[]) => void;
  /** Callback when files are removed */
  onFilesRemoved?: (fileIds: string[]) => void;
  /** Maximum file size in bytes (default: 50MB) */
  maxFileSize?: number;
  /** Maximum number of files (default: 10) */
  maxFiles?: number;
  /** Accepted file formats */
  acceptedFormats?: string[];
  /** Whether to allow multiple file uploads */
  multiple?: boolean;
  /** Whether the upload is disabled */
  disabled?: boolean;
  /** Custom class name */
  className?: string;
}

/**
 * FileUpload Component
 *
 * A comprehensive file upload component designed for medical data anonymization.
 * Supports drag & drop, multiple file formats (CSV, JSON, Excel, FHIR), and
 * file size validation for secure medical document processing with Vertex AI.
 *
 * Features:
 * - Drag and drop functionality
 * - Multiple file format support (CSV, JSON, Excel, FHIR, PDF, DOCX)
 * - File size validation and limits
 * - Visual feedback for upload states
 * - HIPAA-compliant security messaging
 * - Accessible keyboard navigation
 *
 * @example
 * ```tsx
 * <FileUpload
 *   onFilesSelected={(files) => console.log(files)}
 *   maxFileSize={50 * 1024 * 1024} // 50MB
 *   maxFiles={10}
 *   multiple
 * />
 * ```
 */
export function FileUpload({
  onFilesSelected,
  onFilesRemoved,
  maxFileSize = 50 * 1024 * 1024, // 50MB default
  maxFiles = 10,
  acceptedFormats = [
    ".csv",
    ".json",
    ".xlsx",
    ".xls",
    ".fhir",
    ".pdf",
    ".docx",
    ".txt",
  ],
  multiple = true,
  disabled = false,
  className,
}: FileUploadProps) {
  const [files, setFiles] = React.useState<UploadedFile[]>([]);
  const [isDragging, setIsDragging] = React.useState(false);
  const [errors, setErrors] = React.useState<FileUploadError[]>([]);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const dragCounterRef = React.useRef(0);

  /**
   * Process and validate selected files
   */
  const processFiles = React.useCallback(
    (fileList: FileList | File[]) => {
      const newFiles: UploadedFile[] = [];
      const newErrors: FileUploadError[] = [];

      // Check if adding these files would exceed maxFiles
      const totalFiles = files.length + fileList.length;
      if (totalFiles > maxFiles) {
        newErrors.push({
          type: "max-files-exceeded",
          message: `Maximum ${maxFiles} files allowed. You're trying to upload ${totalFiles} files.`,
        });
        setErrors(newErrors);
        return;
      }

      Array.from(fileList).forEach((file) => {
        // Validate file
        const validation = validateFile(file, maxFileSize, acceptedFormats);

        if (validation.isValid) {
          const uploadedFile: UploadedFile = {
            id: `${file.name}-${Date.now()}-${Math.random()}`,
            file,
            name: file.name,
            size: file.size,
            type: file.type,
            status: "pending",
          };
          newFiles.push(uploadedFile);
        } else {
          newErrors.push({
            type: validation.error!,
            message: validation.message!,
            fileName: file.name,
          });
        }
      });

      if (newFiles.length > 0) {
        const updatedFiles = [...files, ...newFiles];
        setFiles(updatedFiles);
        onFilesSelected(newFiles);
      }

      if (newErrors.length > 0) {
        setErrors(newErrors);
        // Clear errors after 5 seconds
        setTimeout(() => setErrors([]), 5000);
      }
    },
    [files, maxFiles, maxFileSize, acceptedFormats, onFilesSelected]
  );

  /**
   * Handle file input change
   */
  const handleFileInputChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const fileList = event.target.files;
    if (fileList && fileList.length > 0) {
      processFiles(fileList);
    }
    // Reset input value to allow selecting the same file again
    event.target.value = "";
  };

  /**
   * Handle file removal
   */
  const handleRemoveFile = (fileId: string) => {
    const updatedFiles = files.filter((f) => f.id !== fileId);
    setFiles(updatedFiles);
    onFilesRemoved?.([ fileId]);
  };

  /**
   * Handle drag events
   */
  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current++;
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current--;
    if (dragCounterRef.current === 0) {
      setIsDragging(false);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    dragCounterRef.current = 0;

    if (disabled) return;

    const fileList = e.dataTransfer.files;
    if (fileList && fileList.length > 0) {
      processFiles(fileList);
    }
  };

  /**
   * Open file dialog
   */
  const handleClick = () => {
    if (!disabled) {
      fileInputRef.current?.click();
    }
  };

  /**
   * Handle keyboard navigation
   */
  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if ((e.key === "Enter" || e.key === " ") && !disabled) {
      e.preventDefault();
      handleClick();
    }
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* Drop zone */}
      <div
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-label="File upload area"
        aria-disabled={disabled}
        className={cn(
          "relative rounded-lg border-2 border-dashed transition-all duration-200",
          "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
          isDragging
            ? "border-primary bg-primary/5"
            : "border-border hover:border-primary/50 hover:bg-accent/50",
          disabled && "cursor-not-allowed opacity-50",
          !disabled && "cursor-pointer"
        )}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
      >
        <div className="p-8 text-center md:p-12">
          {/* Upload icon */}
          <div
            className={cn(
              "mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full transition-colors",
              isDragging ? "bg-primary/20" : "bg-primary/10"
            )}
          >
            <Upload
              className={cn(
                "h-8 w-8 transition-colors",
                isDragging ? "text-primary" : "text-primary"
              )}
            />
          </div>

          {/* Instructions */}
          <h3 className="mb-2 text-lg font-semibold">
            Upload Medical Documents
          </h3>
          <p className="text-muted-foreground mb-4 text-sm">
            {isDragging
              ? "Drop files here to upload"
              : "Drag and drop files here, or click to browse"}
          </p>

          <Button
            type="button"
            variant="default"
            size="lg"
            disabled={disabled}
            onClick={(e) => {
              e.stopPropagation();
              handleClick();
            }}
            className="shadow-lg hover:shadow-xl hover:scale-105 transition-all font-semibold"
          >
            <Upload className="mr-2 h-5 w-5" />
            Choose Files
          </Button>

          {/* File format and size info */}
          <div className="text-muted-foreground mt-4 space-y-1 text-xs">
            <p>
              Supports CSV, JSON, Excel (.xlsx, .xls), FHIR, PDF, DOCX, and TXT
            </p>
            <p>
              Maximum file size: {formatFileSize(maxFileSize)} • Maximum{" "}
              {maxFiles} files
            </p>
          </div>

          {/* HIPAA compliance notice */}
          <div className="mt-4 flex items-center justify-center gap-2 text-xs text-blue-600 dark:text-blue-500">
            <CheckCircle2 className="h-4 w-4" />
            <span>HIPAA & GDPR Compliant Processing</span>
          </div>
        </div>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          multiple={multiple}
          accept={acceptedFormats.join(",")}
          onChange={handleFileInputChange}
          disabled={disabled}
          className="sr-only"
          aria-hidden="true"
        />
      </div>

      {/* Error messages */}
      {errors.length > 0 && (
        <div className="space-y-2">
          {errors.map((error, index) => (
            <div
              key={index}
              className="flex items-start gap-2 rounded-md border border-destructive/50 bg-destructive/10 p-3 text-sm"
              role="alert"
            >
              <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-destructive" />
              <div className="flex-1">
                {error.fileName && (
                  <span className="font-medium">{error.fileName}: </span>
                )}
                <span className="text-destructive">{error.message}</span>
              </div>
              <button
                onClick={() =>
                  setErrors((prev) => prev.filter((_, i) => i !== index))
                }
                className="text-destructive hover:text-destructive/80 transition-colors"
                aria-label="Dismiss error"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Uploaded files list */}
      {files.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium">
            Uploaded Files ({files.length}/{maxFiles})
          </h4>
          <div className="space-y-2">
            {files.map((file) => (
              <div
                key={file.id}
                className="flex items-center justify-between rounded-md border bg-card p-3 transition-colors hover:bg-accent/50"
              >
                <div className="flex items-center gap-3 overflow-hidden">
                  <FileText className="text-primary h-5 w-5 flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{file.name}</p>
                    <p className="text-muted-foreground text-xs">
                      {formatFileSize(file.size)}
                      {file.type && ` • ${file.type}`}
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleRemoveFile(file.id)}
                  disabled={disabled}
                  aria-label={`Remove ${file.name}`}
                  className="flex-shrink-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
