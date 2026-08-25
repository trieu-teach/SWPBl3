import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  getAdminDocument,
  getAdminDocumentPreview,
} from "../../../../api/admin-documents.api.js";
import {
  getModerationReports,
  resolveModerationReport,
} from "../../../../api/moderation.api.js";
import { useToast } from "../../../../components/Toast/ToastProvider.jsx";

const EMPTY_META = {
  page: 1,
  limit: 20,
  totalItems: 0,
  totalPages: 0,
  hasNext: false,
  hasPrevious: false,
};

const OFFICE_EXTENSIONS = ["doc", "docx", "xls", "xlsx", "ppt", "pptx"];

const REPORT_RESOLUTIONS = {
  dismiss: {
    status: "DISMISSED",
    action: "NONE",
    successMessage: "Đã kết luận tài liệu không vi phạm.",
  },
  hide: {
    status: "RESOLVED",
    action: "HIDE_DOCUMENT",
    successMessage: "Đã đóng báo cáo và ẩn tạm thời tài liệu.",
  },
  delete: {
    status: "RESOLVED",
    action: "DELETE_DOCUMENT",
    successMessage: "Đã đóng báo cáo và xóa tài liệu.",
  },
};

export default function useModerationReports() {
  const toast = useToast();
  const [reports, setReports] = useState([]);
  const [status, setStatus] = useState("PENDING");
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState(EMPTY_META);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedReport, setSelectedReport] = useState(null);
  const [document, setDocument] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState("");
  const [preview, setPreview] = useState(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [action, setAction] = useState(null);
  const [acting, setActing] = useState(false);
  const listGeneration = useRef(0);
  const detailGeneration = useRef(0);
  const previewGeneration = useRef(0);
  const selectedDocumentId = useRef("");

  const query = useMemo(() => ({ status, page, limit: 20 }), [page, status]);

  const loadReports = useCallback(async () => {
    const generation = ++listGeneration.current;
    setLoading(true);
    setError("");
    try {
      const response = await getModerationReports(query);
      if (generation !== listGeneration.current) return;
      setReports(response?.items || response?.data || []);
      setMeta(response?.meta || EMPTY_META);
    } catch (requestError) {
      if (generation !== listGeneration.current) return;
      setError(requestError.message || "Không thể tải hàng đợi báo cáo.");
    } finally {
      if (generation === listGeneration.current) setLoading(false);
    }
  }, [query]);

  useEffect(() => {
    loadReports();
  }, [loadReports]);

  async function loadSelectedDocument(report) {
    const generation = ++detailGeneration.current;
    const documentId = report?.documentId || report?.document?.id;
    selectedDocumentId.current = documentId || "";
    setDocument(null);
    setDetailError("");
    setDetailLoading(false);
    if (!documentId) {
      setDetailError("Báo cáo không có mã tài liệu hợp lệ.");
      return;
    }

    setDetailLoading(true);
    try {
      const response = await getAdminDocument(documentId);
      if (
        generation !== detailGeneration.current ||
        selectedDocumentId.current !== documentId
      ) {
        return;
      }
      setDocument(response);
    } catch (requestError) {
      if (generation !== detailGeneration.current) return;
      setDetailError(requestError.message || "Không thể tải chi tiết tài liệu.");
    } finally {
      if (generation === detailGeneration.current) setDetailLoading(false);
    }
  }

  function openReport(report) {
    previewGeneration.current += 1;
    setPreview(null);
    setPreviewLoading(false);
    setSelectedReport(report);
    loadSelectedDocument(report);
  }

  function closeReport() {
    if (acting) return;
    detailGeneration.current += 1;
    previewGeneration.current += 1;
    selectedDocumentId.current = "";
    setSelectedReport(null);
    setDocument(null);
    setDetailError("");
    setDetailLoading(false);
    setPreview(null);
    setPreviewLoading(false);
  }

  async function openPreview() {
    const documentId = selectedDocumentId.current;
    if (!documentId || !document) return;
    const generation = ++previewGeneration.current;
    setPreviewLoading(true);
    try {
      const response = await getAdminDocumentPreview(documentId);
      const url = response?.previewUrl || response?.url;
      if (!url) throw new Error("Backend không trả về đường dẫn xem trước.");
      if (
        generation !== previewGeneration.current ||
        selectedDocumentId.current !== documentId
      ) {
        return;
      }
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
      if (generation === previewGeneration.current) {
        toast.error(requestError.message || "Không thể xem trước tài liệu.");
      }
    } finally {
      if (generation === previewGeneration.current) setPreviewLoading(false);
    }
  }

  function updateStatus(nextStatus) {
    setStatus(nextStatus);
    setPage(1);
    closeReport();
  }

  async function confirmAction() {
    if (!action || !selectedReport) return;
    const resolution = REPORT_RESOLUTIONS[action.type];
    if (!resolution) return;

    setActing(true);
    try {
      await resolveModerationReport(
        selectedReport.id,
        resolution.status,
        resolution.action,
      );
      toast.success(resolution.successMessage);
      setAction(null);
      detailGeneration.current += 1;
      selectedDocumentId.current = "";
      setSelectedReport(null);
      setDocument(null);
      setDetailLoading(false);
      setPreview(null);
      setPreviewLoading(false);
      await loadReports();
    } catch (requestError) {
      if (requestError.status === 409) {
        toast.error("Báo cáo đã được người khác xử lý hoặc không còn hợp lệ.");
        setAction(null);
        detailGeneration.current += 1;
        selectedDocumentId.current = "";
        setSelectedReport(null);
        setDocument(null);
        setDetailLoading(false);
        setPreview(null);
        setPreviewLoading(false);
        await loadReports();
      } else {
        toast.error(
          requestError.message || "Không thể hoàn tất thao tác kiểm duyệt.",
        );
      }
    } finally {
      setActing(false);
    }
  }

  return {
    reports,
    status,
    page,
    meta,
    loading,
    error,
    selectedReport,
    document,
    detailLoading,
    detailError,
    preview,
    previewLoading,
    action,
    acting,
    setPage,
    setAction,
    setPreview,
    updateStatus,
    loadReports,
    openReport,
    closeReport,
    retryDetail: () => loadSelectedDocument(selectedReport),
    openPreview,
    confirmAction,
  };
}
