import { apiClient, apiRequest } from "./client";

export interface DocumentType {
  id: string;
  name: string;
  description: string | null;
}

export interface DocumentCategory {
  id: string;
  name: string;
  description: string | null;
  organizationId: string;
  documentTypes: DocumentType[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateDocumentCategoryPayload {
  name: string;
  description?: string;
  organizationId: string;
}

export interface UpdateDocumentCategoryPayload {
  name?: string;
  description?: string;
}

export const documentCategoriesApi = {
  /**
   * Get all document categories for an organization
   */
  getByOrganization: (organizationId: string) =>
    apiRequest<DocumentCategory[]>(() => apiClient.get(`/document-categories`, { params: { organizationId } })),

  /**
   * Get a single document category by ID
   */
  getById: (id: string) => apiRequest<DocumentCategory>(() => apiClient.get(`/document-categories/${id}`)),

  /**
   * Create a new document category
   */
  create: (payload: CreateDocumentCategoryPayload) =>
    apiRequest<DocumentCategory>(() => apiClient.post(`/document-categories`, payload)),

  /**
   * Update a document category
   */
  update: (id: string, organizationId: string, payload: UpdateDocumentCategoryPayload) =>
    apiRequest<DocumentCategory>(() =>
      apiClient.put(`/document-categories/${id}`, payload, { params: { organizationId } }),
    ),

  /**
   * Delete a document category
   */
  delete: (id: string, organizationId: string) =>
    apiRequest<void>(() => apiClient.delete(`/document-categories/${id}`, { params: { organizationId } })),
};
