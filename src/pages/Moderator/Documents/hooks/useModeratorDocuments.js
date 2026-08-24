import { useCallback, useEffect, useMemo, useState } from "react";
import {
  approveAdminDocument,
  claimAdminDocument,
  getAdminDocument,
  getAdminDocumentPreview,
  getPendingAdminDocuments,
  rejectAdminDocument,
} from "../../../../api/admin-documents.api.js";
import { useToast } from "../../../../components/Toast/ToastProvider.jsx";

const EMPTY_META = { page: 1, totalItems: 0, totalPages: 0 };
const OFFICE_EXTENSIONS = ["doc", "docx", "xls", "xlsx", "ppt", "pptx"];

export default function useModeratorDocuments() {
  const toast = useToast();
  const [documents, setDocuments] = useState([]);
  const [searchInput, setSearchInput] = useState("");
  const [keyword, setKeyword] = useState("");
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState(EMPTY_META);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [detail, setDetail] = useState(null);
  const [preview, setPreview] = useState(null);
  const [action, setAction] = useState(null);
  const [acting, setActing] = useState(false);
  const [claimedDocumentId, setClaimedDocumentId] = useState(null);

  const query = useMemo(
    () => ({ keyword, page, limit: 20 }),
    [keyword, page],
  );

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await getPendingAdminDocuments(query);
      setDocuments(response?.items || response?.data || []);
      setMeta(response?.meta || EMPTY_META);
    } catch (requestError) {
      setError(requestError.message || "Không thể tải hàng chờ kiểm duyệt.");
    } finally {
      setLoading(false);
    }
  }, [query]);

  useEffect(() => {
    load();
  }, [load]);

  function search(event) {
    event.preventDefault();
    setPage(1);
    setKeyword(searchInput.trim());
  }

  function resetSearch() {
    setSearchInput("");
    setKeyword("");
    setPage(1);
  }

  function handleConflict(requestError) {
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
      if (!handleConflict(requestError)) {
        toast.error(requestError.message || "Không thể nhận tài liệu.");
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
      if (!url) throw new Error("Backend không trả về đường dẫn xem trước.");
      const extension = document.fileName?.split(".").pop()?.toLowerCase();
      setPreview({
        title: document.title,
        fileName: document.fileName,
        url,
        contentType: response?.contentType || document.fileType,
        fallbackToOfficeViewer:
          response?.fallbackToOfficeViewer ??
          OFFICE_EXTENSIONS.includes(extension),
      });
    } catch (requestError) {
      toast.error(requestError.message || "Không thể xem trước tài liệu.");
    } finally {
      setActing(false);
    }
  }

  async function confirmDecision(reason) {
    if (!action) return;
    setActing(true);
    try {
      if (action.type === "approve") {
        await approveAdminDocument(action.document.id);
      } else {
        await rejectAdminDocument(action.document.id, reason.trim());
      }
      toast.success(
        action.type === "approve"
          ? "Đã duyệt tài liệu."
          : "Đã từ chối tài liệu.",
      );
      setAction(null);
      setDetail(null);
      setClaimedDocumentId(null);
      await load();
    } catch (requestError) {
      if (!handleConflict(requestError)) {
        toast.error(requestError.message || "Không thể kiểm duyệt tài liệu.");
      }
    } finally {
      setActing(false);
    }
  }

  return {
    documents,
    searchInput,
    page,
    meta,
    loading,
    error,
    detail,
    preview,
    action,
    acting,
    claimedDocumentId,
    setSearchInput,
    setPage,
    setDetail,
    setPreview,
    setAction,
    search,
    resetSearch,
    load,
    openDetail,
    claimDetail,
    openPreview,
    confirmDecision,
  };
}
