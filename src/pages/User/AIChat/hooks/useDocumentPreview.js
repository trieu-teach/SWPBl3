import { useCallback, useState } from "react";
import { getDocumentPreview } from "../../../../api/documents.api.js";
import { useToast } from "../../../../components/Toast/ToastProvider.jsx";

/**
 * Manages document preview state for the AIChat workspace.
 *
 * Provides a single preview dialog that can be triggered from multiple
 * locations (ChatSources, LibraryDocumentSidebar) via openPreview().
 *
 * @returns {{ preview: object|null, loadingId: string|null, openPreview: Function, closePreview: Function }}
 */
export default function useDocumentPreview() {
  const toast = useToast();
  const [preview, setPreview] = useState(null);
  const [loadingId, setLoadingId] = useState(null);

  const openPreview = useCallback(
    async (documentId, fallbackTitle) => {
      if (!documentId) return;
      setLoadingId(documentId);
      try {
        const response = await getDocumentPreview(documentId);
        setPreview({
          title: fallbackTitle || response?.title || "Tài liệu",
          fileName: response?.fileName,
          url: response?.previewUrl || response?.url,
          contentType: response?.contentType,
          fallbackToOfficeViewer: response?.fallbackToOfficeViewer,
        });
      } catch (requestError) {
        toast.error(requestError.message || "Không thể xem trước tài liệu.");
      } finally {
        setLoadingId(null);
      }
    },
    [toast],
  );

  const closePreview = useCallback(() => setPreview(null), []);

  return { preview, loadingId, openPreview, closePreview };
}
