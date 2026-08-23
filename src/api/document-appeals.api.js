import { apiRequest } from "../lib/http.js";

function withQuery(path, params = {}) {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      query.set(key, String(value));
    }
  });
  const search = query.toString();
  return `${path}${search ? `?${search}` : ""}`;
}

export const createDocumentAppeal = (documentId, reason, description) =>
  apiRequest(`/documents/${documentId}/appeals`, {
    method: "POST",
    body: {
      reason: reason.trim(),
      ...(description?.trim() ? { description: description.trim() } : {}),
    },
  });

export const getMyAppeals = (params) =>
  apiRequest(withQuery("/appeals", params));
