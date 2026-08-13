import { useCallback, useEffect, useMemo, useState } from "react";
import {
  getAdminUsers,
  updateAdminUserStatus,
} from "../../../../api/admin-users.api.js";
import { useToast } from "../../../../components/Toast/ToastProvider.jsx";

const INITIAL_FILTERS = { keyword: "", role: "", status: "" };

export default function useAdminUsers() {
  const toast = useToast();
  const [users, setUsers] = useState([]);
  const [filters, setFilters] = useState(INITIAL_FILTERS);
  const [searchInput, setSearchInput] = useState("");
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState({ totalItems: 0, totalPages: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [statusTarget, setStatusTarget] = useState(null);
  const [updating, setUpdating] = useState(false);

  const query = useMemo(
    () => ({ ...filters, page, limit: 20 }),
    [filters, page],
  );

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await getAdminUsers(query);
      setUsers(response?.items || response?.data || []);
      setMeta(response?.meta || { totalItems: 0, totalPages: 0 });
    } catch (requestError) {
      setError(requestError.message || "Không thể tải danh sách người dùng.");
    } finally {
      setLoading(false);
    }
  }, [query]);

  useEffect(() => {
    load();
  }, [load]);

  function updateFilter(name, value) {
    setPage(1);
    setFilters((current) => ({ ...current, [name]: value }));
  }

  function search(event) {
    event.preventDefault();
    updateFilter("keyword", searchInput.trim());
  }

  function resetFilters() {
    setSearchInput("");
    setFilters(INITIAL_FILTERS);
    setPage(1);
  }

  async function changeStatus(reason) {
    if (!statusTarget) return;
    const nextStatus = statusTarget.status === "ACTIVE" ? "BLOCKED" : "ACTIVE";
    setUpdating(true);
    try {
      const updated = await updateAdminUserStatus(
        statusTarget.id,
        nextStatus,
        reason,
      );
      setUsers((current) =>
        current.map((user) => (user.id === updated.id ? updated : user)),
      );
      setSelectedUser((current) =>
        current?.id === updated.id ? updated : current,
      );
      setStatusTarget(null);
      toast.success(
        nextStatus === "BLOCKED"
          ? "Đã khóa tài khoản người dùng."
          : "Đã mở khóa tài khoản người dùng.",
      );
    } catch (requestError) {
      toast.error(requestError.message || "Không thể cập nhật trạng thái tài khoản.");
    } finally {
      setUpdating(false);
    }
  }

  return {
    users,
    filters,
    searchInput,
    page,
    meta,
    loading,
    error,
    selectedUser,
    statusTarget,
    updating,
    setSearchInput,
    setPage,
    updateFilter,
    search,
    resetFilters,
    load,
    setSelectedUser,
    setStatusTarget,
    changeStatus,
  };
}
