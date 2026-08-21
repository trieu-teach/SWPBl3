import { useCallback, useEffect, useRef, useState } from "react";
import { getDocuments } from "../../../../api/documents.api.js";
import { normalizeDocumentList } from "../../DocumentLibrary/utils/document-formatters.js";

const PAGE_LIMIT = 20;

function mergeUniqueDocuments(current, incoming) {
  const documentsById = new Map();

  [...current, ...incoming].forEach((document) => {
    if (document?.id) documentsById.set(document.id, document);
  });

  return [...documentsById.values()];
}

function responseHasMore(result, targetPage) {
  if (typeof result.meta.hasNext === "boolean") {
    return result.meta.hasNext;
  }

  const totalPages = Number(result.meta.totalPages ?? 0);
  if (totalPages > 0) return targetPage < totalPages;

  return result.items.length === PAGE_LIMIT;
}

function useDocumentSource(source, search) {
  const [documents, setDocuments] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState("");

  const generationRef = useRef(0);
  const requestRef = useRef(null);

  const loadPage = useCallback(
    async (targetPage, replace) => {
      const request = {
        generation: ++generationRef.current,
        page: targetPage,
      };
      requestRef.current = request;

      if (replace) {
        setLoading(true);
        setLoadingMore(false);
        setError("");
      } else {
        setLoadingMore(true);
      }

      const isCurrentRequest = () =>
        requestRef.current === request &&
        generationRef.current === request.generation;

      try {
        const query = {
          search,
          page: targetPage,
          limit: PAGE_LIMIT,
          sortBy: "createdAt",
          sortOrder: "desc",
          ...(source === "owned"
            ? { ownerOnly: true }
            : { savedOnly: true }),
        };
        const result = normalizeDocumentList(await getDocuments(query));
        if (!isCurrentRequest()) return false;

        setDocuments((current) =>
          replace
            ? mergeUniqueDocuments([], result.items)
            : mergeUniqueDocuments(current, result.items),
        );
        setPage(targetPage);
        setHasMore(responseHasMore(result, targetPage));
        setError("");
        return true;
      } catch (requestError) {
        if (!isCurrentRequest()) return false;

        setError(
          requestError?.message || "Không thể tải danh sách tài liệu.",
        );
        return false;
      } finally {
        if (isCurrentRequest()) {
          setLoading(false);
          setLoadingMore(false);
          requestRef.current = null;
        }
      }
    },
    [search, source],
  );

  useEffect(() => {
    generationRef.current += 1;
    requestRef.current = null;
    setDocuments([]);
    setPage(1);
    setHasMore(false);
    setError("");
    void loadPage(1, true);

    return () => {
      generationRef.current += 1;
      requestRef.current = null;
    };
  }, [loadPage]);

  const loadMore = useCallback(() => {
    if (loading || loadingMore || !hasMore || requestRef.current) {
      return Promise.resolve(false);
    }

    return loadPage(page + 1, false);
  }, [hasMore, loadPage, loading, loadingMore, page]);

  return {
    documents,
    loading,
    loadingMore,
    error,
    hasMore,
    loadMore,
  };
}

export default function useLibraryDocuments() {
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const owned = useDocumentSource("owned", search);
  const savedSource = useDocumentSource("saved", search);

  const ownedIds = new Set(owned.documents.map((document) => document.id));
  const savedDocuments = savedSource.documents.filter(
    (document) => !ownedIds.has(document.id),
  );

  const applySearch = useCallback(
    (event) => {
      event?.preventDefault();
      setSearch(searchInput.trim());
    },
    [searchInput],
  );

  return {
    searchInput,
    setSearchInput,
    applySearch,
    owned,
    saved: {
      ...savedSource,
      documents: savedDocuments,
    },
  };
}
