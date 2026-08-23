import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { getAdminDocument } from "../../../../api/admin-documents.api.js";
import {
  decideAdminDocumentAppeal,
  getAdminDocumentAppeals,
} from "../../../../api/document-appeals.api.js";
import { useToast } from "../../../../components/Toast/ToastProvider.jsx";
import { canDecideDocumentAppeal } from "../../../../lib/moderation.js";

const EMPTY_META = {
  page: 1,
  limit: 20,
  totalItems: 0,
  totalPages: 0,
};

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
  const [acting, setActing] = useState(false);
  const listGeneration = useRef(0);
  const detailGeneration = useRef(0);
  const selectedDocumentId = useRef("");

  const query = useMemo(() => ({ status, page, limit: 20 }), [page, status]);

  const loadAppeals = useCallback(async () => {
    const generation = ++listGeneration.current;
    setLoading(true);
    setError("");
    try {
      const response = await getAdminDocumentAppeals(query);
      if (generation !== listGeneration.current) return;
      setAppeals(response?.items || response?.data || []);
      setMeta(response?.meta || EMPTY_META);
    } catch (requestError) {
      if (generation !== listGeneration.current) return;
      setError(requestError.message || "Không thể tải hàng đợi khiếu nại.");
    } finally {
      if (generation === listGeneration.current) setLoading(false);
    }
  }, [query]);

  useEffect(() => {
    loadAppeals();
  }, [loadAppeals]);

  async function loadSelectedDocument(appeal) {
    const documentId = appeal?.documentId;
    const generation = ++detailGeneration.current;
    selectedDocumentId.current = documentId || "";
    setDocument(null);
    setDetailError("");
    if (!documentId) {
      setDetailError("Khiếu nại không có mã tài liệu hợp lệ.");
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

  function openAppeal(appeal) {
    setSelectedAppeal(appeal);
    loadSelectedDocument(appeal);
  }

  function closeAppeal() {
    if (acting) return;
    detailGeneration.current += 1;
    selectedDocumentId.current = "";
    setSelectedAppeal(null);
    setDocument(null);
    setDetailError("");
    setDetailLoading(false);
  }

  function updateStatus(nextStatus) {
    setStatus(nextStatus);
    setPage(1);
    closeAppeal();
  }

  async function decideAppeal(nextStatus, reviewNote) {
    if (!canDecideDocumentAppeal(selectedAppeal)) {
      toast.warning("Khiếu nại này không còn ở trạng thái chờ xử lý.");
      closeAppeal();
      await loadAppeals();
      return;
    }

    setActing(true);
    try {
      await decideAdminDocumentAppeal(
        selectedAppeal.id,
        nextStatus,
        reviewNote,
      );
      toast.success(
        nextStatus === "APPROVED"
          ? "Đã chấp nhận khiếu nại và khôi phục tài liệu."
          : "Đã từ chối khiếu nại; tài liệu tiếp tục bị ẩn.",
      );
      detailGeneration.current += 1;
      selectedDocumentId.current = "";
      setSelectedAppeal(null);
      setDocument(null);
      setDetailLoading(false);
      await loadAppeals();
    } catch (requestError) {
      if ([404, 409].includes(requestError.status)) {
        toast.warning(
          "Khiếu nại đã được người khác xử lý hoặc không còn trong hàng chờ.",
        );
        detailGeneration.current += 1;
        selectedDocumentId.current = "";
        setSelectedAppeal(null);
        setDocument(null);
        setDetailLoading(false);
        await loadAppeals();
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
    acting,
    setPage,
    updateStatus,
    loadAppeals,
    openAppeal,
    closeAppeal,
    retryDetail: () => loadSelectedDocument(selectedAppeal),
    decideAppeal,
  };
}
