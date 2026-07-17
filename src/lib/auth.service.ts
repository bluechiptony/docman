import { apiClient } from "@/api/client";

interface LoginResponse {
  token: string;
}

export async function login(data: { emailAddress: string; password: string }) {
  try {
    const response = await apiClient.post<LoginResponse>("/auth/login", {
      emailAddress: data.emailAddress,
      password: data.password,
    });

    return response;
  } catch (error: any) {
    throw error;
  }
}
