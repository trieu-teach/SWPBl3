import { apiRequest } from "../lib/http.js";

export const getPublicSubscriptionPlans = () =>
  apiRequest("/subscription/plans");
