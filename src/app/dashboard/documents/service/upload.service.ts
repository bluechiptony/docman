// import axios from "@/api/client";

const axios: any = {};

export interface UploadInitResponse {
  uploadUrl: string;
  fileKey: string;
}

export async function getPresignedUrl(file: File): Promise<UploadInitResponse> {
  const { data } = await axios.post("/uploads/presign", {
    filename: file.name,
    contentType: file.type,
  });
  return data;
}

export async function uploadToBucket(uploadUrl: string, file: File) {
  const res = await axios.put(uploadUrl, file, {
    headers: { "Content-Type": file.type },
  });
  if (res.status !== 200) throw new Error("Upload failed");
}

export async function completeUpload(fileKey: string) {
  const { data } = await axios.post("/uploads/complete", { fileKey });
  return data;
}

export async function handleFileUpload(file: File) {
  try {
    const { uploadUrl, fileKey } = await getPresignedUrl(file);
    await uploadToBucket(uploadUrl, file);
    const completed = await completeUpload(fileKey);
    return completed;
  } catch (err: any) {
    throw new Error(err.response?.data?.message || err.message);
  }
}
