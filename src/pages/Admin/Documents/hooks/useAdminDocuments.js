import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  approveAdminDocument,
  getAdminDocument,
  getAdminDocumentPreview,
  getPendingAdminDocuments,
  rejectAdminDocument,
} from "../../../../api/admin-documents.api.js";
import { useToast } from "../../../../components/Toast/ToastProvider.jsx";
import {
  getModerationRequestError,
  normalizeModerationMeta,
} from "../../../../lib/moderation.js";

const INITIAL_FILTERS = {
  keyword: "",
  aiStatus: "",
  moderationFlag: "",
  ownerId: "",
};

const OFFICE_EXTENSIONS = ["doc", "docx", "xls", "xlsx", "ppt", "pptx"];

export default function useAdminDocuments() {
  const toast = useToast();
  const [documents, setDocuments] = useState([]);
  const [filters, setFilters] = useState(INITIAL_FILTERS);
  const [searchInput, setSearchInput] = useState("");
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState(() => normalizeModerationMeta());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [detail, setDetail] = useState(null);
  const [preview, setPreview] = useState(null);
  const [action, setAction] = useState(null);
  const [acting, setActing] = useState(false);
  const listGeneration = useRef(0);
  const detailGeneration = useRef(0);
  const previewGeneration = useRef(0);

  const query = useMemo(
    () => ({ ...filters, page, limit: 20 }),
    [filters, page],
  );

  const load = useCallback(async () => {
    const generation = ++listGeneration.current;
    setLoading(true);
    setError("");

    try {
      const response = await getPendingAdminDocuments(query);
      if (generation !== listGeneration.current) return;
      const nextDocuments = response?.items || response?.data || [];
      const nextMeta = normalizeModerationMeta(response?.meta, {
        page,
        limit: 20,
      });
      setDocuments(nextDocuments);
      setMeta(nextMeta);
      if (page > 1 && nextDocuments.length === 0 && page > nextMeta.totalPages) {
        setPage(Math.max(1, nextMeta.totalPages));
      }
    } catch (requestError) {
      if (generation !== listGeneration.current) return;
      setError(
        getModerationRequestError(
          requestError,
          "Không thể tải hàng đợi kiểm duyệt.",
        ),
      );
    } finally {
      if (generation === listGeneration.current) setLoading(false);
    }
  }, [page, query]);

  useEffect(() => {
    load();
    return () => {
      listGeneration.current += 1;
    };
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
    const generation = ++detailGeneration.current;
    setActing(true);
    try {
      const response = await getAdminDocument(document.id);
      if (generation !== detailGeneration.current) return;
      setDetail(response);
    } catch (requestError) {
      if (generation !== detailGeneration.current) return;
      toast.error(
        getModerationRequestError(
          requestError,
          "Không thể tải chi tiết tài liệu.",
          "Tài liệu không còn tồn tại.",
        ),
      );
    } finally {
      if (generation === detailGeneration.current) setActing(false);
    }
  }

  async function openPreview(document) {
    const generation = ++previewGeneration.current;
    setActing(true);
    try {
      const response = await getAdminDocumentPreview(document.id);
      if (generation !== previewGeneration.current) return;
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
      if (generation !== previewGeneration.current) return;
      toast.error(
        getModerationRequestError(
          requestError,
          "Không thể xem tài liệu.",
          "Tài liệu không còn tồn tại.",
        ),
      );
    } finally {
      if (generation === previewGeneration.current) setActing(false);
    }
  }

  function closeDetail() {
    detailGeneration.current += 1;
    setDetail(null);
  }

  function closePreview() {
    previewGeneration.current += 1;
    setPreview(null);
  }

  async function runAction(reason) {
    if (!action) return;
    setActing(true);

    try {
      if (action.type === "approve")
        await approveAdminDocument(action.document.id);
      if (action.type === "reject")
        await rejectAdminDocument(action.document.id, reason.trim());
      toast.success(
        {
          approve: "Đã duyệt tài liệu.",
          reject: "Đã từ chối tài liệu.",
        }[action.type],
      );

      setAction(null);
      closeDetail();
      await load();
    } catch (requestError) {
      if (requestError.status === 409) {
        setAction(null);
        closeDetail();
        await load();
        toast.warning(
          "Tài liệu đã được người khác xử lý. Danh sách đã được cập nhật.",
        );
        return;
      }

      toast.error(
        getModerationRequestError(
          requestError,
          "Không thể cập nhật tài liệu.",
          "Tài liệu không còn tồn tại.",
        ),
      );
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
    closeDetail,
    closePreview,
    setAction,
    runAction,
  };
}
