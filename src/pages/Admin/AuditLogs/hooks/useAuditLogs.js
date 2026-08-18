import { useCallback, useEffect, useMemo, useState } from "react";
import { getAuditLogs } from "../../../../api/audit.api.js";

const INITIAL_FILTERS = {
  userRole: "",
  action: "",
  result: "",
  from: "",
  to: "",
  sortOrder: "desc",
};

export default function useAuditLogs() {
  const [logs, setLogs] = useState([]);
  const [filters, setFilters] = useState(INITIAL_FILTERS);
  const [searchInput, setSearchInput] = useState("");
  const [page, setPage] = useState(1);
  const [pageCount, setPageCount] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const query = useMemo(() => {
    const q = {
      page,
      limit: 10,
      sortOrder: filters.sortOrder || "desc",
    };
    if (filters.userRole) q.userRole = filters.userRole;
    if (filters.action) q.action = filters.action;
    if (filters.result) q.result = filters.result;
    if (filters.from) q.from = filters.from;
    if (filters.to) q.to = filters.to;
    if (searchInput.trim()) q.keyword = searchInput.trim();
    return q;
  }, [filters, page, searchInput]);

  const loadLogs = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await getAuditLogs(query);
      console.log("🔍 Audit Logs API Response:", response);
      console.log("🔍 Query sent:", query);
      const data = response?.items || response?.data || [];
      const meta = response?.meta || {};
      const count = Number(meta.totalItems ?? data.length);
      setLogs(data);
      setTotal(count);
      setPageCount(Number(meta.totalPages ?? Math.max(1, Math.ceil(count / 10))));
    } catch (err) {
      console.error("❌ Audit Logs API Error:", err);
      setError(err.message || "Không thể tải nhật ký kiểm tra.");
    } finally {
      setLoading(false);
    }
  }, [query]);

  useEffect(() => {
    loadLogs();
  }, [loadLogs]);

  function updateFilter(name, value) {
    setPage(1);
    setFilters((current) => ({ ...current, [name]: value }));
  }

  function applySearch(event) {
    event.preventDefault();
    setPage(1);
  }

  function resetFilters() {
    setSearchInput("");
    setFilters(INITIAL_FILTERS);
    setPage(1);
  }

  function retry() {
    loadLogs();
  }

  return {
    logs,
    filters,
    searchInput,
    page,
    pageCount,
    total,
    loading,
    error,
    setSearchInput,
    setPage,
    updateFilter,
    applySearch,
    resetFilters,
    retry,
  };
}
