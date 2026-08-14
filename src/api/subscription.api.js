import { apiRequest } from "../lib/http.js";

export const getPublicSubscriptionPlans = () =>
  apiRequest("/subscription/plans");

export const getMySubscription = () =>
  apiRequest("/subscription/current");

export const createCheckout = (planCode) =>
  apiRequest("/payments/checkout", {
    method: "POST",
    body: { plan: planCode, paymentMethod: "BANK_TRANSFER" },
  });

export const getPaymentHistory = () =>
  apiRequest("/payments/history");

export const getPaymentStatus = (invoiceNumber) =>
  apiRequest(`/payments/${invoiceNumber}`);
