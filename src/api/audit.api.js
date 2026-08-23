import { apiRequest } from "../lib/http.js";

/**
 * Fetch audit log entries for admin review.
 * @param {{
 *   page?: number,
 *   limit?: number,
 *   userRole?: string,
 *   action?: string,
 *   result?: string,
 *   from?: string,
 *   to?: string,
 *   sortOrder?: 'asc' | 'desc',
 *   userId?: string,
 *   keyword?: string
 * }} params
 */
export function getAuditLogs(params = {}) {
  const searchParams = new URLSearchParams();

  if (params.page > 1) searchParams.set("page", String(params.page));
  if (params.limit && params.limit !== 10) searchParams.set("limit", String(params.limit));
  if (params.userRole) searchParams.set("userRole", params.userRole);
  if (params.action) searchParams.set("action", params.action);
  if (params.result) searchParams.set("result", params.result);
  if (params.from) searchParams.set("from", params.from);
  if (params.to) searchParams.set("to", params.to);
  if (params.sortOrder) searchParams.set("sortOrder", params.sortOrder);
  if (params.userId) searchParams.set("userId", params.userId);
  if (params.keyword) searchParams.set("keyword", params.keyword);

  const qs = searchParams.toString();
  return apiRequest(`/admin/logs/audit${qs ? `?${qs}` : ""}`);
}
