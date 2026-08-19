import { apiRequest } from "../lib/http.js";

/**
 * Fetch download log entries for admin review.
 * @param {{
 *   page?: number,
 *   limit?: number,
 *   keyword?: string,
 *   userRole?: string,
 *   fileType?: string,
 *   visibility?: string,
 *   from?: string,
 *   to?: string,
 *   sortBy?: string,
 *   sortOrder?: string
 * }} params
 */
export function getDownloadLogs(params = {}) {
  const searchParams = new URLSearchParams();

  // Always send pagination and sorting
  searchParams.set("page", String(params.page ?? 1));
  searchParams.set("limit", String(params.limit ?? 20));
  searchParams.set("sortBy", params.sortBy ?? "downloadedAt");
  searchParams.set("sortOrder", params.sortOrder ?? "desc");

  // Optional filters
  if (params.keyword?.trim()) searchParams.set("keyword", params.keyword.trim());
  if (params.userRole) searchParams.set("userRole", params.userRole);
  if (params.fileType) searchParams.set("fileType", params.fileType);
  if (params.visibility) searchParams.set("visibility", params.visibility);
  if (params.from) searchParams.set("from", params.from);
  if (params.to) searchParams.set("to", params.to);

  return apiRequest(`/admin/logs/downloads?${searchParams.toString()}`);
}
