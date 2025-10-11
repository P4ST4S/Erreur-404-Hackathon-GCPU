import { Component, type ReactNode } from "react";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Error boundary props
 */
interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: (error: Error, reset: () => void) => ReactNode;
}

/**
 * Error boundary state
 */
interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * Error Boundary component
 * Catches JavaScript errors anywhere in the child component tree
 * Logs errors and displays a fallback UI
 *
 * @example
 * <ErrorBoundary>
 *   <App />
 * </ErrorBoundary>
 */
export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error to console in development
    if (import.meta.env.DEV) {
      console.error("Error caught by boundary:", error, errorInfo);
    }

    // TODO: Log to error reporting service in production
    // Example: Sentry.captureException(error, { extra: errorInfo });
  }

  reset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError && this.state.error) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback(this.state.error, this.reset);
      }

      // Default fallback UI
      return (
        <div className="bg-background flex min-h-screen items-center justify-center px-4">
          <div className="mx-auto max-w-md text-center">
            {/* Icon */}
            <div className="bg-destructive/10 mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full">
              <AlertTriangle className="text-destructive h-12 w-12" />
            </div>

            {/* Error message */}
            <h1 className="mb-2 text-3xl font-bold tracking-tight">
              Something went wrong
            </h1>
            <p className="text-muted-foreground mb-4 text-lg">
              {this.state.error.message || "An unexpected error occurred"}
            </p>

            {/* Error details (development only) */}
            {import.meta.env.DEV && this.state.error.stack && (
              <div className="border-destructive/20 bg-destructive/5 mb-6 max-h-40 overflow-auto rounded-lg border p-4 text-left">
                <p className="text-destructive mb-2 text-sm font-semibold">
                  Stack Trace:
                </p>
                <pre className="text-muted-foreground text-xs">
                  {this.state.error.stack}
                </pre>
              </div>
            )}

            {/* Action buttons */}
            <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Button size="lg" onClick={this.reset}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Try Again
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() => (window.location.href = "/")}
              >
                <Home className="mr-2 h-4 w-4" />
                Go Home
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
                </a>
                .
              </p>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
