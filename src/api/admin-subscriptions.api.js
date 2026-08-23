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

/**
 * Fetch subscription stats (for pie chart on Reports page).
 * @param {{ from?: string, to?: string }} params - optional date range
 */
export const getAdminSubscriptionStats = (params = {}) =>
  apiRequest(withQuery("/admin/subscriptions/stats", params));

export const getAdminSubscriptionPurchases = (params) =>
  apiRequest(withQuery("/admin/subscriptions/purchases", params));

export const getAdminUserBilling = (userId, invoiceNumber) =>
  apiRequest(
    withQuery(`/admin/users/${userId}/billing`, {
      invoiceNumber,
    }),
  );
