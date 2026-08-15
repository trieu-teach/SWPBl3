import { useCallback, useEffect, useMemo, useState } from "react";
import {
  getAdminSubscriptionPurchases,
  getAdminSubscriptionStats,
  getAdminUserBilling,
} from "../../../../api/admin-subscriptions.api.js";

export default function useAdminSubscriptions() {
  const [stats, setStats] = useState({
    plans: [],
    totals: { purchaseCount: 0, revenue: 0 },
  });
  const [purchases, setPurchases] = useState([]);
  const [meta, setMeta] = useState({ page: 1, totalItems: 0, totalPages: 0 });
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [plan, setPlan] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [detailTarget, setDetailTarget] = useState(null);
  const [billingDetail, setBillingDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState("");

  const query = useMemo(
    () => ({ page, limit: 20, search, plan }),
    [page, search, plan],
  );

  const load = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const [statsResponse, purchasesResponse] = await Promise.all([
        getAdminSubscriptionStats(),
        getAdminSubscriptionPurchases(query),
      ]);

      setStats(
        statsResponse || {
          plans: [],
          totals: { purchaseCount: 0, revenue: 0 },
        },
      );
      setPurchases(purchasesResponse?.items || purchasesResponse?.data || []);
      setMeta(
        purchasesResponse?.meta || {
          page: 1,
          totalItems: 0,
          totalPages: 0,
        },
      );
    } catch (requestError) {
      setError(requestError.message || "Không thể tải dữ liệu đăng ký gói.");
    } finally {
      setLoading(false);
    }
  }, [query]);

  useEffect(() => {
    load();
  }, [load]);

  function submitSearch(event) {
    event.preventDefault();
    setPage(1);
    setSearch(searchInput.trim());
  }

  function changePlan(value) {
    setPage(1);
    setPlan(value);
  }

  function resetFilters() {
    setSearchInput("");
    setSearch("");
    setPlan("");
    setPage(1);
  }

  const openDetail = useCallback(async (purchase) => {
    setDetailTarget(purchase);
    setBillingDetail(null);
    setDetailError("");
    setDetailLoading(true);

    try {
      const response = await getAdminUserBilling(
        purchase.userId,
        purchase.invoiceNumber,
      );
      setBillingDetail(response);
    } catch (requestError) {
      setDetailError(
        requestError.message || "Không thể tải chi tiết đăng ký gói.",
      );
    } finally {
      setDetailLoading(false);
    }
  }, []);

  function closeDetail() {
    setDetailTarget(null);
    setBillingDetail(null);
    setDetailError("");
  }

  function retryDetail() {
    if (detailTarget) openDetail(detailTarget);
  }

  return {
    stats,
    purchases,
    meta,
    searchInput,
    plan,
    page,
    loading,
    error,
    detailTarget,
    billingDetail,
    detailLoading,
    detailError,
    setSearchInput,
    setPage,
    submitSearch,
    changePlan,
    resetFilters,
    load,
    openDetail,
    closeDetail,
    retryDetail,
  };
}
