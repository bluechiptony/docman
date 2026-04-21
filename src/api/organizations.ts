import { apiClient, apiRequest } from "./client";

export interface OrganizationOption {
  id: string;
  name: string;
  role?: string;
}

export interface OrganizationUploadPolicy {
  maxUploadSizeBytes: number;
  allowedUploadExtensions: string[];
}

export interface OrganizationDetails extends OrganizationUploadPolicy {
  id: string;
  name: string;
  slug: string;
}

export interface UpdateOrganizationPayload {
  name?: string;
  maxUploadSizeBytes?: number;
  allowedUploadExtensions?: string[];
}

export const organizationsApi = {
  getUserOrganizations: () => apiRequest<OrganizationOption[]>(() => apiClient.get("/organizations/user")),

  getAllOrganizationsForAdmin: () =>
    apiRequest<Array<{ id: string; name: string }>>(() => apiClient.get("/organizations/admin/all")),

  getOrganizationById: (organizationId: string) =>
    apiRequest<OrganizationDetails>(() => apiClient.get(`/organizations/${organizationId}`)),

  updateOrganization: (organizationId: string, payload: UpdateOrganizationPayload) =>
    apiRequest<OrganizationDetails>(() => apiClient.put(`/organizations/${organizationId}`, payload)),
};
