"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ActivityLogList } from "@/components/common/ActivityLogList";
import { getOrganizationActivityLogs, type ActivityLog } from "@/lib/activity-log.service";
import { useAuth } from "@/providers/auth.provider";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Activity } from "lucide-react";

export default function ActivityPage() {
  const { user, selectOrganization } = useAuth();
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 20;

  // Set default organization on mount if not already selected
  useEffect(() => {
    if (user?.organizations && user.organizations.length > 0 && !user.selectedOrganization) {
      selectOrganization(user.organizations[0].id);
    }
  }, [user, selectOrganization]);

  // Fetch logs when organization or page changes
  useEffect(() => {
    if (!user?.selectedOrganization?.id) return;

    const fetchLogs = async () => {
      setLoading(true);
      try {
        const orgId = user?.selectedOrganization?.id;
        if (!orgId) return;
        const response = await getOrganizationActivityLogs(orgId, page, limit);

        if (page === 1) {
          setLogs(response?.data || []);
        } else {
          setLogs((prev) => [...(prev || []), ...(response?.data || [])]);
        }

        setTotal(response?.total || 0);
      } catch (error) {
        console.error("Failed to fetch activity logs:", error);
        toast.error("Failed to load activity logs");
        setLogs([]);
        setTotal(0);
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
  }, [user?.selectedOrganization?.id, page]);

  const handleLoadMore = () => {
    setPage((prev) => prev + 1);
  };

  const handleOrganizationChange = (orgId: string) => {
    selectOrganization(orgId);
    setPage(1);
    setLogs([]);
  };

  const hasMore = (logs?.length || 0) < total;

  if (!user) {
    return null;
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Activity className="h-8 w-8" />
            Activity Log
          </h1>
          <p className="text-muted-foreground mt-1">Track all activities across your organization</p>
        </div>

        {user.organizations && user.organizations.length > 1 && (
          <Select value={user.selectedOrganization?.id || ""} onValueChange={handleOrganizationChange}>
            <SelectTrigger className="w-[250px]">
              <SelectValue placeholder="Select organization" />
            </SelectTrigger>
            <SelectContent>
              {user.organizations.map((org: { id: string; name: string; role: string }) => (
                <SelectItem key={org.id} value={org.id}>
                  {org.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>
            {total > 0 ? `Showing ${logs?.length || 0} of ${total} activities` : "No activities to show"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ActivityLogList
            logs={logs || []}
            loading={loading}
            showDocument={true}
            showFolder={true}
            hasMore={hasMore}
            onLoadMore={handleLoadMore}
            emptyMessage="No activity logs found for this organization"
          />
        </CardContent>
      </Card>
    </div>
  );
}
