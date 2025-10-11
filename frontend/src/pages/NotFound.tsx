import { Link, useNavigate } from "react-router-dom";
import { FileQuestion, Home, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * 404 Not Found page
 * Displayed when user navigates to a non-existent route
 */
export function NotFound() {
  const navigate = useNavigate();

  const handleGoBack = () => {
    // Only go back if there's history, otherwise go to home
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate("/");
    }
  };

  return (
    <div className="bg-background flex min-h-screen items-center justify-center px-4">
      <div className="mx-auto max-w-md text-center">
        {/* Icon */}
        <div className="bg-muted mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full">
          <FileQuestion className="text-muted-foreground h-12 w-12" />
        </div>

        {/* Error code */}
        <h1 className="mb-2 text-6xl font-bold tracking-tight">404</h1>

        {/* Error message */}
        <h2 className="mb-4 text-2xl font-semibold">Page Not Found</h2>
        <p className="text-muted-foreground mb-8">
          The page you're looking for doesn't exist or has been moved. Please
          check the URL or return to the homepage.
        </p>

        {/* Action buttons */}
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button asChild size="lg">
            <Link to="/">
              <Home className="mr-2 h-4 w-4" />
              Go to Homepage
            </Link>
          </Button>
          <Button variant="outline" size="lg" onClick={handleGoBack}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Go Back
          </Button>
        </div>

        {/* Additional help */}
        <div className="bg-card mt-12 rounded-lg border p-4 text-sm">
          <p className="text-muted-foreground">
            If you believe this is an error, please{" "}
            <a
              href="mailto:support@example.com"
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
