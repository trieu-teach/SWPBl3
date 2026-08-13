import { apiRequest } from "../lib/http.js";

function withQuery(path, params = {}) {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "")
      query.set(key, String(value));
  });
  const search = query.toString();
  return `${path}${search ? `?${search}` : ""}`;
}

export const getAdminDocuments = (params) =>
  apiRequest(withQuery("/admin/documents", params));
export const getAdminDocument = (id) => apiRequest(`/admin/documents/${id}`);
export const getAdminDocumentPreview = (id) =>
  apiRequest(`/admin/documents/${id}/preview`);
export const approveAdminDocument = (id) =>
  apiRequest(`/admin/documents/${id}/approve`, { method: "PUT" });
export const rejectAdminDocument = (id, reason) =>
  apiRequest(`/admin/documents/${id}/reject`, {
    method: "PUT",
    body: { reason },
  });
export const setAdminDocumentHidden = (id, hidden, reason) =>
  apiRequest(`/admin/documents/${id}/hide`, {
    method: "PUT",
    body: { hidden, ...(reason?.trim() ? { reason: reason.trim() } : {}) },
  });
