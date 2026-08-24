import { apiRequest } from "../lib/http.js";

/**
 * Fetch upload statistics grouped by time period.
 * @param {{ from?: string, to?: string, groupBy?: "day"|"week"|"month" }} params
 */
export function getUploadStatistics(params = {}) {
  const searchParams = new URLSearchParams();
  if (params.from) searchParams.set("from", params.from);
  if (params.to) searchParams.set("to", params.to);
  if (params.groupBy && params.groupBy !== "day") searchParams.set("groupBy", params.groupBy);
  const qs = searchParams.toString();
  return apiRequest(`/admin/reports/upload-statistics${qs ? `?${qs}` : ""}`);
}

/**
 * Fetch most downloaded documents report.
 * @param {{ fromDate?: string, toDate?: string, limit?: number }} params
 */
export function getMostDownloaded(params = {}) {
  const searchParams = new URLSearchParams();
  if (params.fromDate) searchParams.set("fromDate", params.fromDate);
  if (params.toDate) searchParams.set("toDate", params.toDate);
  if (params.limit && params.limit !== 10) searchParams.set("limit", String(params.limit));
  const qs = searchParams.toString();
  return apiRequest(`/admin/reports/most-downloaded${qs ? `?${qs}` : ""}`);
}

/**
 * Fetch most saved documents report.
 * @param {{ fromDate?: string, toDate?: string, limit?: number }} params
 */
export function getMostSaved(params = {}) {
  const searchParams = new URLSearchParams();
  if (params.fromDate) searchParams.set("fromDate", params.fromDate);
  if (params.toDate) searchParams.set("toDate", params.toDate);
  if (params.limit && params.limit !== 10) searchParams.set("limit", String(params.limit));
  const qs = searchParams.toString();
  return apiRequest(`/admin/reports/most-saved${qs ? `?${qs}` : ""}`);
}

/**
 * Fetch heaviest documents report (sorted by fileSize descending).
 * @param {{ from?: string, to?: string, limit?: number }} params
 */
export function getHeaviestDocuments(params = {}) {
  const searchParams = new URLSearchParams();
  if (params.from) searchParams.set("from", params.from);
  if (params.to) searchParams.set("to", params.to);
  if (params.limit && params.limit !== 10) searchParams.set("limit", String(params.limit));
  const qs = searchParams.toString();
  return apiRequest(`/admin/reports/heaviest-documents${qs ? `?${qs}` : ""}`);
}

/**
 * Fetch top contributors report (public approved documents only).
 * @param {{ from?: string, to?: string, limit?: number }} params
 */
export function getTopContributors(params = {}) {
  const searchParams = new URLSearchParams();
  if (params.from) searchParams.set("from", params.from);
  if (params.to) searchParams.set("to", params.to);
  if (params.limit && params.limit !== 10) searchParams.set("limit", String(params.limit));
  const qs = searchParams.toString();
  return apiRequest(`/admin/reports/top-contributors${qs ? `?${qs}` : ""}`);
}

/**
 * Fetch top uploaders report (all documents including private/unapproved).
 * @param {{ from?: string, to?: string, limit?: number }} params
 */
export function getTopUploaders(params = {}) {
  const searchParams = new URLSearchParams();
  if (params.from) searchParams.set("from", params.from);
  if (params.to) searchParams.set("to", params.to);
  if (params.limit && params.limit !== 10) searchParams.set("limit", String(params.limit));
  const qs = searchParams.toString();
  return apiRequest(`/admin/reports/top-uploaders${qs ? `?${qs}` : ""}`);
}
