import axios from "axios";

export const AUTH_SESSION_EXPIRED_EVENT = "docman:auth-session-expired";

/** 🔹 Main API client — used for app backend requests */

export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000",
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});

/** 🔹 Presigned upload client — used to PUT/POST files directly to storage buckets */
export const uploadClient = axios.create({
  timeout: 30000,
  // ⚠️ No baseURL — because presigned URLs are absolute URLs
  headers: {
    // Do NOT set Authorization here — presigned URLs don’t need tokens
    "Content-Type": "application/octet-stream",
  },
});

/* ────────────────────────────────
 * 🧩 Interceptors for apiClient
 * ──────────────────────────────── */
apiClient.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error),
);

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;

    if (status === 401 && typeof window !== "undefined" && localStorage.getItem("token")) {
      window.dispatchEvent(new Event(AUTH_SESSION_EXPIRED_EVENT));
    } else if (status >= 500) {
    }

    return Promise.reject(error);
  },
);

/* ────────────────────────────────
 * 📦 Helper: generic API wrapper
 * ──────────────────────────────── */
export async function apiRequest<T>(fn: () => Promise<{ data: T }>): Promise<T> {
  const res = await fn();
  return res.data;
}
