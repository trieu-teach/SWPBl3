import { apiRequest } from "../lib/http.js";

export function getAdminModerationKeywords(params = {}) {
  const query = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      query.set(key, String(value));
    }
  });

  const search = query.toString();
  return apiRequest(
    `/admin/moderation-keywords${search ? `?${search}` : ""}`,
  );
}
