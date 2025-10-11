import { useRouteError, isRouteErrorResponse, Link } from "react-router-dom";
import { AlertTriangle, Home, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Generic error page for route errors
 * Displayed when an error occurs during route rendering
 */
export function ErrorPage() {
    const error = useRouteError();

    let errorMessage = "An unexpected error occurred";
    let errorDetails = "";

    if (isRouteErrorResponse(error)) {
        errorMessage = error.statusText || errorMessage;
        errorDetails = error.data?.message || "";
    } else if (error instanceof Error) {
        errorMessage = error.message;
        errorDetails = error.stack || "";
    }

    return (
        <div className="bg-background flex min-h-screen items-center justify-center px-4">
            <div className="mx-auto max-w-md text-center">
                {/* Icon */}
                <div className="bg-destructive/10 mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full">
                    <AlertTriangle className="text-destructive h-12 w-12" />
                </div>

                {/* Error message */}
                <h1 className="mb-2 text-3xl font-bold tracking-tight">
                    Oops! Something went wrong
                </h1>
                <p className="text-muted-foreground mb-4 text-lg">
                    {errorMessage}
                </p>

                {/* Error details (for development) */}
                {errorDetails && import.meta.env.DEV && (
                    <div className="border-destructive/20 bg-destructive/5 mb-6 rounded-lg border p-4 text-left">
                        <p className="text-destructive mb-2 text-sm font-semibold">
                            Error Details:
                        </p>
                        <pre className="text-muted-foreground overflow-auto text-xs">
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
                <div className="bg-card mt-12 rounded-lg border p-4 text-sm">
                    <p className="text-muted-foreground">
                        If this problem persists, please{" "}
                        <a
                            href="mailto:support@example.com"
                            className="text-primary font-medium hover:underline"
                        >
                            contact support
                        </a>{" "}
                        with the error details.
                    </p>
                </div>
            </div>
        </div>
    );
}
