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

export const getPendingAdminDocuments = (params) =>
  apiRequest(withQuery("/admin/documents/pending", params));

export const getAdminDocument = (id) => apiRequest(`/admin/documents/${id}`);

export const getAdminDocumentPreview = (id) =>
  apiRequest(`/admin/documents/${id}/preview`);

export const claimAdminDocument = (id) =>
  apiRequest(`/admin/documents/${id}/claim`, { method: "PATCH" });

export const addKeywordException = (id, keywordId, reason) =>
  apiRequest(`/admin/documents/${id}/keyword-exceptions`, {
    method: "POST",
    body: {
      keywordId,
      ...(reason?.trim() ? { reason: reason.trim() } : {}),
    },
  });

export const removeKeywordException = (id, keywordId) =>
  apiRequest(`/admin/documents/${id}/keyword-exceptions/${keywordId}`, {
    method: "DELETE",
  });

const moderateAdminDocument = (id, status, reason) =>
  apiRequest(`/admin/documents/${id}/moderate`, {
    method: "PATCH",
    body: {
      status,
      ...(reason?.trim() ? { reason: reason.trim() } : {}),
    },
  });

export const approveAdminDocument = (id) =>
  moderateAdminDocument(id, "APPROVED");

export const rejectAdminDocument = (id, reason) =>
  moderateAdminDocument(id, "REJECTED", reason);

export const setAdminDocumentHidden = (id, hidden, reason) =>
  apiRequest(`/admin/documents/${id}/hide`, {
    method: "PUT",
    body: { hidden, ...(reason?.trim() ? { reason: reason.trim() } : {}) },
  });
