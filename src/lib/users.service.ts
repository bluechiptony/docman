import { apiClient, apiRequest } from "@/api/client";

export type PlatformUser = {
  id: string;
  name: string;
  email: string;
};

export async function searchUsers(query: string): Promise<PlatformUser[]> {
  return apiRequest<PlatformUser[]>(() => apiClient.get(`/user/search`, { params: { q: query } }));
}
