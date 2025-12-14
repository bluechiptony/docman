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

    console.log(response);
    return response;
  } catch (error: any) {
    console.error("Login failed:", error.response?.data || error.message);
    throw error;
  }
}
