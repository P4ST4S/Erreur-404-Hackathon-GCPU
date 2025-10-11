import { createBrowserRouter } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { ProtectedRoute } from '@/components/routing/ProtectedRoute';
import { RouteErrorBoundary } from '@/components/errors/RouteErrorBoundary';
import { Home } from '@/pages/Home';
import { Login } from '@/pages/Login';
import { Dashboard } from '@/pages/Dashboard';
import { Anonymize } from '@/pages/Anonymize';
import { NotFound } from '@/pages/NotFound';

/**
 * Application router configuration
 * Defines all routes and their associated components
 * Includes protected routes that require authentication
 * All routes have error boundaries for proper error handling
 */
export const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout><Home /></Layout>,
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: '/login',
    element: <Login />,
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: '/dashboard',
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
    path: '/anonymize',
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
    path: '/documents',
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
            <div className="rounded-lg border bg-card p-12 text-center text-muted-foreground">
              Documents page coming soon...
            </div>
          </div>
        </ProtectedRoute>
      </Layout>
    ),
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: '/compliance',
    element: (
      <Layout>
        <ProtectedRoute>
          <div className="space-y-8">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Compliance Reports</h1>
              <p className="text-muted-foreground">
                HIPAA and GDPR compliance documentation
              </p>
            </div>
            <div className="rounded-lg border bg-card p-12 text-center text-muted-foreground">
              Compliance reports coming soon...
            </div>
          </div>
        </ProtectedRoute>
      </Layout>
    ),
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: '/settings',
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
            <div className="rounded-lg border bg-card p-12 text-center text-muted-foreground">
              Settings page coming soon...
            </div>
          </div>
        </ProtectedRoute>
      </Layout>
    ),
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: '*',
    element: <NotFound />,
  },
]);
