import { apiClient, apiRequest } from "@/api/client";
import { type ActivityLog, type ActivityLogResponse } from "./activity-log.service";

export type DashboardOverview = {
  totals: {
    documents: number;
    users: number;
    folders: number;
    storageUsedBytes: number;
    storageUsedGb: number;
  };
  recentUploads: number;
  uploadsPerDay: { date: string; uploads: number }[];
  documentTypeBreakdown: { name: string; value: number }[];
};

/**
 * Fetch dashboard overview stats for an organization.
 */
export async function getDashboardOverview(
  organizationId: string,
  days: number = 7,
): Promise<DashboardOverview | null> {
  if (!organizationId) return null;

  try {
    const response = await apiRequest<DashboardOverview>(() =>
      apiClient.get(`/dashboard/overview`, { params: { organizationId, days } }),
    );

    return response ?? null;
  } catch (err) {
    console.error("Error fetching dashboard overview:", err instanceof Error ? err.message : err);
    throw err;
  }
}

/**
 * Fetch recent activity for an organization (first page, limited count).
 */
export async function getRecentActivity(organizationId: string, limit: number = 5): Promise<ActivityLog[]> {
  if (!organizationId) return [];

  const response = await apiRequest<ActivityLogResponse>(() =>
    apiClient.get(`/activity-log/organization/${organizationId}`, {
      params: { page: 1, limit },
    }),
  );

  return response?.data ?? [];
}
