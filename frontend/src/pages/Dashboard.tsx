import { BarChart3, FileCheck, Upload, Clock } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

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
        <div className="bg-card rounded-lg border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground text-sm font-medium">
                Total Documents
              </p>
              <p className="mt-2 text-3xl font-bold">1,234</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#5dbdb9]/10">
              <FileCheck className="text-teal-medical h-6 w-6" />
            </div>
          </div>
          <p className="text-muted-foreground mt-4 text-xs">
            +12% from last month
          </p>
        </div>

        {/* Processing */}
        <div className="bg-card rounded-lg border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground text-sm font-medium">
                Processing
              </p>
              <p className="mt-2 text-3xl font-bold">23</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-yellow-500/10">
              <Clock className="h-6 w-6 text-yellow-600 dark:text-yellow-500" />
            </div>
          </div>
          <p className="text-muted-foreground mt-4 text-xs">
            Currently being anonymized
          </p>
        </div>

        {/* This month */}
        <div className="bg-card rounded-lg border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground text-sm font-medium">
                This Month
              </p>
              <p className="mt-2 text-3xl font-bold">156</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-500/10">
              <Upload className="h-6 w-6 text-green-600 dark:text-green-500" />
            </div>
          </div>
          <p className="text-muted-foreground mt-4 text-xs">
            Documents anonymized
          </p>
        </div>

        {/* Success rate */}
        <div className="bg-card rounded-lg border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground text-sm font-medium">
                Success Rate
              </p>
              <p className="mt-2 text-3xl font-bold">98.5%</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#5dbdb9]/10">
              <BarChart3 className="text-teal-medical h-6 w-6" />
            </div>
          </div>
          <p className="text-muted-foreground mt-4 text-xs">
            Average accuracy score
          </p>
        </div>
      </div>

      {/* Recent activity placeholder */}
      <div className="bg-card rounded-lg border">
        <div className="border-b p-6">
          <h2 className="text-xl font-semibold">Recent Activity</h2>
          <p className="text-muted-foreground text-sm">
            Latest document processing history
          </p>
        </div>
        <div className="p-6">
          <div className="text-muted-foreground flex items-center justify-center py-12">
            <p>Recent activity feed will be displayed here</p>
          </div>
        </div>
      </div>
    </div>
  );
}
