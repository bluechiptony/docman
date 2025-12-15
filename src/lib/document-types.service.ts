import { apiClient, apiRequest } from "@/api/client";

export type DocumentType = {
  id: string;
  name: string;
  description?: string | null;
  createdBy: {
    id: string;
    firstName: string;
    lastName: string;
  };
  _count: {
    documents: number;
  };
  createdAt: string;
};

export type CreateDocumentTypeDto = {
  name: string;
  description?: string;
  organizationId: string;
  createdById: string;
};

export type UpdateDocumentTypeDto = {
  name?: string;
  description?: string;
  organizationId: string;
};

export async function getDocumentTypes(organizationId: string): Promise<DocumentType[]> {
  return apiRequest<DocumentType[]>(() => apiClient.get("/document-types", { params: { organizationId } }));
}

export async function createDocumentType(payload: CreateDocumentTypeDto): Promise<DocumentType> {
  return apiRequest<DocumentType>(() => apiClient.post("/document-types", payload));
}

export async function updateDocumentType(id: string, payload: UpdateDocumentTypeDto): Promise<DocumentType> {
  // Backend expects organizationId as a query param for update uniqueness check
  const { organizationId, ...body } = payload;
  return apiRequest<DocumentType>(() => apiClient.put(`/document-types/${id}`, body, { params: { organizationId } }));
}

export async function deleteDocumentType(id: string): Promise<void> {
  await apiRequest<void>(() => apiClient.delete(`/document-types/${id}`));
}
