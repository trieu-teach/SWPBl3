import { useCallback, useEffect, useMemo, useState } from "react";
import { getAuditLogs } from "../../../../api/audit.api.js";

const INITIAL_FILTERS = {
  action: "",
  userId: "",
  keyword: "",
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

  const query = useMemo(
    () => ({
      ...filters,
      page,
      limit: 20,
    }),
    [filters, page],
  );

  const loadLogs = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await getAuditLogs(query);
      const items = response?.items || response?.data || [];
      const meta =
        response?.meta ||
        response ||
        {};
      const count = Number(
        meta.totalItems ?? meta.total ?? items.length,
      );
      setLogs(items);
      setTotal(count);
      setPageCount(
        Number(meta.totalPages ?? Math.max(1, Math.ceil(count / 20))),
      );
    } catch (err) {
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
    updateFilter("keyword", searchInput.trim());
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
