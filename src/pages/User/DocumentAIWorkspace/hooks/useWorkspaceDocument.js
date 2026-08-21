import { useCallback, useEffect, useRef, useState } from "react";
import { getDocument } from "../../../../api/documents.api.js";

const LOAD_ERROR = "Không thể tải thông tin tài liệu.";
const IDENTITY_ERROR = "Phản hồi tài liệu không khớp với tài liệu đang mở.";

function normalizeDocumentId(value) {
  if (typeof value !== "string") return null;
  const normalized = value.trim();
  return normalized || null;
}

export default function useWorkspaceDocument(documentId, options = {}) {
  const { enabled = true } = options ?? {};
  const normalizedDocumentId = normalizeDocumentId(documentId);
  const activeDocumentId = enabled ? normalizedDocumentId : null;

  const [document, setDocument] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [dataDocumentId, setDataDocumentId] = useState(null);

  const generationRef = useRef(0);
  const activeDocumentIdRef = useRef(null);
  const requestRef = useRef(null);

  const fetchDocument = useCallback(async (requestDocumentId) => {
    const request = {
      documentId: requestDocumentId,
      generation: ++generationRef.current,
    };
    requestRef.current = request;

    setDocument(null);
    setLoading(true);
    setError("");

    const isCurrentRequest = () =>
      requestRef.current === request &&
      generationRef.current === request.generation &&
      activeDocumentIdRef.current === request.documentId;

    try {
      const response = await getDocument(request.documentId);

      if (response?.id !== request.documentId) {
        throw new Error(IDENTITY_ERROR);
      }
      if (!isCurrentRequest()) return;

      setDocument(response);
    } catch (requestError) {
      if (!isCurrentRequest()) return;

      setDocument(null);
      setError(requestError?.message || LOAD_ERROR);
    } finally {
      if (isCurrentRequest()) {
        setLoading(false);
        requestRef.current = null;
      }
    }
  }, []);

  useEffect(() => {
    generationRef.current += 1;
    requestRef.current = null;
    activeDocumentIdRef.current = activeDocumentId;

    setDocument(null);
    setLoading(false);
    setError("");
    setDataDocumentId(activeDocumentId);

    if (activeDocumentId) {
      void fetchDocument(activeDocumentId);
    }

    return () => {
      generationRef.current += 1;
      requestRef.current = null;

      if (activeDocumentIdRef.current === activeDocumentId) {
        activeDocumentIdRef.current = null;
      }
    };
  }, [activeDocumentId, fetchDocument]);

  const reload = useCallback(() => {
    if (
      !activeDocumentId ||
      activeDocumentIdRef.current !== activeDocumentId
    ) {
      return Promise.resolve();
    }

    return fetchDocument(activeDocumentId);
  }, [activeDocumentId, fetchDocument]);

  const scopeMatches = Boolean(
    activeDocumentId && dataDocumentId === activeDocumentId,
  );
  const activeDocument = scopeMatches ? document : null;

  return {
    document: activeDocument,
    loading: activeDocumentId ? !scopeMatches || loading : false,
    error: scopeMatches ? error : "",
    reload,
    isAiReady: Boolean(
      activeDocument?.status === "ACTIVE" &&
        activeDocument?.aiStatus === "COMPLETED",
    ),
  };
}
