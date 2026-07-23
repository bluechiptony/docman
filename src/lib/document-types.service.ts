import { apiClient, apiRequest } from "@/api/client";

const DOCUMENT_TYPE_CACHE_PREFIX = "docman:document-types:";
const DOCUMENT_TYPE_CACHE_TTL_MS = 5 * 60 * 1000;

type DocumentTypeCacheEntry = {
  expiresAt: number;
  types: DocumentType[];
};

const documentTypeMemoryCache = new Map<string, DocumentTypeCacheEntry>();

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

function cacheKey(organizationId: string) {
  return `${DOCUMENT_TYPE_CACHE_PREFIX}${organizationId}`;
}

function readCachedDocumentTypes(organizationId: string): DocumentType[] | null {
  const now = Date.now();
  const memoryEntry = documentTypeMemoryCache.get(organizationId);
  if (memoryEntry && memoryEntry.expiresAt > now) {
    return memoryEntry.types;
  }
  documentTypeMemoryCache.delete(organizationId);

  if (typeof window === "undefined") return null;

  try {
    const serialized = sessionStorage.getItem(cacheKey(organizationId));
    if (!serialized) return null;
    const entry = JSON.parse(serialized) as DocumentTypeCacheEntry;
    if (!Array.isArray(entry.types) || entry.expiresAt <= now) {
      sessionStorage.removeItem(cacheKey(organizationId));
      return null;
    }
    documentTypeMemoryCache.set(organizationId, entry);
    return entry.types;
  } catch {
    sessionStorage.removeItem(cacheKey(organizationId));
    return null;
  }
}

function cacheDocumentTypes(organizationId: string, types: DocumentType[]) {
  const entry: DocumentTypeCacheEntry = {
    types,
    expiresAt: Date.now() + DOCUMENT_TYPE_CACHE_TTL_MS,
  };
  documentTypeMemoryCache.set(organizationId, entry);
  if (typeof window !== "undefined") {
    sessionStorage.setItem(cacheKey(organizationId), JSON.stringify(entry));
  }
}

export function invalidateDocumentTypesCache(organizationId?: string) {
  if (organizationId) {
    documentTypeMemoryCache.delete(organizationId);
    if (typeof window !== "undefined") {
      sessionStorage.removeItem(cacheKey(organizationId));
    }
    return;
  }

  documentTypeMemoryCache.clear();
  if (typeof window !== "undefined") {
    Object.keys(sessionStorage)
      .filter((key) => key.startsWith(DOCUMENT_TYPE_CACHE_PREFIX))
      .forEach((key) => sessionStorage.removeItem(key));
  }
}

export async function getDocumentTypes(
  organizationId: string,
  options?: { forceRefresh?: boolean },
): Promise<DocumentType[]> {
  if (!options?.forceRefresh) {
    const cached = readCachedDocumentTypes(organizationId);
    if (cached) return cached;
  }

  const types = await apiRequest<DocumentType[]>(() =>
    apiClient.get("/document-types", { params: { organizationId } }),
  );
  cacheDocumentTypes(organizationId, types);
  return types;
}

export async function searchDocumentTypes(organizationId: string, name: string): Promise<DocumentType[]> {
  return apiRequest<DocumentType[]>(() =>
    apiClient.get("/document-types/search", { params: { organizationId, name } })
  );
}

export async function createDocumentType(payload: CreateDocumentTypeDto): Promise<DocumentType> {
  const created = await apiRequest<DocumentType>(() => apiClient.post("/document-types", payload));
  invalidateDocumentTypesCache(payload.organizationId);
  return created;
}

export async function updateDocumentType(id: string, payload: UpdateDocumentTypeDto): Promise<DocumentType> {
  // Backend expects organizationId as a query param for update uniqueness check
  const { organizationId, ...body } = payload;
  const updated = await apiRequest<DocumentType>(() =>
    apiClient.put(`/document-types/${id}`, body, { params: { organizationId } }),
  );
  invalidateDocumentTypesCache(organizationId);
  return updated;
}

export async function deleteDocumentType(id: string): Promise<void> {
  await apiRequest<void>(() => apiClient.delete(`/document-types/${id}`));
  invalidateDocumentTypesCache();
}
