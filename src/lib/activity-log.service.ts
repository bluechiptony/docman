import { apiClient, apiRequest } from "@/api/client";

export type ActivityLog = {
  id: string;
  action: string;
  details?: string | null;
  createdAt: string;
  user?: {
    id: string;
    firstName: string;
    lastName: string;
    emailAddress?: string;
  } | null;
  document?: {
    id: string;
    name: string;
  } | null;
  folder?: {
    id: string;
    name: string;
  } | null;
};

export type ActivityLogResponse = {
  data: ActivityLog[];
  total: number;
  page: number;
  limit: number;
};

/**
 * Get activity logs for an organization with optional filters
 */
export async function getOrganizationActivityLogs(
  organizationId: string,
  page: number = 1,
  limit: number = 20,
  filters?: {
    search?: string;
    startDate?: string;
    endDate?: string;
  },
): Promise<ActivityLogResponse> {
  return apiRequest<ActivityLogResponse>(() =>
    apiClient.get(`/activity-log/organization/${organizationId}`, {
      params: { page, limit, ...filters },
    }),
  );
}

/**
 * Get activity logs for a specific document
 */
export async function getDocumentActivityLogs(
  documentId: string,
  page: number = 1,
  limit: number = 20,
): Promise<ActivityLogResponse> {
  return apiRequest<ActivityLogResponse>(() =>
    apiClient.get(`/activity-log/document/${documentId}`, {
      params: { page, limit },
    }),
  );
}

/**
 * Get activity logs for a specific folder
 */
export async function getFolderActivityLogs(
  folderId: string,
  page: number = 1,
  limit: number = 20,
): Promise<ActivityLogResponse> {
  return apiRequest<ActivityLogResponse>(() =>
    apiClient.get(`/activity-log/folder/${folderId}`, {
      params: { page, limit },
    }),
  );
}

/**
 * Get activity logs for a specific user
 */
export async function getUserActivityLogs(
  userId: string,
  page: number = 1,
  limit: number = 20,
): Promise<ActivityLogResponse> {
  return apiRequest<ActivityLogResponse>(() =>
    apiClient.get(`/activity-log/user/${userId}`, {
      params: { page, limit },
    }),
  );
}
