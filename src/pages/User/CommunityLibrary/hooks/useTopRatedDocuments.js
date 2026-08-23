import { useCallback, useEffect, useState } from "react";
import { getTopRatedDocuments } from "../../../../api/document-ratings.api.js";
import { TOP_RATED_INVALIDATE_EVENT } from "./useDocumentRating.js";

const EMPTY_META = {
  page: 1,
  limit: 6,
  totalItems: 0,
  totalPages: 0,
  hasNext: false,
  hasPrevious: false,
};

export default function useTopRatedDocuments({
  initialPage = 1,
  initialLimit = 6,
  initialSortBy = "rating",
} = {}) {
  const [page, setPage] = useState(initialPage);
  const [limit, setLimit] = useState(initialLimit);
  const [sortBy, setSortBy] = useState(initialSortBy);
  const [items, setItems] = useState([]);
  const [meta, setMeta] = useState({
    ...EMPTY_META,
    page: initialPage,
    limit: initialLimit,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await getTopRatedDocuments({ page, limit, sortBy });
      const nextItems = response?.items || response?.data?.items || [];
      setItems(nextItems);
      setMeta(
        response?.meta ||
          response?.data?.meta || {
            ...EMPTY_META,
            page,
            limit,
            totalItems: nextItems.length,
          },
      );
    } catch (requestError) {
      setError(
        requestError?.message ||
          "Không thể tải danh sách tài liệu được đánh giá cao.",
      );
    } finally {
      setLoading(false);
    }
  }, [limit, page, sortBy]);

  useEffect(() => {
    void load();
    window.addEventListener(TOP_RATED_INVALIDATE_EVENT, load);
    return () => window.removeEventListener(TOP_RATED_INVALIDATE_EVENT, load);
  }, [load]);

  function changeSort(nextSortBy) {
    setSortBy(nextSortBy);
    setPage(1);
  }

  return {
    items,
    meta,
    loading,
    error,
    page,
    limit,
    sortBy,
    setPage,
    setLimit,
    setSortBy: changeSort,
    nextPage: () => meta.hasNext && setPage((current) => current + 1),
    previousPage: () =>
      meta.hasPrevious && setPage((current) => Math.max(1, current - 1)),
    reload: load,
  };
}
