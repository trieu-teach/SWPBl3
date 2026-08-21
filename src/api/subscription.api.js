import { apiRequest } from "../lib/http.js";

export const getPublicSubscriptionPlans = () =>
  apiRequest("/subscription/plans");

export const getMySubscription = () =>
  apiRequest("/subscription/current");

export const createCheckout = (plan, paymentMethod = "BANK_TRANSFER") =>
  apiRequest("/payments/checkout", {
    method: "POST",
    body: { plan, paymentMethod },
  });

export const getPaymentHistory = () =>
  apiRequest("/payments/history");

export const getPaymentStatus = (invoiceNumber) =>
  apiRequest(`/payments/${invoiceNumber}`);

export const updatePaymentStatus = (invoiceNumber, status) =>
  apiRequest(`/payments/${invoiceNumber}/status`, {
    method: "POST",
    body: { status },
  });
