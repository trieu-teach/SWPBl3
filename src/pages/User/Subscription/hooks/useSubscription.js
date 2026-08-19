import { useCallback, useEffect, useState, useRef } from "react";
import {
  getPublicSubscriptionPlans,
  createCheckout,
  getMySubscription,
  getPaymentStatus,
  updatePaymentStatus,
} from "../../../../api/subscription.api.js";

export default function useSubscription() {
  const [plans, setPlans] = useState([]);
  const [mySubscription, setMySubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [notification, setNotification] = useState(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("BANK_TRANSFER");
  const PAGE_SIZE = 6;
  const pollIntervalRef = useRef(null);

  const loadPlans = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await getPublicSubscriptionPlans();
      const items = response?.items || response?.data || response || [];
      setPlans(items);
    } catch (err) {
      setError(err.message || "Không thể tải bảng giá.");
    } finally {
      setLoading(false);
    }
  }, []);

  const loadMySubscription = useCallback(async () => {
    try {
      const data = await getMySubscription();
      setMySubscription(data);
    } catch {
      setMySubscription(null);
    }
  }, []);

  const loadAll = useCallback(async () => {
    await Promise.all([loadPlans(), loadMySubscription()]);
  }, [loadPlans, loadMySubscription]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  useEffect(() => {
    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    };
  }, []);

  const submitSepayCheckout = useCallback((checkoutUrl, fields) => {
    const form = document.createElement("form");
    form.method = "POST";
    form.action = checkoutUrl;
    form.acceptCharset = "UTF-8";

    for (const [name, value] of Object.entries(fields)) {
      const input = document.createElement("input");
      input.type = "hidden";
      input.name = name;
      input.value = String(value);
      form.appendChild(input);
    }

    document.body.appendChild(form);
    form.submit();
  }, []);

  const purchasePlan = useCallback(async (planCode) => {
    setProcessing(true);
    setError("");
    try {
      const checkoutData = await createCheckout(planCode, selectedPaymentMethod);
      if (checkoutData?.checkoutUrl && checkoutData?.fields) {
        if (checkoutData.invoiceNumber) {
          sessionStorage.setItem("pendingInvoice", checkoutData.invoiceNumber);
        }
        submitSepayCheckout(checkoutData.checkoutUrl, checkoutData.fields);
      } else {
        setNotification({ type: "success", message: "Đăng ký gói thành công!" });
        await loadMySubscription();
      }
    } catch (err) {
      setNotification({ type: "error", message: err.message || "Không thể đăng ký gói." });
    } finally {
      setProcessing(false);
    }
  }, [selectedPaymentMethod, submitSepayCheckout, loadMySubscription]);

  const pollPaymentStatus = useCallback((invoiceNumber, onPaid, onExpired) => {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
    }

    const expiresAt = new Date(Date.now() + 3 * 60 * 1000);

    pollIntervalRef.current = setInterval(async () => {
      if (new Date() > expiresAt) {
        clearInterval(pollIntervalRef.current);
        pollIntervalRef.current = null;
        onExpired?.();
        return;
      }

      try {
        const status = await getPaymentStatus(invoiceNumber);
        if (status?.status === "PAID") {
          clearInterval(pollIntervalRef.current);
          pollIntervalRef.current = null;
          onPaid?.(status);
        } else if (status?.status && !["PENDING", "PAID"].includes(status.status)) {
          clearInterval(pollIntervalRef.current);
          pollIntervalRef.current = null;
        }
      } catch {
        // Continue polling
      }
    }, 2000);
  }, []);

  const stopPolling = useCallback(() => {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }
  }, []);

  const cancelPayment = useCallback(async (invoiceNumber) => {
    try {
      await updatePaymentStatus(invoiceNumber, "CANCELLED");
    } catch {
      // Ignore errors
    }
  }, []);

  const failPayment = useCallback(async (invoiceNumber) => {
    try {
      await updatePaymentStatus(invoiceNumber, "FAILED");
    } catch {
      // Ignore errors
    }
  }, []);

  const clearNotification = useCallback(() => {
    setNotification(null);
  }, []);

  const totalPages = Math.ceil(plans.length / PAGE_SIZE);
  const paginatedPlans = plans.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const currentPlanRank = mySubscription?.plan
    ? plans.find((p) => p.code === mySubscription.plan)?.rank || 0
    : 0;

  const getButtonState = useCallback(
    (plan) => {
      if (!mySubscription) return { disabled: false, label: "Mua gói" };

      const currentRank = currentPlanRank;
      const planRank = plan.rank || 0;
      const expiresAt = mySubscription.expiresAt;
      const isActive = expiresAt && new Date(expiresAt) > new Date();
      const isCurrentPlan = mySubscription.plan === plan.code;

      if (isCurrentPlan && isActive) {
        return { disabled: true, label: "Đang dùng" };
      }
      if (mySubscription.plan !== "FREE" && isActive && planRank < currentRank) {
        return { disabled: true, label: "Không khả dụng" };
      }
      if (mySubscription.plan !== "FREE" && isActive && planRank > currentRank) {
        return { disabled: false, label: "Nâng cấp" };
      }
      return { disabled: false, label: "Mua gói" };
    },
    [mySubscription, currentPlanRank]
  );

  return {
    plans: paginatedPlans,
    allPlans: plans,
    mySubscription,
    loading,
    processing,
    error,
    notification,
    page,
    setPage,
    totalPages,
    loadPlans,
    loadAll,
    purchasePlan,
    clearNotification,
    selectedPaymentMethod,
    setSelectedPaymentMethod,
    pollPaymentStatus,
    stopPolling,
    cancelPayment,
    failPayment,
    loadMySubscription,
    currentPlanRank,
    getButtonState,
  };
}
