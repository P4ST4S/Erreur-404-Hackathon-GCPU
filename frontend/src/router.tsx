import { createBrowserRouter } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { ProtectedRoute } from "@/components/routing/ProtectedRoute";
import { RouteErrorBoundary } from "@/components/errors/RouteErrorBoundary";
import { Home } from "@/pages/Home";
import { Login } from "@/pages/Login";
import { Dashboard } from "@/pages/Dashboard";
import { Anonymize } from "@/pages/Anonymize";
import { History } from "@/pages/History";
import { NotFound } from "@/pages/NotFound";
import ConflictResolution from "@/pages/ConflictResolution";

/**
 * Application router configuration
 * Defines all routes and their associated components
 *
 * React Router v7 features implemented:
 * - createBrowserRouter with data router API
 * - errorElement on every route for error boundaries
 * - Future flags enabled for v7+ compatibility
 * - Proper nested route structure
 * - Protected routes with authentication
 */
export const router = createBrowserRouter(
  [
    {
      path: "/",
      element: (
        <Layout>
          <Home />
        </Layout>
      ),
      errorElement: <RouteErrorBoundary />,
    },
    {
      path: "/login",
      element: <Login />,
      errorElement: <RouteErrorBoundary />,
    },
    {
      path: "/dashboard",
      element: (
        <Layout>
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        </Layout>
      ),
      errorElement: <RouteErrorBoundary />,
    },
    {
      path: "/conflict/:datasetId",
      element: (
        <Layout>
          <ProtectedRoute>
            <ConflictResolution />
          </ProtectedRoute>
        </Layout>
      ),
      errorElement: <RouteErrorBoundary />,
    },
    {
      path: "/anonymize",
      element: (
        <Layout>
          <ProtectedRoute>
            <Anonymize />
          </ProtectedRoute>
        </Layout>
      ),
      errorElement: <RouteErrorBoundary />,
    },
    {
      path: "/anonymize/:datasetId",
      element: (
        <Layout>
          <ProtectedRoute>
            <Anonymize />
          </ProtectedRoute>
        </Layout>
      ),
      errorElement: <RouteErrorBoundary />,
    },
    {
      path: "/history",
      element: (
        <Layout>
          <ProtectedRoute>
            <History />
          </ProtectedRoute>
        </Layout>
      ),
      errorElement: <RouteErrorBoundary />,
    },
    {
      path: "/documents",
      element: (
        <Layout>
          <ProtectedRoute>
            <div className="space-y-8">
              <div>
                <h1 className="text-3xl font-bold tracking-tight">Documents</h1>
                <p className="text-muted-foreground">
                  Manage your anonymized documents
                </p>
              </div>
              <div className="bg-card text-muted-foreground rounded-lg border p-12 text-center">
                Documents page coming soon...
              </div>
            </div>
          </ProtectedRoute>
        </Layout>
      ),
      errorElement: <RouteErrorBoundary />,
    },
    {
      path: "/compliance",
      element: (
        <Layout>
          <ProtectedRoute>
            <div className="space-y-8">
              <div>
                <h1 className="text-3xl font-bold tracking-tight">
                  Compliance Reports
                </h1>
                <p className="text-muted-foreground">
                  HIPAA and GDPR compliance documentation
                </p>
              </div>
              <div className="bg-card text-muted-foreground rounded-lg border p-12 text-center">
                Compliance reports coming soon...
              </div>
            </div>
          </ProtectedRoute>
        </Layout>
      ),
      errorElement: <RouteErrorBoundary />,
    },
    {
      path: "/settings",
      element: (
        <Layout>
          <ProtectedRoute>
            <div className="space-y-8">
              <div>
                <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
                <p className="text-muted-foreground">
                  Configure anonymization rules and preferences
                </p>
              </div>
              <div className="bg-card text-muted-foreground rounded-lg border p-12 text-center">
                Settings page coming soon...
              </div>
            </div>
          </ProtectedRoute>
        </Layout>
      ),
      errorElement: <RouteErrorBoundary />,
    },
    {
      path: "*",
      element: <NotFound />,
    },
  ],
  {
    future: {
      v7_relativeSplatPath: true,
      v7_fetcherPersist: true,
      v7_normalizeFormMethod: true,
      v7_partialHydration: true,
      v7_skipActionErrorRevalidation: true,
    },
  }
);
