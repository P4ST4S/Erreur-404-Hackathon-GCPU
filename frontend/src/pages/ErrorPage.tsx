import { useRouteError, isRouteErrorResponse, Link } from 'react-router-dom';
import { AlertTriangle, Home, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

/**
 * Generic error page for route errors
 * Displayed when an error occurs during route rendering
 */
export function ErrorPage() {
  const error = useRouteError();

  let errorMessage = 'An unexpected error occurred';
  let errorDetails = '';

  if (isRouteErrorResponse(error)) {
    errorMessage = error.statusText || errorMessage;
    errorDetails = error.data?.message || '';
  } else if (error instanceof Error) {
    errorMessage = error.message;
    errorDetails = error.stack || '';
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="mx-auto max-w-md text-center">
        {/* Icon */}
        <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-destructive/10">
          <AlertTriangle className="h-12 w-12 text-destructive" />
        </div>

        {/* Error message */}
        <h1 className="mb-2 text-3xl font-bold tracking-tight">
          Oops! Something went wrong
        </h1>
        <p className="mb-4 text-lg text-muted-foreground">{errorMessage}</p>

        {/* Error details (for development) */}
        {errorDetails && import.meta.env.DEV && (
          <div className="mb-6 rounded-lg border border-destructive/20 bg-destructive/5 p-4 text-left">
            <p className="mb-2 text-sm font-semibold text-destructive">
              Error Details:
            </p>
            <pre className="overflow-auto text-xs text-muted-foreground">
              {errorDetails}
            </pre>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button asChild size="lg">
            <Link to="/">
              <Home className="mr-2 h-4 w-4" />
              Go to Homepage
            </Link>
          </Button>
          <Button
            variant="outline"
            size="lg"
            onClick={() => window.location.reload()}
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Reload Page
          </Button>
        </div>

        {/* Help text */}
        <div className="mt-12 rounded-lg border bg-card p-4 text-sm">
          <p className="text-muted-foreground">
            If this problem persists, please{' '}
            <a
              href="mailto:support@example.com"
              className="font-medium text-primary hover:underline"
            >
              contact support
            </a>{' '}
            with the error details.
          </p>
        </div>
      </div>
    </div>
  );
}
