import type { OrganizationUploadPolicy } from "@/api/organizations";

export const DEFAULT_MAX_UPLOAD_SIZE_BYTES = 5 * 1024 * 1024;
export const DEFAULT_ALLOWED_EXTENSIONS = [".pdf", ".doc", ".docx", ".xls", ".xlsx", ".png", ".jpg", ".jpeg"];

export type UploadPolicy = OrganizationUploadPolicy;

export type UploadValidationResult = {
  valid: boolean;
  reason?: "size" | "type";
};

export function normalizeExtension(extension: string): string | null {
  const normalized = extension.trim().toLowerCase();
  if (!normalized) {
    return null;
  }

  const withDot = normalized.startsWith(".") ? normalized : `.${normalized}`;
  if (!/^\.[a-z0-9]+$/.test(withDot)) {
    return null;
  }

  return withDot;
}

export function normalizeExtensions(extensions: string[]): string[] {
  return Array.from(
    new Set(
      extensions
        .map((extension) => normalizeExtension(extension))
        .filter((extension): extension is string => Boolean(extension)),
    ),
  );
}

export function extractFileExtension(fileName: string): string | null {
  const lastDot = fileName.lastIndexOf(".");
  if (lastDot === -1 || lastDot === fileName.length - 1) {
    return null;
  }

  return normalizeExtension(fileName.substring(lastDot + 1));
}

export function getEffectiveUploadPolicy(policy?: Partial<UploadPolicy> | null): UploadPolicy {
  return {
    maxUploadSizeBytes: policy?.maxUploadSizeBytes || DEFAULT_MAX_UPLOAD_SIZE_BYTES,
    allowedUploadExtensions:
      policy?.allowedUploadExtensions && policy.allowedUploadExtensions.length
        ? normalizeExtensions(policy.allowedUploadExtensions)
        : DEFAULT_ALLOWED_EXTENSIONS,
  };
}

export function validateFileAgainstPolicy(file: File, policy: UploadPolicy): UploadValidationResult {
  if (file.size > policy.maxUploadSizeBytes) {
    return { valid: false, reason: "size" };
  }

  const extension = extractFileExtension(file.name);
  if (!extension || !policy.allowedUploadExtensions.includes(extension)) {
    return { valid: false, reason: "type" };
  }

  return { valid: true };
}

export function bytesToMegabytes(bytes: number): number {
  return Math.max(1, Math.round((bytes / (1024 * 1024)) * 100) / 100);
}

export function megabytesToBytes(mb: number): number {
  return Math.round(mb * 1024 * 1024);
}
