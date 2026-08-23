import { apiRequest } from "../lib/http.js";

export function rateDocument(documentId, isHelpful) {
  if (!documentId) {
    throw new Error("documentId is required to rate document");
  }

  return apiRequest(`/documents/${encodeURIComponent(documentId)}/rate`, {
    method: "POST",
    body: { isHelpful: Boolean(isHelpful) },
  });
}

export function getTopRatedDocuments({
  page = 1,
  limit = 20,
  sortBy = "rating",
} = {}) {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
    sortBy,
  });

  return apiRequest(`/documents/top-rated?${params.toString()}`);
}
