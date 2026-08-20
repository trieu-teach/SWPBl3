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

const PENDING_FILTERS = new Set([
  "keyword",
  "aiStatus",
  "moderationFlag",
  "ownerId",
  "page",
  "limit",
]);

export const getPendingAdminDocuments = (params = {}) =>
  apiRequest(
    withQuery(
      "/admin/documents/pending",
      Object.fromEntries(
        Object.entries(params).filter(([key]) => PENDING_FILTERS.has(key)),
      ),
    ),
  );
export const getAdminDocument = (id) => apiRequest(`/admin/documents/${id}`);
export const getAdminDocumentPreview = (id) =>
  apiRequest(`/admin/documents/${id}/preview`);

export const moderateAdminDocument = (id, status, reason) =>
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
