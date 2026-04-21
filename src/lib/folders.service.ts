import { apiClient, apiRequest } from "@/api/client";

export type RequirementCategoryGroup = {
  id: string | null;
  name: string;
  totalRequired: number;
  presentCount: number;
  remainingCount: number;
  presentTypes: Array<{ id: string; name: string }>;
  remainingTypes: Array<{ id: string; name: string }>;
};

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
  categories?: RequirementCategoryGroup[];
};

export async function getFolderRequirementStatus(folderId: string) {
  return apiRequest<FolderRequirementStatus>(() => apiClient.get(`/folders/${folderId}/requirements/status`));
}
