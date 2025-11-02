import {
  useRouteError,
  isRouteErrorResponse,
  useNavigate,
} from "react-router-dom";
import { AlertTriangle, Home, ArrowLeft, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect } from "react";

/**
 * Route Error Boundary Component
 * Handles errors that occur during route rendering
 * Works with React Router's errorElement prop
 *
 * Handles different error types:
 * - Route errors (404, 403, etc.)
 * - Network errors
 * - JavaScript errors
 * - Unknown errors
 *
 * @example
 * // In router configuration:
 * {
 *   path: '/dashboard',
 *   element: <Dashboard />,
 *   errorElement: <RouteErrorBoundary />
 * }
 */
export function RouteErrorBoundary() {
  const error = useRouteError();
  const navigate = useNavigate();
  useEffect(() => {
    if (import.meta.env.DEV) {
      console.error("Route error:", error);
    }
  }, [error]);

  let errorMessage = "An unexpected error occurred";
  let errorTitle = "Something went wrong";
  let errorStatus: number | undefined;
  let errorDetails = "";
  if (isRouteErrorResponse(error)) {
    errorStatus = error.status;
    errorMessage = error.statusText || errorMessage;
    errorDetails = error.data?.message || "";
    switch (error.status) {
      case 404:
        errorTitle = "Page Not Found";
        errorMessage = "The page you're looking for doesn't exist";
        break;
      case 401:
        errorTitle = "Unauthorized";
        errorMessage = "You need to be logged in to view this page";
        break;
      case 403:
        errorTitle = "Forbidden";
        errorMessage = "You don't have permission to access this page";
        break;
      case 500:
        errorTitle = "Server Error";
        errorMessage = "An internal server error occurred";
        break;
    }
  } else if (error instanceof Error) {
    errorMessage = error.message;
    errorDetails = error.stack || "";
  } else if (typeof error === "string") {
    errorMessage = error;
  }

  const handleGoBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate("/");
    }
  };

  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <div className="bg-background flex min-h-screen items-center justify-center px-4">
      <div className="mx-auto max-w-md text-center">
        {/* Icon */}
        <div className="bg-destructive/10 mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full">
          <AlertTriangle className="text-destructive h-12 w-12" />
        </div>

        {/* Error status */}
        {errorStatus && (
          <div className="text-muted-foreground/50 mb-2 text-6xl font-bold tracking-tight">
            {errorStatus}
          </div>
        )}

        {/* Error title */}
        <h1 className="mb-2 text-3xl font-bold tracking-tight">{errorTitle}</h1>

        {/* Error message */}
        <p className="text-muted-foreground mb-4 text-lg">{errorMessage}</p>

        {/* Error details (development only) */}
        {import.meta.env.DEV && errorDetails && (
          <div className="border-destructive/20 bg-destructive/5 mb-6 max-h-40 overflow-auto rounded-lg border p-4 text-left">
            <p className="text-destructive mb-2 text-sm font-semibold">
              Error Details:
            </p>
            <pre className="text-muted-foreground text-xs whitespace-pre-wrap">
              {errorDetails}
            </pre>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button size="lg" onClick={handleGoBack}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Go Back
          </Button>
          <Button variant="outline" size="lg" onClick={handleRefresh}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          <Button variant="outline" size="lg" onClick={() => navigate("/")}>
            <Home className="mr-2 h-4 w-4" />
            Home
          </Button>
        </div>

        {/* Help text */}
        <div className="bg-card mt-12 rounded-lg border p-4 text-sm">
          <p className="text-muted-foreground">
            If this problem persists, please{" "}
            <a
              href="mailto:support@MedicAnonym.com"
              className="text-primary font-medium hover:underline"
            >
              contact support
            </a>{" "}
            with the error details above.
          </p>
        </div>
      </div>
    </div>
  );
}
