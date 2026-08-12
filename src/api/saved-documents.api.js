import { apiRequest } from "../lib/http.js";

export function getSavedDocuments(params = {}) {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== "" && value !== undefined && value !== null) {
      query.set(key, String(value));
    }
  });
  return apiRequest(`/saved-documents?${query.toString()}`);
}
