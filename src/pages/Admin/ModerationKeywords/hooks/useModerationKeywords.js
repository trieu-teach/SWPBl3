import { useCallback, useEffect, useMemo, useState } from "react";
import {
  createAdminModerationKeyword,
  deleteAdminModerationKeyword,
  getAdminModerationKeywords,
  updateAdminModerationKeyword,
} from "../../../../api/admin-moderation-keywords.api.js";
import { useToast } from "../../../../components/Toast/ToastProvider.jsx";

export default function useModerationKeywords() {
  const toast = useToast();
  const [keywords, setKeywords] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editingKeyword, setEditingKeyword] = useState(null);
  const [deletingKeyword, setDeletingKeyword] = useState(null);

  const loadKeywords = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await getAdminModerationKeywords({
        isActive: statusFilter,
      });
      setKeywords(response?.items || response?.data || response || []);
    } catch (requestError) {
      setError(
        requestError.message || "Không thể tải danh sách từ khóa kiểm duyệt.",
      );
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    loadKeywords();
  }, [loadKeywords]);

  const filteredKeywords = useMemo(() => {
    const normalizedSearch = search.trim().toLocaleLowerCase("vi");
    if (!normalizedSearch) return keywords;

    return keywords.filter((item) =>
      [item.keyword, item.domain, item.severity]
        .filter(Boolean)
        .some((value) =>
          String(value).toLocaleLowerCase("vi").includes(normalizedSearch),
        ),
    );
  }, [keywords, search]);

  function openCreate() {
    setEditingKeyword(null);
    setFormOpen(true);
  }

  function openEdit(keyword) {
    setEditingKeyword(keyword);
    setFormOpen(true);
  }

  function closeForm() {
    if (saving) return;
    setFormOpen(false);
    setEditingKeyword(null);
  }

  async function saveKeyword(payload) {
    setSaving(true);

    try {
      if (editingKeyword) {
        await updateAdminModerationKeyword(editingKeyword.id, payload);
        toast.success("Đã cập nhật từ khóa kiểm duyệt.");
      } else {
        await createAdminModerationKeyword(payload);
        toast.success("Đã tạo từ khóa kiểm duyệt.");
      }
      setFormOpen(false);
      setEditingKeyword(null);
      await loadKeywords();
    } catch (requestError) {
      toast.error(requestError.message || "Không thể lưu từ khóa kiểm duyệt.");
    } finally {
      setSaving(false);
    }
  }

  async function toggleKeyword(keyword) {
    setSaving(true);

    try {
      await updateAdminModerationKeyword(keyword.id, {
        isActive: !keyword.isActive,
      });
      toast.success(
        keyword.isActive
          ? "Đã tạm ngừng từ khóa kiểm duyệt."
          : "Đã kích hoạt từ khóa kiểm duyệt.",
      );
      await loadKeywords();
    } catch (requestError) {
      toast.error(
        requestError.message || "Không thể thay đổi trạng thái từ khóa.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function deleteKeyword() {
    if (!deletingKeyword) return;
    setSaving(true);

    try {
      await deleteAdminModerationKeyword(deletingKeyword.id);
      toast.success("Đã xóa từ khóa kiểm duyệt.");
      setDeletingKeyword(null);
      await loadKeywords();
    } catch (requestError) {
      toast.error(requestError.message || "Không thể xóa từ khóa kiểm duyệt.");
    } finally {
      setSaving(false);
    }
  }

  return {
    keywords: filteredKeywords,
    totalKeywords: keywords.length,
    search,
    statusFilter,
    loading,
    saving,
    error,
    formOpen,
    editingKeyword,
    deletingKeyword,
    setSearch,
    setStatusFilter,
    setDeletingKeyword,
    loadKeywords,
    openCreate,
    openEdit,
    closeForm,
    saveKeyword,
    toggleKeyword,
    deleteKeyword,
  };
}
