import { apiRequest } from "../lib/http.js";

export const getDashboardOverview = () =>
  apiRequest("/admin/dashboard/overview");

export const getDashboardStatistics = () =>
  apiRequest("/admin/dashboard/statistics");

export function getDashboardUploadStatistics(params = {}) {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value) query.set(key, String(value));
  });
  const search = query.toString();
  return apiRequest(
    `/admin/dashboard/upload-statistics${search ? `?${search}` : ""}`,
  );
}
