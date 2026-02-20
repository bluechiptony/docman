import { apiClient, apiRequest } from "./client";

export interface ClientFolder {
  id: string;
  name: string;
}

export interface Client {
  id: string;
  name: string;
  organizationId: string;
  folders: ClientFolder[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateClientPayload {
  name: string;
  organizationId: string;
}

export interface UpdateClientFoldersPayload {
  folderIds: string[];
}

export const clientsApi = {
  getByOrganization: (organizationId: string) => {
    console.log("📋 clientsApi.getByOrganization called with organizationId:", organizationId);
    return apiRequest<Client[]>(async () => {
      console.log("🔌 Making request to /clients with params:", { organizationId });
      const response = await apiClient.get("/clients", { params: { organizationId } });
      console.log("✅ Got response from /clients:", response);
      console.log("✅ Response data:", response.data);
      return response;
    });
  },

  getById: (id: string) => apiRequest<Client>(() => apiClient.get(`/clients/${id}`)),

  create: (payload: CreateClientPayload) => apiRequest<Client>(() => apiClient.post("/clients", payload)),

  updateFolders: (id: string, payload: UpdateClientFoldersPayload) =>
    apiRequest<Client>(() => apiClient.put(`/clients/${id}/folders`, payload)),
};
