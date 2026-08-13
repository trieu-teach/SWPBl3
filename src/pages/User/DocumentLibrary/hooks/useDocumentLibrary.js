import { useCallback, useEffect, useMemo, useState } from "react";
import {
  getCategories,
  getDocumentDownload,
  getDocumentPreview,
  getDocuments,
  getSubjects,
} from "../../../../api/documents.api.js";
import { normalizeDocumentList } from "../utils/document-formatters.js";

const INITIAL_FILTERS = {
  search: "",
  subjectId: "",
  categoryId: "",
  fileType: "",
  visibility: "",
  aiStatus: "",
};

export default function useDocumentLibrary() {
  const [documents, setDocuments] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [categories, setCategories] = useState([]);
  const [filters, setFilters] = useState(INITIAL_FILTERS);
  const [searchInput, setSearchInput] = useState("");
  const [page, setPage] = useState(1);
  const [pageCount, setPageCount] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionId, setActionId] = useState("");
  const [preview, setPreview] = useState(null);

  useEffect(() => {
    getSubjects()
      .then((data) => setSubjects(data?.items || data || []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    setCategories([]);
    if (!filters.subjectId) return;
    getCategories(filters.subjectId)
      .then((data) => setCategories(data?.items || data || []))
      .catch(() => {});
  }, [filters.subjectId]);

  const query = useMemo(
    () => ({
      ...filters,
      ownerOnly: true,
      page,
      limit: 9,
      sortBy: "createdAt",
      sortOrder: "desc",
    }),
    [filters, page],
  );

  const loadDocuments = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = normalizeDocumentList(await getDocuments(query));
      const count = Number(
        response.meta.totalItems ??
          response.meta.total ??
          response.items.length,
      );
      setDocuments(response.items);
      setTotal(count);
      setPageCount(
        Number(response.meta.totalPages ?? Math.max(1, Math.ceil(count / 9))),
      );
    } catch (requestError) {
      setError(requestError.message || "Không thể tải thư viện tài liệu.");
    } finally {
      setLoading(false);
    }
  }, [query]);

  useEffect(() => {
    loadDocuments();
  }, [loadDocuments]);

  function updateFilter(name, value) {
    setPage(1);
    setFilters((current) => ({
      ...current,
      [name]: value,
      ...(name === "subjectId" ? { categoryId: "" } : {}),
    }));
  }

  function applySearch(event) {
    event.preventDefault();
    updateFilter("search", searchInput.trim());
  }

  function resetFilters() {
    setSearchInput("");
    setFilters(INITIAL_FILTERS);
    setPage(1);
  }

  async function openDocument(document, mode) {
    setActionId(`${mode}-${document.id}`);
    setError("");
    try {
      const response =
        mode === "preview"
          ? await getDocumentPreview(document.id)
          : await getDocumentDownload(document.id);
      if (!response?.url) {
        throw new Error("Backend không trả về đường dẫn tệp.");
      }
      if (mode === "preview") {
        setPreview({
          title: document.title,
          fileName: document.fileName,
          url: response.url,
        });
      } else {
        window.open(response.url, "_blank", "noopener,noreferrer");
      }
    } catch (actionError) {
      setError(actionError.message || "Không thể mở tài liệu.");
    } finally {
      setActionId("");
    }
  }

  return {
    documents,
    subjects,
    categories,
    filters,
    searchInput,
    page,
    pageCount,
    total,
    loading,
    error,
    actionId,
    preview,
    setSearchInput,
    setPage,
    updateFilter,
    applySearch,
    resetFilters,
    loadDocuments,
    openDocument,
    closePreview: () => setPreview(null),
  };
}
