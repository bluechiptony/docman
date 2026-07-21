import { apiClient, apiRequest } from "@/api/client";

export type ExshareInfo = {
  email: string;
  documentName: string;
  sharedBy: string;
  permission: "VIEW" | "EDIT";
  expiresAt: string;
  isExpired: boolean;
  hasRefreshRequest: boolean;
};

export type ExshareVerifyResult = {
  success: boolean;
  message: string;
  accessToken: string; // same as token
};

export type ExshareAccess = {
  id: string;
  name: string;
  permission: "VIEW" | "EDIT";
};

export type FolderExshareInfo = {
  email: string;
  shareType: "SINGLE" | "MULTIPLE" | "CLIENT";
  folders: Array<{ id: string; name: string }>;
  client?: { id: string; name: string } | null;
  sharedBy: string;
  permission: "VIEW" | "EDIT";
  expiresAt: string;
  isExpired: boolean;
  hasRefreshRequest: boolean;
};

export type FolderExshareAccess = {
  shareType: "SINGLE" | "MULTIPLE" | "CLIENT";
  permission: "VIEW" | "EDIT";
  folders: Array<{ id: string; name: string }>;
  client?: { id: string; name: string } | null;
  organization?: { id: string; name: string };
};

export type FolderExshareItem = {
  id: string;
  name: string;
  type: "folder" | "file";
  parentId: string | null;
  size?: number;
  mimeType?: string;
  createdAt?: string;
  url?: string;
  documentType?: { id: string; name: string };
};

export async function getExshareInfo(token: string): Promise<ExshareInfo> {
  return apiRequest<ExshareInfo>(() => apiClient.get(`/documents/exshare/${token}`));
}

export async function sendExshareOtp(token: string): Promise<{ success: boolean; message: string }> {
  return apiRequest<{ success: boolean; message: string }>(() =>
    apiClient.post(`/documents/exshare/${token}/send-otp`),
  );
}

export async function verifyExshareOtp(token: string, otp: string): Promise<ExshareVerifyResult> {
  return apiRequest<ExshareVerifyResult>(() => apiClient.post(`/documents/exshare/${token}/verify-otp`, { otp }));
}

export async function getExshareAccess(token: string): Promise<ExshareAccess> {
  return apiRequest<ExshareAccess>(() => apiClient.get(`/documents/exshare/${token}/access`));
}

export async function getExsharePreviewUrl(token: string): Promise<{ url: string; expiresAt: string }> {
  return apiRequest<{ url: string; expiresAt: string }>(() => apiClient.get(`/documents/exshare/${token}/url`));
}

export async function createExshareInvites(
  documentId: string,
  emails: string[],
  permission: "VIEW" | "EDIT" = "VIEW",
): Promise<{ success: boolean; message: string; shares: { email: string; token: string }[] }> {
  return apiRequest(() =>
    apiClient.post(`/documents/${documentId}/exshare`, {
      emails,
      permission,
    }),
  );
}

export async function requestExshareRefresh(
  token: string,
  note?: string,
): Promise<{ success: boolean; message: string }> {
  return apiRequest<{ success: boolean; message: string }>(() =>
    apiClient.post(`/documents/exshare/${token}/request-refresh`, { note }),
  );
}

export async function createFolderExshareInvites(payload: {
  emails: string[];
  shareType: "SINGLE" | "MULTIPLE" | "CLIENT";
  organizationId: string;
  folderIds?: string[];
  clientId?: string;
  permission?: "VIEW" | "EDIT";
}): Promise<{ success: boolean; message: string; shares: { email: string; token: string; shareType: string }[] }> {
  return apiRequest(() => apiClient.post(`/folders/exshare`, payload));
}

export async function getFolderExshareInfo(token: string): Promise<FolderExshareInfo> {
  return apiRequest<FolderExshareInfo>(() => apiClient.get(`/folders/exshare/${token}`));
}

export async function sendFolderExshareOtp(token: string): Promise<{ success: boolean; message: string }> {
  return apiRequest<{ success: boolean; message: string }>(() => apiClient.post(`/folders/exshare/${token}/send-otp`));
}

export async function verifyFolderExshareOtp(token: string, otp: string): Promise<ExshareVerifyResult> {
  return apiRequest<ExshareVerifyResult>(() => apiClient.post(`/folders/exshare/${token}/verify-otp`, { otp }));
}

export async function getFolderExshareAccess(token: string): Promise<FolderExshareAccess> {
  return apiRequest<FolderExshareAccess>(() => apiClient.get(`/folders/exshare/${token}/access`));
}

export async function requestFolderExshareRefresh(
  token: string,
  note?: string,
): Promise<{ success: boolean; message: string }> {
  return apiRequest<{ success: boolean; message: string }>(() =>
    apiClient.post(`/folders/exshare/${token}/request-refresh`, { note }),
  );
}

export async function getFolderExshareFolderContents(token: string, folderId: string): Promise<FolderExshareItem[]> {
  return apiRequest<FolderExshareItem[]>(() => apiClient.get(`/folders/exshare/${token}/folders/${folderId}/contents`));
}

export async function getFolderExshareDocumentPreviewUrl(
  token: string,
  documentId: string,
): Promise<{ url: string; expiresAt: string }> {
  return apiRequest<{ url: string; expiresAt: string }>(() =>
    apiClient.get(`/documents/folder-exshare/${token}/documents/${documentId}/url`),
  );
}
