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

export function getModerationReports(params = {}) {
  return apiRequest(withQuery("/admin/reports", params));
}

export function resolveModerationReport(id, status) {
  return apiRequest(`/admin/reports/${id}/resolve`, {
    method: "PATCH",
    body: { status, action: "NONE" },
  });
}
