import { useCallback, useEffect, useMemo, useState } from "react";
import {
  getAdminSubscriptionPurchases,
  getAdminUserBilling,
} from "../../../../api/admin-subscriptions.api.js";
import { getAdminSubscriptionPlans } from "../../../../api/admin-subscription-plans.api.js";

export default function useAdminSubscriptions() {
  const [plans, setPlans] = useState([]);
  const [purchases, setPurchases] = useState([]);
  const [meta, setMeta] = useState({ page: 1, totalItems: 0, totalPages: 0 });
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [plan, setPlan] = useState("");
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState({
    sortBy: "paidAt",
    sortOrder: "desc",
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [detailTarget, setDetailTarget] = useState(null);
  const [billingDetail, setBillingDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState("");

  const query = useMemo(
    () => ({ page, limit: 20, search, plan, ...sort }),
    [page, search, plan, sort],
  );

  const load = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const [plansResponse, purchasesResponse] = await Promise.all([
        getAdminSubscriptionPlans(),
        getAdminSubscriptionPurchases(query),
      ]);

      setPlans(plansResponse?.items || plansResponse?.data || plansResponse || []);
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

  function toggleSort(field) {
    setPage(1);
    setSort((current) => {
      if (current.sortBy !== field) {
        return { sortBy: field, sortOrder: "desc" };
      }
      if (current.sortOrder === "desc") {
        return { sortBy: field, sortOrder: "asc" };
      }
      return { sortBy: "paidAt", sortOrder: "desc" };
    });
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
    plans,
    purchases,
    meta,
    searchInput,
    plan,
    page,
    sort,
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
    toggleSort,
    load,
    openDetail,
    closeDetail,
    retryDetail,
  };
}
