import { useCallback, useEffect, useMemo, useState } from "react";
import {
  decideModerationAppeal,
  getModerationAppeals,
} from "../../../../api/document-appeals.api.js";
import {
  getAdminDocument,
  getAdminDocumentPreview,
} from "../../../../api/admin-documents.api.js";
import { useToast } from "../../../../components/Toast/ToastProvider.jsx";

const EMPTY_META = { page: 1, totalItems: 0, totalPages: 0 };
const OFFICE_EXTENSIONS = ["doc", "docx", "xls", "xlsx", "ppt", "pptx"];

export default function useModeratorAppeals() {
  const toast = useToast();
  const [appeals, setAppeals] = useState([]);
  const [status, setStatus] = useState("PENDING");
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState(EMPTY_META);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedAppeal, setSelectedAppeal] = useState(null);
  const [document, setDocument] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState("");
  const [decision, setDecision] = useState(null);
  const [acting, setActing] = useState(false);
  const [preview, setPreview] = useState(null);

  const query = useMemo(() => ({ status, page, limit: 20 }), [status, page]);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await getModerationAppeals(query);
      setAppeals(response?.items || response?.data || []);
      setMeta(response?.meta || EMPTY_META);
    } catch (requestError) {
      setError(requestError.message || "Không thể tải danh sách khiếu nại.");
    } finally {
      setLoading(false);
    }
  }, [query]);

  useEffect(() => {
    load();
  }, [load]);

  function changeStatus(nextStatus) {
    setStatus(nextStatus);
    setPage(1);
    closeDetail();
  }

  async function openDetail(appeal) {
    setSelectedAppeal(appeal);
    setDocument(null);
    setDetailError("");
    setDetailLoading(true);
    try {
      setDocument(await getAdminDocument(appeal.documentId));
    } catch (requestError) {
      setDetailError(
        requestError.message || "Không thể tải tài liệu của khiếu nại.",
      );
    } finally {
      setDetailLoading(false);
    }
  }

  function closeDetail() {
    if (acting) return;
    setSelectedAppeal(null);
    setDocument(null);
    setDetailError("");
    setDecision(null);
  }

  async function openPreview() {
    if (!document) return;
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

  async function confirmDecision(reviewNote) {
    if (!selectedAppeal || !decision) return;
    setActing(true);
    try {
      await decideModerationAppeal(
        selectedAppeal.id,
        decision,
        reviewNote,
      );
      toast.success(
        decision === "APPROVED"
          ? "Đã chấp nhận khiếu nại."
          : "Đã từ chối khiếu nại.",
      );
      setDecision(null);
      setSelectedAppeal(null);
      setDocument(null);
      await load();
    } catch (requestError) {
      if ([404, 409].includes(requestError.status)) {
        toast.warning(
          "Khiếu nại đã được người khác xử lý hoặc không còn tồn tại.",
        );
        setDecision(null);
        setSelectedAppeal(null);
        setDocument(null);
        await load();
      } else {
        toast.error(requestError.message || "Không thể xử lý khiếu nại.");
      }
    } finally {
      setActing(false);
    }
  }

  return {
    appeals,
    status,
    page,
    meta,
    loading,
    error,
    selectedAppeal,
    document,
    detailLoading,
    detailError,
    decision,
    acting,
    preview,
    setPage,
    setDecision,
    setPreview,
    changeStatus,
    load,
    openDetail,
    closeDetail,
    openPreview,
    confirmDecision,
  };
}
