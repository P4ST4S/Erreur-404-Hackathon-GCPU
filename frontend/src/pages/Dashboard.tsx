import { BarChart3, FileCheck, Upload, Clock } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

/**
 * Dashboard page - Overview of anonymization activity and statistics
 */
export function Dashboard() {
  const { user } = useAuth();

  return (
    <div className="space-y-8">
      {/* Page header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back, {user?.name}. Here's an overview of your anonymization
          activity.
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {/* Total documents */}
        <div className="rounded-lg border bg-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Total Documents
              </p>
              <p className="mt-2 text-3xl font-bold">1,234</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <FileCheck className="h-6 w-6 text-primary" />
            </div>
          </div>
          <p className="mt-4 text-xs text-muted-foreground">
            +12% from last month
          </p>
        </div>

        {/* Processing */}
        <div className="rounded-lg border bg-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Processing
              </p>
              <p className="mt-2 text-3xl font-bold">23</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-yellow-500/10">
              <Clock className="h-6 w-6 text-yellow-600 dark:text-yellow-500" />
            </div>
          </div>
          <p className="mt-4 text-xs text-muted-foreground">
            Currently being anonymized
          </p>
        </div>

        {/* This month */}
        <div className="rounded-lg border bg-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                This Month
              </p>
              <p className="mt-2 text-3xl font-bold">156</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-500/10">
              <Upload className="h-6 w-6 text-green-600 dark:text-green-500" />
            </div>
          </div>
          <p className="mt-4 text-xs text-muted-foreground">
            Documents anonymized
          </p>
        </div>

        {/* Success rate */}
        <div className="rounded-lg border bg-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Success Rate
              </p>
              <p className="mt-2 text-3xl font-bold">98.5%</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-500/10">
              <BarChart3 className="h-6 w-6 text-blue-600 dark:text-blue-500" />
            </div>
          </div>
          <p className="mt-4 text-xs text-muted-foreground">
            Average accuracy score
          </p>
        </div>
      </div>

      {/* Recent activity placeholder */}
      <div className="rounded-lg border bg-card">
        <div className="border-b p-6">
          <h2 className="text-xl font-semibold">Recent Activity</h2>
          <p className="text-sm text-muted-foreground">
            Latest document processing history
          </p>
        </div>
        <div className="p-6">
          <div className="flex items-center justify-center py-12 text-muted-foreground">
            <p>Recent activity feed will be displayed here</p>
          </div>
        </div>
      </div>
    </div>
  );
}
