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

export async function getExshareInfo(token: string): Promise<ExshareInfo> {
  return apiRequest<ExshareInfo>(() => apiClient.get(`/documents/exshare/${token}`));
}

export async function sendExshareOtp(token: string): Promise<{ success: boolean; message: string }> {
  return apiRequest<{ success: boolean; message: string }>(() =>
    apiClient.post(`/documents/exshare/${token}/send-otp`)
  );
}

export async function verifyExshareOtp(token: string, otp: string): Promise<ExshareVerifyResult> {
  return apiRequest<ExshareVerifyResult>(() => apiClient.post(`/documents/exshare/${token}/verify-otp`, { otp }));
}

export async function getExshareAccess(token: string): Promise<ExshareAccess> {
  return apiRequest<ExshareAccess>(() => apiClient.get(`/documents/exshare/${token}/access`));
}

export async function createExshareInvites(
  documentId: string,
  emails: string[],
  permission: "VIEW" | "EDIT" = "VIEW"
): Promise<{ success: boolean; message: string; shares: { email: string; token: string }[] }> {
  return apiRequest(() =>
    apiClient.post(`/documents/${documentId}/exshare`, {
      emails,
      permission,
    })
  );
}

export async function requestExshareRefresh(
  token: string,
  note?: string
): Promise<{ success: boolean; message: string }> {
  return apiRequest<{ success: boolean; message: string }>(() =>
    apiClient.post(`/documents/exshare/${token}/request-refresh`, { note })
  );
}
