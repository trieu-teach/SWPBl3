import { useCallback, useEffect, useRef, useState } from "react";
import {
  getTopRatedDocuments,
  rateChatMessage,
  rateDocument,
} from "../api/rating.api.js";

const TOP_RATED_INVALIDATE_EVENT = "top-rated-documents:invalidate";

/**
 * Trigger query cache invalidation for top-rated documents
 */
export function invalidateTopRatedDocuments() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(TOP_RATED_INVALIDATE_EVENT));
  }
}

/**
 * Hook đánh giá tin nhắn AI Chat kèm Optimistic UI
 */
export function useRateChatMessage() {
  const [ratings, setRatings] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const rateMessage = useCallback(
    async ({ messageId, isHelpful }) => {
      if (!messageId) {
        throw new Error("messageId is required");
      }

      // Optimistic UI update: Lưu trạng thái trước đó để rollback nếu cần
      let previousRating;
      setRatings((prev) => {
        previousRating = prev[messageId];
        return {
          ...prev,
          [messageId]: {
            isHelpful,
            status: "saving",
          },
        };
      });

      setLoading(true);
      setError(null);

      try {
        const response = await rateChatMessage(messageId, isHelpful);
        setRatings((prev) => ({
          ...prev,
          [messageId]: {
            isHelpful,
            status: "saved",
            id: response?.id,
          },
        }));
        return response;
      } catch (err) {
        // Rollback optimistic update
        setRatings((prev) => {
          const next = { ...prev };
          if (previousRating !== undefined) {
            next[messageId] = previousRating;
          } else {
            delete next[messageId];
          }
          return next;
        });
        const errorMessage =
          err?.message || "Không thể gửi đánh giá tin nhắn. Vui lòng thử lại.";
        setError(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const getMessageRating = useCallback(
    (messageId) => {
      return ratings[messageId]?.isHelpful ?? null;
    },
    [ratings],
  );

  return {
    rateMessage,
    mutateAsync: rateMessage,
    ratings,
    getMessageRating,
    loading,
    error,
  };
}

/**
 * Hook đánh giá tài liệu công khai (POST /api/documents/:id/rate)
 * Xử lý lỗi 404 thân thiện và tự động invalidate cache top-rated-documents
 */
export function useRateDocument() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [documentRatings, setDocumentRatings] = useState({});

  const rate = useCallback(
    async ({ documentId, isHelpful }) => {
      if (!documentId) {
        throw new Error("documentId is required");
      }

      // Optimistic update
      let previousRating;
      setDocumentRatings((prev) => {
        previousRating = prev[documentId];
        return {
          ...prev,
          [documentId]: isHelpful,
        };
      });

      setLoading(true);
      setError(null);

      try {
        const result = await rateDocument(documentId, isHelpful);
        // Tự động invalidate danh sách top-rated-documents
        invalidateTopRatedDocuments();
        return result;
      } catch (err) {
        // Rollback optimistic state
        setDocumentRatings((prev) => {
          const next = { ...prev };
          if (previousRating !== undefined) {
            next[documentId] = previousRating;
          } else {
            delete next[documentId];
          }
          return next;
        });

        // 404 Not Found error handling
        let friendlyMessage = "Không thể gửi đánh giá tài liệu.";
        if (
          err?.status === 404 ||
          err?.response?.status === 404 ||
          err?.code === "NOT_FOUND" ||
          err?.message?.includes("404")
        ) {
          friendlyMessage =
            "Tài liệu này không tồn tại, đã bị xóa hoặc đang ở chế độ riêng tư.";
        } else if (err?.message) {
          friendlyMessage = err.message;
        }

        setError(friendlyMessage);
        const customError = new Error(friendlyMessage);
        customError.status = err?.status || err?.response?.status || 404;
        throw customError;
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  return {
    rateDocument: rate,
    mutateAsync: rate,
    loading,
    error,
    documentRatings,
    getDocumentRating: (docId) => documentRatings[docId] ?? null,
  };
}

/**
 * Hook lấy danh sách Top Rated Documents kèm pagination & sorting
 * Tự động đồng bộ và refetch khi có sự kiện invalidate
 */
export function useTopRatedDocuments({
  page: initialPage = 1,
  limit: initialLimit = 20,
  sortBy: initialSortBy = "rating",
} = {}) {
  const [page, setPage] = useState(initialPage);
  const [limit, setLimit] = useState(initialLimit);
  const [sortBy, setSortBy] = useState(initialSortBy);
  const [items, setItems] = useState([]);
  const [meta, setMeta] = useState({
    page: initialPage,
    limit: initialLimit,
    totalItems: 0,
    totalPages: 0,
    hasNext: false,
    hasPrevious: false,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const mountedRef = useRef(true);

  const fetchData = useCallback(
    async (currentPage = page, currentLimit = limit, currentSortBy = sortBy) => {
      setLoading(true);
      setError(null);
      try {
        const response = await getTopRatedDocuments({
          page: currentPage,
          limit: currentLimit,
          sortBy: currentSortBy,
        });

        if (!mountedRef.current) return;

        const fetchedItems =
          response?.items || response?.data?.items || (Array.isArray(response) ? response : []);
        const fetchedMeta = response?.meta ||
          response?.data?.meta || {
            page: currentPage,
            limit: currentLimit,
            totalItems: fetchedItems.length,
            totalPages: Math.ceil(fetchedItems.length / currentLimit) || 1,
            hasNext: false,
            hasPrevious: currentPage > 1,
          };

        setItems(fetchedItems);
        setMeta(fetchedMeta);
      } catch (err) {
        if (!mountedRef.current) return;
        setError(err?.message || "Không thể tải danh sách tài liệu nổi bật.");
      } finally {
        if (mountedRef.current) {
          setLoading(false);
        }
      }
    },
    [page, limit, sortBy],
  );

  useEffect(() => {
    mountedRef.current = true;
    fetchData(page, limit, sortBy);

    const handleInvalidate = () => {
      fetchData(page, limit, sortBy);
    };

    if (typeof window !== "undefined") {
      window.addEventListener(TOP_RATED_INVALIDATE_EVENT, handleInvalidate);
    }

    return () => {
      mountedRef.current = false;
      if (typeof window !== "undefined") {
        window.removeEventListener(TOP_RATED_INVALIDATE_EVENT, handleInvalidate);
      }
    };
  }, [fetchData, page, limit, sortBy]);

  const changePage = useCallback((nextPage) => {
    setPage(nextPage);
  }, []);

  const changeSortBy = useCallback((nextSortBy) => {
    setSortBy(nextSortBy);
    setPage(1);
  }, []);

  const nextPage = useCallback(() => {
    if (meta.hasNext) {
      setPage((prev) => prev + 1);
    }
  }, [meta.hasNext]);

  const prevPage = useCallback(() => {
    if (meta.hasPrevious && page > 1) {
      setPage((prev) => prev - 1);
    }
  }, [meta.hasPrevious, page]);

  return {
    items,
    meta,
    loading,
    error,
    page,
    limit,
    sortBy,
    setPage: changePage,
    setLimit,
    setSortBy: changeSortBy,
    nextPage,
    prevPage,
    reload: () => fetchData(page, limit, sortBy),
  };
}
