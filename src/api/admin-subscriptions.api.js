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

export const getAdminSubscriptionStats = () =>
  apiRequest("/admin/subscriptions/stats");

export const getAdminSubscriptionPurchases = (params) =>
  apiRequest(withQuery("/admin/subscriptions/purchases", params));
