import { useCallback, useEffect, useMemo, useState } from "react";
import {
  getAdminUserDetail,
  getAdminUsers,
  updateAdminUserRole,
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
  const [sort, setSort] = useState({ sortBy: "", sortOrder: "" });
  const [meta, setMeta] = useState({ totalItems: 0, totalPages: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState("");
  const [statusTarget, setStatusTarget] = useState(null);
  const [roleTarget, setRoleTarget] = useState(null);
  const [updating, setUpdating] = useState(false);

  const query = useMemo(
    () => ({ ...filters, ...sort, page, limit: 20 }),
    [filters, sort, page],
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

  function toggleSort() {
    setPage(1);
    setSort((current) => {
      if (!current.sortBy) return { sortBy: "fullName", sortOrder: "asc" };
      if (current.sortOrder === "asc") {
        return { sortBy: "fullName", sortOrder: "desc" };
      }
      return { sortBy: "", sortOrder: "" };
    });
  }

  async function openDetail(user) {
    setSelectedUser(user);
    setDetailLoading(true);
    setDetailError("");
    try {
      const detail = await getAdminUserDetail(user.id);
      setSelectedUser((current) => ({ ...current, ...detail }));
    } catch (requestError) {
      setDetailError(
        requestError.message || "Không thể tải chi tiết người dùng.",
      );
    } finally {
      setDetailLoading(false);
    }
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
      toast.error(
        requestError.message || "Không thể cập nhật trạng thái tài khoản.",
      );
    } finally {
      setUpdating(false);
    }
  }

  async function changeRole(role) {
    if (!roleTarget || roleTarget.role === role) return;

    setUpdating(true);
    try {
      const updated = await updateAdminUserRole(roleTarget.id, role);

      setUsers((current) =>
        current.map((user) => (user.id === updated.id ? updated : user)),
      );
      setSelectedUser((current) =>
        current?.id === updated.id ? updated : current,
      );
      setRoleTarget(null);
      toast.success(
        role === "MODERATOR"
          ? "Đã cấp vai trò kiểm duyệt viên."
          : "Đã chuyển về vai trò người dùng.",
      );
    } catch (requestError) {
      toast.error(
        requestError.message || "Không thể cập nhật vai trò người dùng.",
      );
    } finally {
      setUpdating(false);
    }
  }

  return {
    users,
    filters,
    searchInput,
    page,
    sort,
    meta,
    loading,
    error,
    selectedUser,
    detailLoading,
    detailError,
    statusTarget,
    roleTarget,
    updating,
    setSearchInput,
    setPage,
    updateFilter,
    search,
    resetFilters,
    toggleSort,
    openDetail,
    load,
    setSelectedUser,
    setStatusTarget,
    setRoleTarget,
    changeStatus,
    changeRole,
  };
}
