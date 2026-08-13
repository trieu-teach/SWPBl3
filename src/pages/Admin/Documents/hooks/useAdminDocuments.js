import { useCallback, useEffect, useMemo, useState } from "react";
import {
  approveAdminDocument,
  getAdminDocument,
  getAdminDocumentPreview,
  getAdminDocuments,
  rejectAdminDocument,
  setAdminDocumentHidden,
} from "../../../../api/admin-documents.api.js";
import { useToast } from "../../../../components/Toast/ToastProvider.jsx";

const INITIAL_FILTERS = {
  keyword: "",
  visibility: "",
  status: "",
  aiStatus: "",
  moderationStatus: "",
};

const OFFICE_EXTENSIONS = ["doc", "docx", "xls", "xlsx", "ppt", "pptx"];

export default function useAdminDocuments() {
  const toast = useToast();
  const [documents, setDocuments] = useState([]);
  const [filters, setFilters] = useState(INITIAL_FILTERS);
  const [searchInput, setSearchInput] = useState("");
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState({ totalItems: 0, totalPages: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [detail, setDetail] = useState(null);
  const [preview, setPreview] = useState(null);
  const [action, setAction] = useState(null);
  const [acting, setActing] = useState(false);

  const query = useMemo(
    () => ({ ...filters, page, limit: 20 }),
    [filters, page],
  );

  const load = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await getAdminDocuments(query);
      setDocuments(response?.items || response?.data || []);
      setMeta(response?.meta || { totalItems: 0, totalPages: 0 });
    } catch (requestError) {
      setError(requestError.message || "Không thể tải danh sách tài liệu.");
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

  async function openDetail(document) {
    setActing(true);
    try {
      setDetail(await getAdminDocument(document.id));
    } catch (requestError) {
      toast.error(requestError.message || "Không thể tải chi tiết tài liệu.");
    } finally {
      setActing(false);
    }
  }

  async function openPreview(document) {
    setActing(true);
    try {
      const response = await getAdminDocumentPreview(document.id);
      const url = response?.previewUrl || response?.url;
      const extension = document.fileName?.split(".").pop()?.toLowerCase();

      if (!url) {
        throw new Error("Backend không trả về đường dẫn xem trước.");
      }

      setPreview({
        title: document.title,
        fileName: document.fileName,
        url,
        contentType: response?.contentType || document.mimeType,
        fallbackToOfficeViewer:
          response?.fallbackToOfficeViewer ??
          OFFICE_EXTENSIONS.includes(extension),
      });
    } catch (requestError) {
      toast.error(requestError.message || "Không thể xem tài liệu.");
    } finally {
      setActing(false);
    }
  }

  async function runAction(reason) {
    if (!action) return;
    setActing(true);

    try {
      if (action.type === "approve")
        await approveAdminDocument(action.document.id);
      if (action.type === "reject")
        await rejectAdminDocument(action.document.id, reason.trim());
      if (action.type === "hide")
        await setAdminDocumentHidden(action.document.id, true, reason);
      if (action.type === "unhide")
        await setAdminDocumentHidden(action.document.id, false, reason);

      toast.success(
        {
          approve: "Đã duyệt tài liệu.",
          reject: "Đã từ chối tài liệu.",
          hide: "Đã ẩn tài liệu.",
          unhide: "Đã khôi phục tài liệu.",
        }[action.type],
      );

      setAction(null);
      setDetail(null);
      await load();
    } catch (requestError) {
      toast.error(requestError.message || "Không thể cập nhật tài liệu.");
    } finally {
      setActing(false);
    }
  }

  return {
    documents,
    filters,
    searchInput,
    page,
    meta,
    loading,
    error,
    detail,
    preview,
    action,
    acting,
    setSearchInput,
    setPage,
    updateFilter,
    search,
    resetFilters,
    load,
    openDetail,
    openPreview,
    setDetail,
    setPreview,
    setAction,
    runAction,
  };
}
