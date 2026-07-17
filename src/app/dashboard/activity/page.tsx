"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ActivityLogList } from "@/components/common/ActivityLogList";
import { getOrganizationActivityLogs, type ActivityLog } from "@/lib/activity-log.service";
import { useAuth } from "@/providers/auth.provider";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Activity, X, Loader, HelpCircle } from "lucide-react";
import { useAdminAccess } from "@/hooks/useAdminAccess";

export default function ActivityPage() {
  const { user, selectOrganization } = useAuth();
  const { hasAccess, loading: checkingAccess } = useAdminAccess();
  const canSelectOrganization = user?.authentication?.role === "SUPER_ADMIN";
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [searchText, setSearchText] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const limit = 20;

  if (checkingAccess) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader className="w-8 h-8 animate-spin text-[#0A3A5C]" />
      </div>
    );
  }

  if (!hasAccess) {
    return null;
  }

  // Set default organization on mount if not already selected
  useEffect(() => {
    if (user?.organizations && user.organizations.length > 0 && !user.selectedOrganization) {
      selectOrganization(user.organizations[0].id);
    }
  }, [user, selectOrganization]);

  // Fetch logs when organization, page, or filters change
  useEffect(() => {
    if (!user?.selectedOrganization?.id) return;

    const fetchLogs = async () => {
      setLoading(true);
      try {
        const orgId = user?.selectedOrganization?.id;
        if (!orgId) return;

        const response = await getOrganizationActivityLogs(orgId, page, limit, {
          search: searchText || undefined,
          startDate: startDate || undefined,
          endDate: endDate || undefined,
        });

        if (page === 1) {
          setLogs(response?.data || []);
        } else {
          setLogs((prev) => [...(prev || []), ...(response?.data || [])]);
        }

        setTotal(response?.total || 0);
      } catch (error) {
        toast.error("Failed to load activity logs");
        setLogs([]);
        setTotal(0);
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
  }, [user?.selectedOrganization?.id, page, searchText, startDate, endDate]);

  const handleLoadMore = () => {
    setPage((prev) => prev + 1);
  };

  const handleOrganizationChange = (orgId: string) => {
    selectOrganization(orgId);
    setPage(1);
    setLogs([]);
  };

  const handleClearFilters = () => {
    setSearchText("");
    setStartDate("");
    setEndDate("");
    setPage(1);
    setLogs([]);
  };

  const hasActiveFilters = searchText || startDate || endDate;
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

        <div className="flex items-center gap-4">
          {canSelectOrganization && user.organizations && user.organizations.length > 1 && (
            <Select value={user.selectedOrganization?.id || ""} onValueChange={handleOrganizationChange}>
              <SelectTrigger className="w-[250px]">
                <SelectValue placeholder="Select organization" />
              </SelectTrigger>
              <SelectContent>
                {user.organizations.map((org) => (
                  <SelectItem key={org.id} value={org.id}>
                    {org.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          <Button asChild variant="outline" size="sm">
            <Link href="/help" className="inline-flex items-center gap-2">
              <HelpCircle className="h-4 w-4" />
              Help
            </Link>
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>
            {total > 0 ? `Showing ${logs?.length || 0} of ${total} activities` : "No activities to show"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Filters */}
          <div className="bg-gray-50 rounded-lg p-4 space-y-4">
            <div className="flex items-end gap-4 flex-wrap">
              {/* Text Search */}
              <div className="flex-1 min-w-[200px]">
                <label className="text-sm font-medium text-gray-700 block mb-2">Search by Text</label>
                <Input
                  placeholder="Search by user, action, or document..."
                  value={searchText}
                  onChange={(e) => {
                    setSearchText(e.target.value);
                    setPage(1);
                  }}
                  className="h-9"
                />
              </div>

              {/* Start Date */}
              <div className="flex-1 min-w-[150px]">
                <label className="text-sm font-medium text-gray-700 block mb-2">From Date</label>
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => {
                    setStartDate(e.target.value);
                    setPage(1);
                  }}
                  className="h-9"
                />
              </div>

              {/* End Date */}
              <div className="flex-1 min-w-[150px]">
                <label className="text-sm font-medium text-gray-700 block mb-2">To Date</label>
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => {
                    setEndDate(e.target.value);
                    setPage(1);
                  }}
                  className="h-9"
                />
              </div>

              {/* Clear Filters Button */}
              {hasActiveFilters && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleClearFilters}
                  className="h-9 flex items-center gap-2"
                >
                  <X size={16} />
                  Clear
                </Button>
              )}
            </div>

            {/* Active Filters Display */}
            {hasActiveFilters && (
              <div className="text-sm text-gray-600">
                {searchText && (
                  <span className="inline-block bg-blue-100 text-blue-800 px-2 py-1 rounded mr-2">
                    Search: {searchText}
                  </span>
                )}
                {startDate && (
                  <span className="inline-block bg-green-100 text-green-800 px-2 py-1 rounded mr-2">
                    From: {startDate}
                  </span>
                )}
                {endDate && (
                  <span className="inline-block bg-orange-100 text-orange-800 px-2 py-1 rounded mr-2">
                    To: {endDate}
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Activity List */}
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
