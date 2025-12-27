import { apiClient, apiRequest } from "@/api/client";

export type FolderRequirementStatus = {
  folderId: string;
  folderType?: string;
  listId?: string | null;
  applicable: boolean;
  totalRequired: number;
  presentCount: number;
  remainingCount: number;
  completionPercent: number;
  presentTypes: Array<{ id: string; name: string }>;
  remainingTypes: Array<{ id: string; name: string }>;
};

export async function getFolderRequirementStatus(folderId: string) {
  return apiRequest<FolderRequirementStatus>(() => apiClient.get(`/folders/${folderId}/requirements/status`));
}
