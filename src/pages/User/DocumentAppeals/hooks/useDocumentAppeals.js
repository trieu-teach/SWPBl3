import { useCallback, useEffect, useMemo, useState } from "react";
import { getMyAppeals } from "../../../../api/document-appeals.api.js";
import { getDocument } from "../../../../api/documents.api.js";

const EMPTY_META = { page: 1, totalItems: 0, totalPages: 0 };

export default function useDocumentAppeals() {
  const [appeals, setAppeals] = useState([]);
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState(EMPTY_META);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedAppeal, setSelectedAppeal] = useState(null);
  const [document, setDocument] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState("");

  const query = useMemo(
    () => ({ ...(status ? { status } : {}), page, limit: 20 }),
    [page, status],
  );

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await getMyAppeals(query);
      setAppeals(response?.items || response?.data || []);
      setMeta(response?.meta || EMPTY_META);
    } catch (requestError) {
      setError(requestError.message || "Không thể tải lịch sử khiếu nại.");
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
      setDocument(await getDocument(appeal.documentId));
    } catch (requestError) {
      setDetailError(
        requestError.status === 404
          ? "Tài liệu liên quan không còn tồn tại."
          : requestError.message || "Không thể tải thông tin tài liệu.",
      );
    } finally {
      setDetailLoading(false);
    }
  }

  function closeDetail() {
    setSelectedAppeal(null);
    setDocument(null);
    setDetailError("");
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
    setPage,
    changeStatus,
    load,
    openDetail,
    closeDetail,
  };
}
