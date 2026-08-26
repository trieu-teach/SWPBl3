import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { getAiChatDocuments } from "../../../../api/chat.api.js";
import { getDocument, getSubjects } from "../../../../api/documents.api.js";
import {
  mergeAiDocumentMetadata,
  normalizeAiDocument,
} from "../libraryDocumentMetadata.js";

const PAGE_LIMIT = 100;

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

async function hydrateMissingDocumentMetadata(items) {
  return Promise.all(
    items.map(async (item) => {
      const document = normalizeAiDocument(item);
      if (!document?.id || document.subjectId) return document;

      try {
        const detail = await getDocument(document.id);
        return mergeAiDocumentMetadata(document, detail);
      } catch {
        // Older servers did not include subject metadata in /chat/documents.
        // Keep the AI item usable even if its compatibility lookup fails.
        return document;
      }
    }),
  );
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
          source,
          search,
          page: targetPage,
          limit: PAGE_LIMIT,
        };
        const response = await getAiChatDocuments(query);
        const result = Array.isArray(response)
          ? { items: response, meta: {} }
          : { items: response?.items ?? [], meta: response?.meta ?? {} };
        result.items = await hydrateMissingDocumentMetadata(result.items);
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
  const [source, setSource] = useState("all");
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [subjects, setSubjects] = useState([]);
  const [subjectsLoading, setSubjectsLoading] = useState(true);
  const [subjectsError, setSubjectsError] = useState("");
  const current = useDocumentSource(source, search);
  const availableSubjects = useMemo(() => {
    const subjectsById = new Map();
    subjects.forEach((subject) => {
      if (subject?.id) subjectsById.set(subject.id, subject);
    });
    current.documents.forEach((document) => {
      if (!document?.subjectId || subjectsById.has(document.subjectId)) return;
      subjectsById.set(document.subjectId, {
        id: document.subjectId,
        name: document.subject || "Không xác định",
      });
    });
    return [...subjectsById.values()].sort((left, right) =>
      (left.name || "").localeCompare(right.name || "", "vi"),
    );
  }, [current.documents, subjects]);

  useEffect(() => {
    let active = true;
    setSubjectsLoading(true);
    setSubjectsError("");
    getSubjects()
      .then((response) => {
        if (!active) return;
        setSubjects(Array.isArray(response) ? response : response?.items ?? []);
      })
      .catch((requestError) => {
        if (!active) return;
        setSubjectsError(requestError?.message || "Không thể tải danh sách môn học.");
      })
      .finally(() => {
        if (active) setSubjectsLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const applySearch = useCallback(
    (event) => {
      event?.preventDefault();
      setSearch(searchInput.trim());
    },
    [searchInput],
  );

  return {
    source,
    setSource,
    searchInput,
    setSearchInput,
    applySearch,
    current,
    subjects: availableSubjects,
    subjectsLoading,
    subjectsError,
  };
}
