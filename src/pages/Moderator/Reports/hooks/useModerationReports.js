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
import {
  getModerationRequestError,
  normalizeModerationMeta,
} from "../../../../lib/moderation.js";

const ACTION_PAYLOADS = {
  dismiss: { status: "DISMISSED", action: "NONE" },
  resolve: { status: "RESOLVED", action: "NONE" },
  hide: { status: "RESOLVED", action: "HIDE_DOCUMENT" },
  delete: { status: "RESOLVED", action: "DELETE_DOCUMENT" },
};

const OFFICE_EXTENSIONS = ["doc", "docx", "xls", "xlsx", "ppt", "pptx"];

export default function useModerationReports() {
  const toast = useToast();
  const [reports, setReports] = useState([]);
  const [status, setStatus] = useState("PENDING");
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState(() => normalizeModerationMeta());
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
      const nextReports = response?.items || response?.data || [];
      const nextMeta = normalizeModerationMeta(response?.meta, {
        page,
        limit: 20,
      });
      setReports(nextReports);
      setMeta(nextMeta);
      if (page > 1 && nextReports.length === 0 && page > nextMeta.totalPages) {
        setPage(Math.max(1, nextMeta.totalPages));
      }
    } catch (requestError) {
      if (generation !== listGeneration.current) return;
      setError(
        getModerationRequestError(
          requestError,
          "Không thể tải hàng đợi báo cáo.",
        ),
      );
    } finally {
      if (generation === listGeneration.current) setLoading(false);
    }
  }, [page, query]);

  useEffect(() => {
    loadReports();
    return () => {
      listGeneration.current += 1;
    };
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
      setDetailError(
        getModerationRequestError(
          requestError,
          "Không thể tải chi tiết tài liệu.",
          "Tài liệu không còn tồn tại hoặc không còn khả dụng.",
        ),
      );
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

  function clearReportState() {
    detailGeneration.current += 1;
    previewGeneration.current += 1;
    selectedDocumentId.current = "";
    setAction(null);
    setSelectedReport(null);
    setDocument(null);
    setDetailError("");
    setDetailLoading(false);
    setPreview(null);
    setPreviewLoading(false);
  }

  function closeReport() {
    if (acting) return;
    clearReportState();
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
        toast.error(
          getModerationRequestError(
            requestError,
            "Không thể xem trước tài liệu.",
            "Tài liệu không còn tồn tại hoặc không còn khả dụng.",
          ),
        );
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
    const payload = ACTION_PAYLOADS[action.type];
    if (!payload) return;
    setActing(true);
    try {
      const result = await resolveModerationReport(selectedReport.id, payload);
      const successMessages = {
        DISMISSED: "Đã bỏ qua báo cáo.",
        NONE: "Đã xử lý báo cáo mà không thay đổi tài liệu.",
        HIDE_DOCUMENT: `Đã xử lý báo cáo và chuyển tài liệu sang trạng thái ${result.documentStatus || "HIDDEN"}.`,
        DELETE_DOCUMENT: `Đã xử lý báo cáo và đánh dấu tài liệu ${result.documentStatus || "DELETED"}.`,
      };
      toast.success(
        result.status === "DISMISSED"
          ? successMessages.DISMISSED
          : successMessages[result.action] || successMessages.NONE,
      );
      clearReportState();
      await loadReports();
    } catch (requestError) {
      if (requestError.status === 409) {
        clearReportState();
        await loadReports();
        toast.warning(
          "Báo cáo đã được người khác xử lý. Danh sách đã được cập nhật.",
        );
        return;
      }
      toast.error(
        getModerationRequestError(
          requestError,
          "Không thể hoàn tất thao tác kiểm duyệt.",
          "Báo cáo không còn tồn tại.",
        ),
      );
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
