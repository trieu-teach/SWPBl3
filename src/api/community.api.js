import { apiRequest } from "../lib/http.js";

export function getCommunityDocuments(params = {}) {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== "" && value !== undefined && value !== null) {
      query.set(key, String(value));
    }
  });
  return apiRequest(`/community/documents?${query.toString()}`);
}

export function getCommunityPreview(id) {
  return apiRequest(`/documents/${id}/preview`);
}

export function saveCommunityDocument(id) {
  return apiRequest(`/community/documents/${id}/save`, { method: "POST" });
}

export function unsaveCommunityDocument(id) {
  return apiRequest(`/community/documents/${id}/save`, { method: "DELETE" });
}

export function reportCommunityDocument(id, payload) {
  return apiRequest(`/documents/${id}/report`, {
    method: "POST",
    body: payload,
  });
}
