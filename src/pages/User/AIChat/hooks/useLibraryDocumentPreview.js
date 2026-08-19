import { useCallback, useRef, useState } from "react";
import { getDocumentPreview } from "../../../../api/documents.api.js";

const PREVIEW_ERROR = "Không thể tải bản xem trước tài liệu.";

function normalizeId(value) {
  if (typeof value !== "string") return null;
  const normalized = value.trim();
  return normalized || null;
}

export default function useLibraryDocumentPreview() {
  const [preview, setPreview] = useState(null);
  const [loadingDocumentId, setLoadingDocumentId] = useState(null);
  const [error, setError] = useState("");
  const generationRef = useRef(0);

  const closePreview = useCallback(() => {
    generationRef.current += 1;
    setPreview(null);
    setLoadingDocumentId(null);
    setError("");
  }, []);

  const openPreview = useCallback(async (document) => {
    const documentId = normalizeId(document?.id);
    if (!documentId) return false;

    const generation = ++generationRef.current;
    setPreview(null);
    setLoadingDocumentId(documentId);
    setError("");

    try {
      const response = await getDocumentPreview(documentId);
      if (generationRef.current !== generation) return false;

      if (response?.id && response.id !== documentId) {
        throw new Error("Bản xem trước không khớp với tài liệu đã chọn.");
      }

      const previewUrl = response?.previewUrl ?? response?.url;
      if (typeof previewUrl !== "string" || !previewUrl.trim()) {
        throw new Error("Không nhận được đường dẫn xem trước tài liệu.");
      }

      setPreview({
        ...response,
        title: response?.title || document.title || "Tài liệu",
        fileName: response?.fileName || document.fileName || "",
        url: previewUrl,
      });
      return true;
    } catch (requestError) {
      if (generationRef.current !== generation) return false;

      setError(requestError?.message || PREVIEW_ERROR);
      return false;
    } finally {
      if (generationRef.current === generation) {
        setLoadingDocumentId(null);
      }
    }
  }, []);

  return {
    preview,
    loadingDocumentId,
    error,
    openPreview,
    closePreview,
  };
}
