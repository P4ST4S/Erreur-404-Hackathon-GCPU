import { Upload, FileText, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

/**
 * Anonymize page - Document upload and anonymization interface
 */
export function Anonymize() {
  return (
    <div className="space-y-8">
      {/* Page header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Anonymize Documents
        </h1>
        <p className="text-muted-foreground">
          Upload medical documents to automatically identify and redact
          sensitive patient information.
        </p>
      </div>

      {/* Upload area */}
      <div className="rounded-lg border-2 border-dashed bg-card p-12 text-center transition-colors hover:border-primary/50">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
          <Upload className="h-8 w-8 text-primary" />
        </div>
        <h3 className="mb-2 text-lg font-semibold">Upload Medical Documents</h3>
        <p className="mb-4 text-sm text-muted-foreground">
          Drag and drop files here, or click to browse
        </p>
        <Button>Choose Files</Button>
        <p className="mt-4 text-xs text-muted-foreground">
          Supports PDF, DOCX, TXT, and image files up to 50MB
        </p>
      </div>

      {/* Info cards */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Supported data types */}
        <div className="rounded-lg border bg-card p-6">
          <div className="mb-4 flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            <h3 className="font-semibold">Detected Information</h3>
          </div>
          <ul className="space-y-2 text-sm text-muted-foreground">
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
        <div className="rounded-lg border border-blue-500/20 bg-blue-500/5 p-6">
          <div className="mb-4 flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-500" />
            <h3 className="font-semibold">Security & Compliance</h3>
          </div>
          <p className="text-sm text-muted-foreground">
            All documents are encrypted in transit and at rest. Our AI processes
            data in compliance with HIPAA and GDPR regulations. Original
            documents are securely deleted after anonymization.
          </p>
        </div>
      </div>
    </div>
  );
}
