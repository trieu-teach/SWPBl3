import { useCallback, useEffect, useMemo, useState } from "react";
import {
  addKeywordException,
  approveAdminDocument,
  claimAdminDocument,
  getAdminDocument,
  getAdminDocumentPreview,
  getAdminDocuments,
  getPendingAdminDocuments,
  rejectAdminDocument,
  removeKeywordException,
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
  const [sort, setSort] = useState({ sortBy: "", sortOrder: "" });
  const [meta, setMeta] = useState({ totalItems: 0, totalPages: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [detail, setDetail] = useState(null);
  const [preview, setPreview] = useState(null);
  const [action, setAction] = useState(null);
  const [acting, setActing] = useState(false);
  const [reviewQueueOnly, setReviewQueueOnly] = useState(false);
  const [claimedDocumentId, setClaimedDocumentId] = useState(null);

  const query = useMemo(
    () => ({ ...filters, ...sort, page, limit: 20 }),
    [filters, sort, page],
  );

  const load = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const requestQuery = reviewQueueOnly
        ? {
            keyword: query.keyword,
            aiStatus: query.aiStatus,
            sortBy: query.sortBy,
            sortOrder: query.sortOrder,
            page: query.page,
            limit: query.limit,
          }
        : query;
      const response = reviewQueueOnly
        ? await getPendingAdminDocuments(requestQuery)
        : await getAdminDocuments(requestQuery);
      setDocuments(response?.items || response?.data || []);
      setMeta(response?.meta || { totalItems: 0, totalPages: 0 });
    } catch (requestError) {
      setError(requestError.message || "Không thể tải danh sách tài liệu.");
    } finally {
      setLoading(false);
    }
  }, [query, reviewQueueOnly]);

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

  function toggleReviewQueue() {
    setSearchInput("");
    setFilters(INITIAL_FILTERS);
    setPage(1);
    setReviewQueueOnly((current) => !current);
  }

  function toggleSort(field, firstOrder) {
    setPage(1);
    setSort((current) => {
      if (current.sortBy !== field) {
        return { sortBy: field, sortOrder: firstOrder };
      }
      if (current.sortOrder === firstOrder) {
        return {
          sortBy: field,
          sortOrder: firstOrder === "asc" ? "desc" : "asc",
        };
      }
      return { sortBy: "", sortOrder: "" };
    });
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

  async function refreshDetail(documentId) {
    const refreshed = await getAdminDocument(documentId);
    setDetail(refreshed);
    return refreshed;
  }

  function handleReviewConflict(requestError) {
    if (requestError.status !== 409) return false;

    setAction(null);
    setDetail(null);
    setClaimedDocumentId(null);
    void load();
    toast.warning(
      "Tài liệu đang được người khác xem hoặc đã ra khỏi hàng chờ.",
    );
    return true;
  }

  async function claimDetail() {
    if (!detail) return;
    setActing(true);

    try {
      const claimed = await claimAdminDocument(detail.id);
      setClaimedDocumentId(detail.id);
      setDetail((current) =>
        current?.id === detail.id ? { ...current, ...claimed } : current,
      );
      toast.success("Đã nhận tài liệu để kiểm duyệt.");
      await load();
    } catch (requestError) {
      if (!handleReviewConflict(requestError)) {
        toast.error(requestError.message || "Không thể nhận tài liệu để duyệt.");
      }
    } finally {
      setActing(false);
    }
  }

  async function createKeywordException(keywordId, reason = "") {
    if (!detail) return;
    setActing(true);

    try {
      await addKeywordException(detail.id, keywordId, reason);
      await refreshDetail(detail.id);
      toast.success("Đã bỏ qua từ khóa cho tài liệu này và quét lại nội dung.");
    } catch (requestError) {
      if (!handleReviewConflict(requestError)) {
        toast.error(requestError.message || "Không thể thêm ngoại lệ từ khóa.");
      }
    } finally {
      setActing(false);
    }
  }

  async function deleteKeywordException(keywordId) {
    if (!detail) return;
    setActing(true);

    try {
      await removeKeywordException(detail.id, keywordId);
      await refreshDetail(detail.id);
      toast.success("Đã xóa ngoại lệ từ khóa và quét lại nội dung.");
    } catch (requestError) {
      if (!handleReviewConflict(requestError)) {
        toast.error(requestError.message || "Không thể xóa ngoại lệ từ khóa.");
      }
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
      setClaimedDocumentId(null);
      await load();
    } catch (requestError) {
      if (handleReviewConflict(requestError)) return;
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
    sort,
    meta,
    loading,
    error,
    detail,
    preview,
    action,
    acting,
    reviewQueueOnly,
    claimedDocumentId,
    setSearchInput,
    setPage,
    updateFilter,
    search,
    resetFilters,
    toggleReviewQueue,
    toggleSort,
    load,
    openDetail,
    claimDetail,
    createKeywordException,
    deleteKeywordException,
    openPreview,
    setDetail,
    setPreview,
    setAction,
    runAction,
  };
}
