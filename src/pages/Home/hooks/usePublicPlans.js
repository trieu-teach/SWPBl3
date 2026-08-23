import { useCallback, useEffect, useState } from "react";
import { getPublicSubscriptionPlans } from "../../../api/subscription.api.js";

function formatStorage(megabytes) {
  if (megabytes >= 1024) {
    return `${(megabytes / 1024).toLocaleString("vi-VN")} GB dung lượng`;
  }
  return `${megabytes.toLocaleString("vi-VN")} MB dung lượng`;
}

function toPricingPlan(plan) {
  return {
    ...plan,
    price: plan.checkoutAmount,
    originalPrice: plan.amount,
    period:
      plan.billingPeriod === "MONTHLY"
        ? "đ / tháng"
        : `đ / ${plan.durationDays} ngày`,
    highlight: false,
    features: [
      formatStorage(plan.storageLimitMb),
      plan.aiChatLimit === null
        ? "Câu hỏi AI không giới hạn"
        : `${plan.aiChatLimit.toLocaleString("vi-VN")} câu hỏi AI`,
      `Thời hạn ${plan.durationDays.toLocaleString("vi-VN")} ngày`,
    ],
    cta: `Chọn gói ${plan.name}`,
  };
}

export default function usePublicPlans() {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadPlans = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await getPublicSubscriptionPlans();
      const items = response?.items || response?.data || response || [];
      setPlans(items.map(toPricingPlan));
    } catch (requestError) {
      setError(requestError.message || "Không thể tải bảng giá.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPlans();
  }, [loadPlans]);

  return { plans, loading, error, loadPlans };
}
