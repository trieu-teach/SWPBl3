import axios from "axios";

const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3001/api"
).replace(/\/+$/, "");

export function normalizeApiBaseUrl(value) {
  const baseUrl = value.replace(/\/+$/, "");
  return baseUrl.endsWith("/api") ? baseUrl : `${baseUrl}/api`;
}

export class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

export function getStoredAuthToken() {
  try {
    return localStorage.getItem("auth_token") || "";
  } catch {
    return "";
  }
}

export function setStoredAuthToken(token) {
  try {
    if (token) localStorage.setItem("auth_token", token);
    else localStorage.removeItem("auth_token");
  } catch {
    /* ignore */
  }
}

export function clearStoredAuthToken() {
  setStoredAuthToken("");
}

export function notifyUnauthorized() {
  window.dispatchEvent(new CustomEvent("auth:unauthorized"));
}

export const apiClient = axios.create({
  baseURL: API_BASE_URL.endsWith("/api") ? API_BASE_URL : `${API_BASE_URL}/api`,
  headers: { "Content-Type": "application/json" },
  withCredentials: false,
});

apiClient.interceptors.request.use((config) => {
  const token = getStoredAuthToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => {
    if (response.status === 204) return undefined;
    const data = response.data;
    if (data && typeof data === "object" && "success" in data) {
      if (data.success) {
        if (data.meta && Array.isArray(data.data)) {
          return { items: data.data, meta: data.meta };
        }
        return data.data;
      }
      throw new ApiError(data.error?.message || "Request failed", response.status);
    }
    return data;
  },
  (error) => {
    if (error.response?.status === 401) {
      clearStoredAuthToken();
      notifyUnauthorized();
    }
    const message =
      error.response?.data?.error?.message ||
      error.response?.data?.message ||
      error.message ||
      "Request failed";
    throw new ApiError(message, error.response?.status || 0);
  }
);

export async function apiRequest(path, options = {}) {
  const { body, headers, ...rest } = options;
  const config = {
    url: path,
    method: rest.method || "GET",
    headers: { ...headers },
  };
  if (body !== undefined && !(body instanceof FormData) && typeof body !== "string") {
    config.data = body;
  } else if (body !== undefined) {
    config.data = body;
  }
  const response = await apiClient.request(config);
  return response;
}
