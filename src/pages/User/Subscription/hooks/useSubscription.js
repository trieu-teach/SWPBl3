import { useCallback, useEffect, useMemo, useState } from "react";
import {
  createCheckout,
  getMySubscription,
  getPaymentStatus,
  getPublicSubscriptionPlans,
  updatePaymentStatus,
} from "../../../../api/subscription.api.js";

const PAGE_SIZE = 6;
const PAYMENT_METHOD = "BANK_TRANSFER";
const POLL_DELAY_MS = 2_000;

function secondsUntil(dateString) {
  const expiresAt = new Date(dateString).getTime();
  if (!Number.isFinite(expiresAt)) return 0;
  return Math.max(0, Math.ceil((expiresAt - Date.now()) / 1_000));
}

export default function useSubscription() {
  const [plans, setPlans] = useState([]);
  const [mySubscription, setMySubscription] = useState(null);
  const [checkout, setCheckout] = useState(null);
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const [loading, setLoading] = useState(true);
  const [processingPlanCode, setProcessingPlanCode] = useState("");
  const [cancellingPayment, setCancellingPayment] = useState(false);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [notification, setNotification] = useState(null);

  const loadPlans = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await getPublicSubscriptionPlans();
      const items = response?.items || response?.data || response || [];
      setPlans(Array.isArray(items) ? items : []);
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
      return data;
    } catch {
      setMySubscription(null);
      return null;
    }
  }, []);

  const loadAll = useCallback(async () => {
    await Promise.all([loadPlans(), loadMySubscription()]);
  }, [loadPlans, loadMySubscription]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const purchasePlan = useCallback(async (planCode) => {
    if (processingPlanCode) return;

    setProcessingPlanCode(planCode);
    setError("");
    setNotification(null);

    try {
      const payment = await createCheckout(planCode, PAYMENT_METHOD);
      if (!payment?.invoiceNumber || !payment?.qrUrl || !payment?.expiresAt) {
        throw new Error("Backend không trả về thông tin VietQR hợp lệ.");
      }

      setRemainingSeconds(secondsUntil(payment.expiresAt));
      setCheckout({ ...payment, status: "PENDING" });
    } catch (err) {
      setNotification({
        type: "error",
        message: err.message || "Không thể tạo giao dịch thanh toán.",
      });
      setProcessingPlanCode("");
    }
  }, [processingPlanCode]);

  useEffect(() => {
    if (!checkout?.invoiceNumber || checkout.status !== "PENDING") return undefined;

    let stopped = false;
    let pollTimer;

      const finishPayment = async (payment) => {
      if (["PAID", "SUCCESS"].includes(payment.status)) {
        // Keep checkout open to show success UI in dialog
        setCheckout((current) =>
          current ? { ...current, status: payment.status } : current,
        );
        setProcessingPlanCode("");
        // Reload subscription data
        await loadMySubscription();
        return true;
      }

      if (payment.status && payment.status !== "PENDING") {
        setCheckout((current) =>
          current ? { ...current, status: payment.status } : current,
        );
        setProcessingPlanCode("");
        return true;
      }
      return false;
    };

    const poll = async () => {
      if (stopped) return;
      try {
        const payment = await getPaymentStatus(checkout.invoiceNumber);
        if (stopped || (await finishPayment(payment))) return;
      } catch {
        // Lỗi mạng tạm thời không làm mất giao dịch; lần polling sau sẽ thử lại.
      }
      if (!stopped) pollTimer = window.setTimeout(poll, POLL_DELAY_MS);
    };

    const countdownTimer = window.setInterval(() => {
      const seconds = secondsUntil(checkout.expiresAt);
      setRemainingSeconds(seconds);
      if (seconds === 0) {
        window.clearInterval(countdownTimer);
      }
    }, 1_000);

    poll();
    return () => {
      stopped = true;
      window.clearTimeout(pollTimer);
      window.clearInterval(countdownTimer);
    };
  }, [checkout?.expiresAt, checkout?.invoiceNumber, checkout?.status, loadMySubscription]);

  const cancelPayment = useCallback(async () => {
    if (!checkout?.invoiceNumber || cancellingPayment) return;

    setCancellingPayment(true);
    try {
      const payment = await updatePaymentStatus(
        checkout.invoiceNumber,
        "CANCELLED",
      );
      setCheckout(null);
      setProcessingPlanCode("");
      setNotification({
        type: payment?.status === "EXPIRED" ? "warning" : "info",
        message:
          payment?.status === "EXPIRED"
            ? "Đơn thanh toán đã hết hạn."
            : "Đã hủy giao dịch thanh toán.",
      });
    } catch (err) {
      setNotification({
        type: "error",
        message: err.message || "Không thể hủy giao dịch thanh toán.",
      });
    } finally {
      setCancellingPayment(false);
    }
  }, [cancellingPayment, checkout]);

  const dismissPayment = useCallback(() => {
    if (checkout?.status === "PENDING") return;
    setCheckout(null);
    setProcessingPlanCode("");
  }, [checkout?.status]);

  // For creating a new payment after terminal states (EXPIRED, CANCELLED, etc.)
  const resetPayment = useCallback(() => {
    setCheckout(null);
    setProcessingPlanCode("");
    setRemainingSeconds(0);
  }, []);

  const clearNotification = useCallback(() => setNotification(null), []);
  const totalPages = Math.ceil(plans.length / PAGE_SIZE);
  const paginatedPlans = useMemo(
    () => plans.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    [page, plans],
  );

  const currentPlanRank = mySubscription?.plan
    ? plans.find((plan) => plan.code === mySubscription.plan)?.rank || 0
    : 0;

  const getButtonState = useCallback(
    (plan) => {
      if (!mySubscription) return { disabled: false, label: "Mua gói" };

      const planRank = plan.rank || 0;
      const isActive =
        !mySubscription.expiresAt ||
        new Date(mySubscription.expiresAt) > new Date();
      const isCurrentPlan = mySubscription.plan === plan.code;

      if (isCurrentPlan && isActive) {
        return { disabled: true, label: "Đang dùng" };
      }
      if (
        mySubscription.plan !== "FREE" &&
        isActive &&
        planRank < currentPlanRank
      ) {
        return { disabled: true, label: "Không khả dụng" };
      }
      if (
        mySubscription.plan !== "FREE" &&
        isActive &&
        planRank > currentPlanRank
      ) {
        return { disabled: false, label: "Nâng cấp" };
      }
      return { disabled: false, label: "Mua gói" };
    },
    [currentPlanRank, mySubscription],
  );

  return {
    plans: paginatedPlans,
    allPlans: plans,
    mySubscription,
    checkout,
    remainingSeconds,
    loading,
    processing: Boolean(processingPlanCode),
    processingPlanCode,
    cancellingPayment,
    error,
    notification,
    page,
    setPage,
    totalPages,
    loadPlans,
    loadAll,
    purchasePlan,
    cancelPayment,
    dismissPayment,
    resetPayment,
    clearNotification,
    loadMySubscription,
    currentPlanRank,
    getButtonState,
  };
}
