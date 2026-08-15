import { useCallback, useEffect, useState } from "react";
import {
  getPublicSubscriptionPlans,
  createCheckout,
  getMySubscription,
} from "../../../../api/subscription.api.js";

export default function useSubscription() {
  const [plans, setPlans] = useState([]);
  const [mySubscription, setMySubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [notification, setNotification] = useState(null);
  const PAGE_SIZE = 6;

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

  const purchasePlan = useCallback(async (planCode) => {
    setProcessing(true);
    setError("");
    try {
      const checkoutData = await createCheckout(planCode);
      if (checkoutData?.checkoutUrl) {
        window.location.href = checkoutData.checkoutUrl;
      } else {
        setNotification({ type: "success", message: "Đăng ký gói thành công!" });
        await loadMySubscription();
      }
    } catch (err) {
      setNotification({ type: "error", message: err.message || "Không thể đăng ký gói." });
    } finally {
      setProcessing(false);
    }
  }, [loadMySubscription]);

  const clearNotification = useCallback(() => {
    setNotification(null);
  }, []);

  const totalPages = Math.ceil(plans.length / PAGE_SIZE);
  const paginatedPlans = plans.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

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
  };
}
