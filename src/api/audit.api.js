import { apiRequest } from "../lib/http.js";

/**
 * Fetch audit log entries for admin review.
 * @param {{ userId?: string, action?: string, keyword?: string, page?: number, limit?: number }} params
 */
export function getAuditLogs(params = {}) {
  const searchParams = new URLSearchParams();
  if (params.userId) searchParams.set("userId", params.userId);
  if (params.action) searchParams.set("action", params.action);
  if (params.keyword) searchParams.set("keyword", params.keyword);
  if (params.page > 1) searchParams.set("page", String(params.page));
  if (params.limit && params.limit !== 10) searchParams.set("limit", String(params.limit));
  const qs = searchParams.toString();
  return apiRequest(`/admin/logs/audit${qs ? `?${qs}` : ""}`);
}
