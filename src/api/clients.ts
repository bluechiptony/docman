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

export interface PaginationMeta {
  page: number;
  perPage: number;
  total: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: PaginationMeta;
}

export interface ClientManager {
  id: string;
  firstName: string;
  lastName: string;
  emailAddress: string;
  authentication: {
    role: string;
    active: boolean;
  };
}

export const clientsApi = {
  getByOrganization: (organizationId: string, page = 1, perPage = 25) => {
    return apiRequest<PaginatedResponse<Client>>(async () => {
      const response = await apiClient.get("/clients", {
        params: { organizationId, page, perPage },
      });
      return response;
    });
  },

  getById: (id: string) => apiRequest<Client>(() => apiClient.get(`/clients/${id}`)),

  getManagers: (id: string, page = 1, perPage = 25) =>
    apiRequest<PaginatedResponse<ClientManager>>(() =>
      apiClient.get(`/clients/${id}/managers`, {
        params: { page, perPage },
      }),
    ),

  create: (payload: CreateClientPayload) => apiRequest<Client>(() => apiClient.post("/clients", payload)),

  updateFolders: (id: string, payload: UpdateClientFoldersPayload) =>
    apiRequest<Client>(() => apiClient.put(`/clients/${id}/folders`, payload)),
};
