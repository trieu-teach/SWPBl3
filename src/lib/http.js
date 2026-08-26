import axios from "axios";
import { getAuth } from "firebase/auth";

export const API_BASE_URL = (
  import.meta.env?.VITE_API_BASE_URL || "http://localhost:3001/api"
).replace(/\/+$/, "");

export class ApiError extends Error {
  constructor(message, status, code, details) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

function getQuotaErrorMessage(code, details, rawMessage = "") {
  if (
    code === "STORAGE_LIMIT_EXCEEDED" ||
    rawMessage.toLowerCase().includes("storage limit exceeded")
  ) {
    const parsedLimit = rawMessage.match(/allows\s+(\d+)\s+MB/i)?.[1];
    const limit = details?.storageLimitMb ?? parsedLimit;
    const suffix = Number.isFinite(Number(limit)) ? ` (${limit} MB)` : "";
    return `Dung lượng lưu trữ đã đầy${suffix}. Vui lòng nâng cấp gói hoặc xóa bớt tài liệu cũ.`;
  }
  if (
    code === "AI_CREDIT_LIMIT_EXCEEDED" ||
    rawMessage.toLowerCase().includes("ai credit limit exceeded")
  ) {
    return "Bạn đã dùng hết hạn mức AI Credits. Hãy nâng cấp lên gói Pro hoặc Gold để tiếp tục sử dụng AI.";
  }
  return "";
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

apiClient.interceptors.request.use(async (config) => {
  const explicitAuth = config.headers?.Authorization;
  if (explicitAuth) {
    // Caller supplied their own Authorization (e.g. firebase-login passes idToken per-request).
    return config;
  }
  // Prefer Firebase idToken if a user is signed in (BE verifies it on every request).
  // Falls back to whatever is in localStorage for backwards-compat with stored BE JWTs.
  try {
    const firebaseAuth = getAuth();
    const user = firebaseAuth.currentUser;
    if (user) {
      const idToken = await user.getIdToken(false);
      if (idToken) {
        config.headers.Authorization = `Bearer ${idToken}`;
        return config;
      }
    }
  } catch {
    // ignore — fall through to stored token
  }
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
      throw new ApiError(
        data.error?.message || "Request failed",
        response.status,
        data.error?.code,
        data.error?.details,
      );
    }
    return data;
  },
  (error) => {
    if (error.response?.status === 401) {
      clearStoredAuthToken();
      notifyUnauthorized();
    }
    const code = error.response?.data?.error?.code;
    const details = error.response?.data?.error?.details;
    const rawMessage =
      error.response?.data?.error?.message ||
      error.response?.data?.message ||
      error.message ||
      "Request failed";
    const message =
      getQuotaErrorMessage(code, details, rawMessage) || rawMessage;
    throw new ApiError(
      message,
      error.response?.status || 0,
      code,
      details,
    );
  },
);

export async function apiRequest(path, options = {}) {
  const { body, headers, ...rest } = options;
  const config = {
    ...rest,
    url: path,
    method: rest.method || "GET",
    headers: { ...headers },
  };
  if (
    body !== undefined &&
    !(body instanceof FormData) &&
    typeof body !== "string"
  ) {
    config.data = body;
  } else if (body !== undefined) {
    config.data = body;
  }
  const response = await apiClient.request(config);
  return response;
}
