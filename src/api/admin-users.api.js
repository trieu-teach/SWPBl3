import { apiRequest } from "../lib/http.js";

export function getAdminUsers(params = {}) {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      query.set(key, String(value));
    }
  });
  const search = query.toString();
  return apiRequest(`/admin/users${search ? `?${search}` : ""}`);
}

export function updateAdminUserStatus(id, status, reason) {
  return apiRequest(`/admin/users/${id}/status`, {
    method: "PATCH",
    body: { status, ...(reason?.trim() ? { reason: reason.trim() } : {}) },
  });
}

export function updateAdminUserRole(id, role) {
  return apiRequest(`/admin/users/${id}/role`, {
    method: "PATCH",
    body: { role },
  });
}
