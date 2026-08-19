import { useCallback, useEffect, useMemo, useState } from "react";
import {
  getCommunityDocuments,
  getCommunityPreview,
  saveCommunityDocument,
  unsaveCommunityDocument,
} from "../../../../api/community.api.js";
import { getDocumentDownload } from "../../../../api/documents.api.js";
import { useToast } from "../../../../components/Toast/ToastProvider.jsx";

export default function useCommunityLibrary() {
  const toast = useToast();
  const [documents, setDocuments] = useState([]);
  const [searchInput, setSearchInput] = useState("");
  const [filters, setFilters] = useState({
    q: "",
    fileType: "",
    sortBy: "createdAt",
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
      const response = await getCommunityDocuments(query);
      setDocuments(response?.items || response?.data || []);
      setMeta(response?.meta || { totalItems: 0, totalPages: 0 });
    } catch (requestError) {
      setError(requestError.message || "Không thể tải thư viện cộng đồng.");
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
    updateFilter("q", searchInput.trim());
  }

  async function openPreview(document) {
    setActionId(`preview-${document.id}`);
    setError("");
    try {
      const response = await getCommunityPreview(document.id);
      const previewUrl = response?.previewUrl || response?.url;

      if (!previewUrl) {
        throw new Error("Backend không trả về đường dẫn xem trước.");
      }

      setPreview({
        title: document.title,
        fileName: document.fileName,
        url: previewUrl,
        contentType: response?.contentType,
        fallbackToOfficeViewer: response?.fallbackToOfficeViewer,
      });
    } catch (requestError) {
      setError(requestError.message || "Không thể xem tài liệu.");
    } finally {
      setActionId("");
    }
  }

  async function downloadDocument(document) {
    setActionId(`download-${document.id}`);
    setError("");

    try {
      const response = await getDocumentDownload(document.id);
      const downloadUrl = response?.url;

      if (!downloadUrl) {
        throw new Error("Backend không trả về đường dẫn tải xuống.");
      }

      const link = window.document.createElement("a");
      link.href = downloadUrl;
      link.rel = "noopener noreferrer";
      link.download = document.fileName || "document";
      window.document.body.appendChild(link);
      link.click();
      link.remove();

      setDocuments((current) =>
        current.map((item) =>
          item.id === document.id
            ? { ...item, downloadCount: (item.downloadCount || 0) + 1 }
            : item,
        ),
      );
    } catch (requestError) {
      const message = requestError.message || "Không thể tải tài liệu.";
      setError(message);
      toast.error(message);
    } finally {
      setActionId("");
    }
  }

  async function toggleSave(document) {
    setActionId(`save-${document.id}`);
    setError("");
    try {
      if (document.saved) await unsaveCommunityDocument(document.id);
      else await saveCommunityDocument(document.id);
      setDocuments((current) =>
        current.map((item) =>
          item.id === document.id
            ? {
                ...item,
                saved: !item.saved,
                saveCount: Math.max(
                  0,
                  (item.saveCount || 0) + (item.saved ? -1 : 1),
                ),
              }
            : item,
        ),
      );
      toast.success(
        document.saved
          ? "Đã bỏ tài liệu khỏi danh sách đã lưu."
          : "Đã lưu tài liệu để xem lại sau.",
      );
    } catch (requestError) {
      const message = requestError.message || "Không thể cập nhật tài liệu đã lưu.";
      setError(message);
      toast.error(message);
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
    openPreview,
    downloadDocument,
    toggleSave,
    closePreview: () => setPreview(null),
  };
}
