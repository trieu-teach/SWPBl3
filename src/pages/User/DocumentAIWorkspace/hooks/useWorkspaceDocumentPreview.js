import { useCallback, useEffect, useRef, useState } from "react";
import { getDocumentPreview } from "../../../../api/documents.api.js";

const LOAD_ERROR = "Không thể tải bản xem trước tài liệu.";
const IDENTITY_ERROR =
  "Phản hồi xem trước không khớp với tài liệu đang mở.";
const URL_ERROR = "Không nhận được đường dẫn xem trước tài liệu.";

function normalizeDocumentId(value) {
  if (typeof value !== "string") return null;
  const normalized = value.trim();
  return normalized || null;
}

function createDialogPreview(response) {
  const previewUrl = response?.previewUrl ?? response?.url;

  if (typeof previewUrl !== "string" || !previewUrl.trim()) {
    throw new Error(URL_ERROR);
  }

  return {
    ...response,
    url: previewUrl,
  };
}

export default function useWorkspaceDocumentPreview(
  documentId,
  options = {},
) {
  const { enabled = true } = options ?? {};
  const normalizedDocumentId = normalizeDocumentId(documentId);
  const activeDocumentId = enabled ? normalizedDocumentId : null;

  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [dataDocumentId, setDataDocumentId] = useState(null);

  const generationRef = useRef(0);
  const activeDocumentIdRef = useRef(null);
  const requestRef = useRef(null);

  const invalidateRequest = useCallback(() => {
    generationRef.current += 1;
    requestRef.current = null;
  }, []);

  useEffect(() => {
    invalidateRequest();
    activeDocumentIdRef.current = activeDocumentId;

    setPreview(null);
    setLoading(false);
    setError("");
    setDataDocumentId(activeDocumentId);

    return () => {
      invalidateRequest();

      if (activeDocumentIdRef.current === activeDocumentId) {
        activeDocumentIdRef.current = null;
      }
    };
  }, [activeDocumentId, invalidateRequest]);

  const loadPreview = useCallback(() => {
    if (
      !activeDocumentId ||
      activeDocumentIdRef.current !== activeDocumentId
    ) {
      return Promise.resolve(null);
    }

    const pendingRequest = requestRef.current;
    if (pendingRequest?.documentId === activeDocumentId) {
      return pendingRequest.promise;
    }

    const request = {
      documentId: activeDocumentId,
      generation: ++generationRef.current,
      promise: null,
    };
    requestRef.current = request;

    setPreview(null);
    setLoading(true);
    setError("");

    const isCurrentRequest = () =>
      requestRef.current === request &&
      generationRef.current === request.generation &&
      activeDocumentIdRef.current === request.documentId;

    request.promise = (async () => {
      try {
        const response = await getDocumentPreview(request.documentId);

        if (response?.id !== request.documentId) {
          throw new Error(IDENTITY_ERROR);
        }

        const nextPreview = createDialogPreview(response);
        if (!isCurrentRequest()) return null;

        setPreview(nextPreview);
        return nextPreview;
      } catch (requestError) {
        if (!isCurrentRequest()) return null;

        setPreview(null);
        setError(requestError?.message || LOAD_ERROR);
        return null;
      } finally {
        if (isCurrentRequest()) {
          setLoading(false);
          requestRef.current = null;
        }
      }
    })();

    return request.promise;
  }, [activeDocumentId]);

  const resetPreview = useCallback(() => {
    invalidateRequest();
    setPreview(null);
    setLoading(false);
    setError("");
  }, [invalidateRequest]);

  const scopeMatches = Boolean(
    activeDocumentId && dataDocumentId === activeDocumentId,
  );

  return {
    preview: scopeMatches ? preview : null,
    loading: scopeMatches ? loading : false,
    error: scopeMatches ? error : "",
    loadPreview,
    resetPreview,
  };
}
