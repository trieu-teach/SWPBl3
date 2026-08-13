import { useCallback, useEffect, useMemo, useState } from "react";
import {
  getAdminSubscriptionPurchases,
  getAdminSubscriptionStats,
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

  return {
    stats,
    purchases,
    meta,
    searchInput,
    plan,
    page,
    loading,
    error,
    setSearchInput,
    setPage,
    submitSearch,
    changePlan,
    resetFilters,
    load,
  };
}
