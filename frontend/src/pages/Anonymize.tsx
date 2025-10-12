import { FileText, AlertCircle, Brain, Sparkles } from "lucide-react";
import { FileUpload } from "@/components/upload/FileUpload";
import type { UploadedFile } from "@/types/file-upload";
import { useState } from "react";
import { Button } from "@/components/ui/button";

/**
 * Anonymize page - Document upload and anonymization interface
 * Uses Vertex AI for intelligent medical data anonymization
 */
export function Anonymize() {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  /**
   * Handle files selected by the user
   */
  const handleFilesSelected = (files: UploadedFile[]) => {
    setUploadedFiles((prev) => [...prev, ...files]);
  };

  /**
   * Handle files removed by the user
   */
  const handleFilesRemoved = (fileIds: string[]) => {
    setUploadedFiles((prev) =>
      prev.filter((file) => !fileIds.includes(file.id))
    );
  };

  /**
   * Process files with Vertex AI anonymization
   * TODO: Integrate with backend Vertex AI API
   */
  const handleAnonymize = async () => {
    if (uploadedFiles.length === 0) return;

    setIsProcessing(true);
    try {
      // TODO: Send files to backend for Vertex AI processing
      // const response = await fetch('/api/anonymize', {
      //   method: 'POST',
      //   body: formData,
      // });

      // Simulate processing for now
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Show success message or navigate to results
      console.log("Files processed:", uploadedFiles);
    } catch (error) {
      console.error("Anonymization failed:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Page header */}
      <div>
        <h1 className="flex items-center gap-3 text-3xl font-bold tracking-tight">
          Anonymize Documents
          <Brain className="text-teal-medical h-8 w-8" />
        </h1>
        <p className="text-muted-foreground mt-2">
          Upload medical documents to automatically identify and redact
          sensitive patient information using AI-powered anonymization.
        </p>
      </div>

      {/* File Upload Component */}
      <FileUpload
        onFilesSelected={handleFilesSelected}
        onFilesRemoved={handleFilesRemoved}
        maxFileSize={50 * 1024 * 1024} // 50MB
        maxFiles={10}
        multiple
      />

      {/* Anonymize Button */}
      {uploadedFiles.length > 0 && (
        <div className="flex items-center justify-center">
          <Button
            size="lg"
            onClick={handleAnonymize}
            disabled={isProcessing}
            className="gap-2"
          >
            <Sparkles className="h-5 w-5" />
            {isProcessing
              ? "Processing with AI..."
              : `Anonymize ${uploadedFiles.length} ${uploadedFiles.length === 1 ? "File" : "Files"}`}
          </Button>
        </div>
      )}

      {/* Info cards */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Supported data types */}
        <div className="bg-card rounded-lg border p-6">
          <div className="mb-4 flex items-center gap-2">
            <FileText className="text-teal-medical h-5 w-5" />
            <h3 className="font-semibold">Detected Information</h3>
          </div>
          <ul className="text-muted-foreground space-y-2 text-sm">
            <li>• Patient names and identifiers</li>
            <li>• Medical record numbers (MRN)</li>
            <li>• Social Security Numbers (SSN)</li>
            <li>• Dates of birth and ages</li>
            <li>• Phone numbers and addresses</li>
            <li>• Email addresses</li>
            <li>• Medical device identifiers</li>
          </ul>
        </div>

        {/* Security notice */}
        <div className="border-teal-medical/20 rounded-lg border bg-[#5dbdb9]/5 p-6">
          <div className="mb-4 flex items-center gap-2">
            <AlertCircle className="text-teal-medical h-5 w-5" />
            <h3 className="font-semibold">Security & Compliance</h3>
          </div>
          <p className="text-muted-foreground text-sm">
            All documents are encrypted in transit and at rest. Our AI processes
            data in compliance with HIPAA and GDPR regulations. Original
            documents are securely deleted after anonymization.
          </p>
        </div>
      </div>
    </div>
  );
}
