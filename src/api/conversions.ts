import { apiClient, apiRequest, uploadClient } from "./client";

export type ConversionType = "PDF_TO_WORD" | "WORD_TO_PDF" | "WORD_TO_EXCEL";
export type ConversionStatus =
  | "DRAFT"
  | "UPLOADING"
  | "QUEUED"
  | "PROCESSING"
  | "COMPLETED"
  | "FAILED"
  | "EXPIRED";

export interface ConversionJob {
  id: string;
  batchId: string;
  conversionType: ConversionType;
  status: ConversionStatus;
  sourceName: string;
  sourceSize: number;
  outputName?: string | null;
  outputExpiresAt?: string | null;
  outputDocumentId?: string | null;
  errorMessage?: string | null;
  attemptCount: number;
}

export interface ConversionBatch {
  id: string;
  status: ConversionStatus;
  notificationReadAt?: string | null;
  completedAt?: string | null;
  createdAt: string;
  jobs: ConversionJob[];
}

export interface ConversionFolder {
  id: string;
  name: string;
  parentId?: string | null;
  staffId?: string | null;
}

interface UploadTarget {
  jobId: string;
  clientId: string;
  uploadUrl: string;
  fields?: Record<string, string>;
}

export const conversionsApi = {
  createBatch: (payload: {
    organizationId: string;
    files: Array<{
      clientId: string;
      name: string;
      mimeType: string;
      size: number;
      conversionType: ConversionType;
    }>;
  }) =>
    apiRequest<{ batch: ConversionBatch; uploads: UploadTarget[] }>(() =>
      apiClient.post("/conversions/batches", payload),
    ),

  upload: async (target: UploadTarget, file: File, onProgress: (percentage: number) => void) => {
    const body = new FormData();
    Object.entries(target.fields || {}).forEach(([key, value]) => body.append(key, value));
    body.append("file", file);
    await uploadClient.post(target.uploadUrl, body, {
      headers: { "Content-Type": "multipart/form-data" },
      onUploadProgress: (event) => {
        if (event.total) onProgress(Math.round((event.loaded / event.total) * 100));
      },
    });
  },

  completeBatch: (batchId: string, jobIds: string[]) =>
    apiRequest<ConversionBatch>(() =>
      apiClient.post(`/conversions/batches/${batchId}/complete`, { jobIds }),
    ),

  listBatches: (organizationId: string) =>
    apiRequest<ConversionBatch[]>(() =>
      apiClient.get("/conversions/batches", { params: { organizationId } }),
    ),

  retry: (jobId: string) =>
    apiRequest<ConversionJob>(() => apiClient.post(`/conversions/jobs/${jobId}/retry`)),

  download: (jobId: string) =>
    apiRequest<{ url: string; expiresAt: string }>(() =>
      apiClient.get(`/conversions/jobs/${jobId}/download`),
    ),

  save: (jobId: string, folderId: string) =>
    apiRequest<{ id: string; name: string }>(() =>
      apiClient.post(`/conversions/jobs/${jobId}/save`, { folderId }),
    ),

  folders: (organizationId: string) =>
    apiRequest<ConversionFolder[]>(() =>
      apiClient.get("/conversions/folders", { params: { organizationId } }),
    ),

  summary: (organizationId: string) =>
    apiRequest<{ unreadCount: number; activeCount: number; recent: ConversionBatch[] }>(() =>
      apiClient.get("/conversions/summary", { params: { organizationId } }),
    ),

  markRead: (batchId: string) =>
    apiRequest<ConversionBatch>(() => apiClient.patch(`/conversions/batches/${batchId}/read`)),
};
