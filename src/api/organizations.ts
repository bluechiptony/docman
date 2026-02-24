import { apiClient, apiRequest } from "./client";

export interface OrganizationOption {
  id: string;
  name: string;
  role?: string;
}

export const organizationsApi = {
  getUserOrganizations: () => apiRequest<OrganizationOption[]>(() => apiClient.get("/organizations/user")),

  getAllOrganizationsForAdmin: () =>
    apiRequest<Array<{ id: string; name: string }>>(() => apiClient.get("/organizations/admin/all")),
};
