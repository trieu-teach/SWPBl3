import { apiRequest } from "../lib/http.js";

/**
 * Fetch download log entries for admin review.
 * @param {{ userId?: string, documentId?: string, page?: number, limit?: number }} params
 */
export function getDownloadLogs(params = {}) {
  const searchParams = new URLSearchParams();
  if (params.userId) searchParams.set("userId", params.userId);
  if (params.documentId) searchParams.set("documentId", params.documentId);
  if (params.page > 1) searchParams.set("page", String(params.page));
  if (params.limit && params.limit !== 10) searchParams.set("limit", String(params.limit));
  const qs = searchParams.toString();
  return apiRequest(`/admin/logs/downloads${qs ? `?${qs}` : ""}`);
}
