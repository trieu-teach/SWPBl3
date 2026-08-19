import { apiRequest } from "../lib/http.js";

export const getAdminSubscriptionPlans = (isActive) =>
  apiRequest(
    `/admin/subscription-plans${
      isActive === "" || isActive === undefined ? "" : `?isActive=${isActive}`
    }`,
  );

export const createAdminSubscriptionPlan = (payload) =>
  apiRequest("/admin/subscription-plans", {
    method: "POST",
    body: payload,
  });

export const updateAdminSubscriptionPlan = (id, payload) =>
  apiRequest(`/admin/subscription-plans/${id}`, {
    method: "PUT",
    body: payload,
  });

export const deactivateAdminSubscriptionPlan = (id) =>
  apiRequest(`/admin/subscription-plans/${id}`, { method: "DELETE" });
