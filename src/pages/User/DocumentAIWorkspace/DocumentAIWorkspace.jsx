import { useCallback, useEffect, useRef, useState } from "react";
import { Alert, Box, LinearProgress } from "@mui/material";
import { useParams } from "react-router-dom";
import UserLayout from "../Layout/UserLayout.jsx";
import DocumentPreviewDialog from "../DocumentLibrary/components/DocumentPreviewDialog.jsx";
import DocumentAIAssistant from "./components/DocumentAIAssistant.jsx";
import DocumentWorkspacePane from "./components/DocumentWorkspacePane.jsx";
import useWorkspaceDocument from "./hooks/useWorkspaceDocument.js";
import useWorkspaceDocumentPreview from "./hooks/useWorkspaceDocumentPreview.js";

const AI_PROCESSING_MESSAGE =
  "Tài liệu đang được xử lý để sử dụng với AI.";

function normalizeString(value) {
  if (typeof value !== "string") return null;
  const normalized = value.trim();
  return normalized || null;
}

function belongsToDocument(source, documentId) {
  return Boolean(
    source &&
      typeof source === "object" &&
      !Array.isArray(source) &&
      typeof source.documentId === "string" &&
      source.documentId.trim() &&
      source.documentId === documentId,
  );
}

export default function DocumentAIWorkspace() {
  const { documentId: routeDocumentId } = useParams();
  const normalizedDocumentId = normalizeString(routeDocumentId);
  const validDocumentId = Boolean(normalizedDocumentId);

  const [previewOpen, setPreviewOpen] = useState(false);
  const [selectedCitation, setSelectedCitation] = useState(null);
  const previewIntentRef = useRef(0);

  const workspaceDocument = useWorkspaceDocument(normalizedDocumentId, {
    enabled: validDocumentId,
  });
  const documentAvailable = Boolean(
    validDocumentId &&
      !workspaceDocument.loading &&
      workspaceDocument.document &&
      !workspaceDocument.error,
  );

  const {
    preview,
    loading: previewLoading,
    error: previewError,
    loadPreview,
    resetPreview,
  } = useWorkspaceDocumentPreview(normalizedDocumentId, {
    enabled: documentAvailable,
  });

  useEffect(() => {
    previewIntentRef.current += 1;
    setPreviewOpen(false);
    setSelectedCitation(null);
    resetPreview();

    return () => {
      previewIntentRef.current += 1;
    };
  }, [documentAvailable, normalizedDocumentId, resetPreview]);

  const handleOpenPreview = useCallback(async () => {
    if (!documentAvailable) return;

    const intent = ++previewIntentRef.current;
    setPreviewOpen(false);
    setSelectedCitation(null);

    const nextPreview = await loadPreview();
    if (previewIntentRef.current === intent && nextPreview) {
      setPreviewOpen(true);
    }
  }, [documentAvailable, loadPreview]);

  const handleClosePreview = useCallback(() => {
    previewIntentRef.current += 1;
    setPreviewOpen(false);
    setSelectedCitation(null);
    resetPreview();
  }, [resetPreview]);

  const handleSourceSelect = useCallback(
    async (source) => {
      if (
        !documentAvailable ||
        !belongsToDocument(source, normalizedDocumentId)
      ) {
        previewIntentRef.current += 1;
        setPreviewOpen(false);
        setSelectedCitation(null);
        resetPreview();
        return;
      }

      const intent = ++previewIntentRef.current;
      setPreviewOpen(false);
      setSelectedCitation(source);

      const nextPreview = await loadPreview();
      if (previewIntentRef.current === intent && nextPreview) {
        setPreviewOpen(true);
      }
    },
    [documentAvailable, loadPreview, normalizedDocumentId, resetPreview],
  );

  if (!validDocumentId) {
    return (
      <UserLayout>
        <Alert severity="warning">
          Không thể mở không gian AI vì tài liệu không hợp lệ.
        </Alert>
      </UserLayout>
    );
  }

  const documentTitle =
    normalizeString(workspaceDocument.document?.title) ||
    normalizeString(workspaceDocument.document?.fileName) ||
    "Tài liệu";
  const canonicalDocumentAiBasePath = `/documents/${encodeURIComponent(
    normalizedDocumentId,
  )}/ai`;
  const assistantEnabled = documentAvailable;
  const disabledReason =
    assistantEnabled && !workspaceDocument.isAiReady
      ? AI_PROCESSING_MESSAGE
      : "";

  return (
    <UserLayout>
      <Box
        component="section"
        aria-label="Không gian AI cho tài liệu"
        sx={{
          minWidth: 0,
          minHeight: { xs: 0, lg: 560 },
          height: { lg: "calc(100dvh - 136px)" },
          display: "flex",
          flexDirection: "column",
          gap: 2,
        }}
      >
        {previewLoading && (
          <LinearProgress aria-label="Đang tải bản xem trước tài liệu" />
        )}

        {previewError && (
          <Alert severity="error">
            {selectedCitation
              ? "Không thể mở bản xem trước cho nguồn trích dẫn. Vui lòng thử lại."
              : "Không thể mở bản xem trước tài liệu. Vui lòng thử lại."}
          </Alert>
        )}

        <Box
          sx={{
            minWidth: 0,
            minHeight: 0,
            flex: 1,
            display: "grid",
            gridTemplateColumns: {
              xs: "minmax(0, 1fr)",
              lg: "minmax(0, 5fr) minmax(0, 6fr)",
            },
            gridTemplateRows: {
              xs: "auto auto",
              lg: "minmax(0, 1fr)",
            },
            gap: { xs: 2, lg: 3 },
          }}
        >
          <Box sx={{ minWidth: 0, minHeight: { xs: 480, lg: 0 } }}>
            <DocumentWorkspacePane
              document={workspaceDocument.document}
              loading={workspaceDocument.loading}
              error={workspaceDocument.error}
              isAiReady={workspaceDocument.isAiReady}
              onReload={workspaceDocument.reload}
              onOpenPreview={
                documentAvailable ? handleOpenPreview : undefined
              }
            />
          </Box>

          <Box sx={{ minWidth: 0, minHeight: { xs: 640, lg: 0 } }}>
            <DocumentAIAssistant
              documentId={normalizedDocumentId}
              documentTitle={documentTitle}
              basePath={canonicalDocumentAiBasePath}
              enabled={assistantEnabled}
              canSend={workspaceDocument.isAiReady}
              disabledReason={disabledReason}
              onSourceSelect={handleSourceSelect}
            />
          </Box>
        </Box>
      </Box>

      <DocumentPreviewDialog
        preview={previewOpen ? preview : null}
        onClose={handleClosePreview}
      />
    </UserLayout>
  );
}
