import { useCallback, useEffect, useMemo, useState } from "react";
import { getSavedDocuments } from "../../../../api/saved-documents.api.js";
import {
  unsaveCommunityDocument,
  getCommunityPreview,
} from "../../../../api/community.api.js";
import { getDocumentDownload } from "../../../../api/documents.api.js";

export default function useSavedDocuments() {
  const [documents, setDocuments] = useState([]);
  const [searchInput, setSearchInput] = useState("");
  const [filters, setFilters] = useState({
    search: "",
    fileType: "",
    aiStatus: "",
    sortBy: "savedAt",
  });
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState({ totalItems: 0, totalPages: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionId, setActionId] = useState("");
  const [preview, setPreview] = useState(null);

  const query = useMemo(
    () => ({ ...filters, page, limit: 12, sortOrder: "desc" }),
    [filters, page],
  );
  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await getSavedDocuments(query);
      setDocuments(response?.items || response?.data || []);
      setMeta(response?.meta || { totalItems: 0, totalPages: 0 });
    } catch (requestError) {
      setError(requestError.message || "Không thể tải tài liệu đã lưu.");
    } finally {
      setLoading(false);
    }
  }, [query]);

  useEffect(() => {
    load();
  }, [load]);

  function updateFilter(name, value) {
    setPage(1);
    setFilters((current) => ({ ...current, [name]: value }));
  }

  function search(event) {
    event.preventDefault();
    updateFilter("search", searchInput.trim());
  }

  async function openDocument(document, mode) {
    setActionId(`${mode}-${document.id}`);
    setError("");
    try {
      const response =
        mode === "preview"
          ? await getCommunityPreview(document.id)
          : await getDocumentDownload(document.id);
      if (!response?.url) throw new Error("Không nhận được đường dẫn tệp.");
      if (mode === "preview")
        setPreview({
          title: document.title,
          fileName: document.fileName,
          url: response.url,
        });
      else window.open(response.url, "_blank", "noopener,noreferrer");
    } catch (requestError) {
      setError(requestError.message || "Không thể mở tài liệu.");
    } finally {
      setActionId("");
    }
  }

  async function removeSaved(document) {
    setActionId(`remove-${document.id}`);
    setError("");
    try {
      await unsaveCommunityDocument(document.id);
      setDocuments((current) =>
        current.filter((item) => item.id !== document.id),
      );
      setMeta((current) => ({
        ...current,
        totalItems: Math.max(0, current.totalItems - 1),
      }));
    } catch (requestError) {
      setError(requestError.message || "Không thể bỏ lưu tài liệu.");
    } finally {
      setActionId("");
    }
  }

  return {
    documents,
    searchInput,
    filters,
    page,
    meta,
    loading,
    error,
    actionId,
    preview,
    setSearchInput,
    setPage,
    updateFilter,
    search,
    load,
    openDocument,
    removeSaved,
    closePreview: () => setPreview(null),
  };
}
