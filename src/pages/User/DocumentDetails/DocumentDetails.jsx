import { Link } from "react-router-dom";
import {
  Alert,
  Box,
  Button,
  Chip,
  Paper,
  Skeleton,
  Stack,
  Typography,
} from "@mui/material";
import { ArrowBackOutlined, DescriptionOutlined } from "@mui/icons-material";
import UserLayout from "../Layout/UserLayout.jsx";
import DocumentPreviewDialog from "../DocumentLibrary/components/DocumentPreviewDialog.jsx";
import DocumentActions from "./components/DocumentActions.jsx";
import DocumentEditForm from "./components/DocumentEditForm.jsx";
import DocumentModerationAlert from "./components/DocumentModerationAlert.jsx";
import useDocumentDetails from "./hooks/useDocumentDetails.js";
import {
  AI_STATUS,
  displayFileType,
  formatBytes,
  formatDate,
  getModerationStatus,
  getSharingStatus,
  normalizeTags,
} from "../DocumentLibrary/utils/document-formatters.js";

export default function DocumentDetails() {
  const details = useDocumentDetails();

  if (details.loading) {
    return (
      <UserLayout>
        <Skeleton width={180} height={40} />
        <Skeleton variant="rounded" height={220} sx={{ mt: 2 }} />
      </UserLayout>
    );
  }

  if (!details.document) {
    return (
      <UserLayout>
        <Alert
          severity="error"
          action={<Button onClick={details.reload}>Thử lại</Button>}
        >
          {details.error || "Không tìm thấy tài liệu."}
        </Alert>
      </UserLayout>
    );
  }

  const document = details.document;
  const status = AI_STATUS[document.aiStatus] || AI_STATUS.PENDING;
  const moderation = getModerationStatus(document);
  const sharing = getSharingStatus(document);
  const tags = normalizeTags(document.tags);

  return (
    <UserLayout>
      <Button
        component={Link}
        to="/documents"
        startIcon={<ArrowBackOutlined />}
        sx={{ mb: 2 }}
      >
        Quay lại thư viện
      </Button>

      {details.error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {details.error}
        </Alert>
      )}
      {details.success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {details.success}
        </Alert>
      )}

      <DocumentModerationAlert document={document} />

      <Paper
        variant="outlined"
        sx={{ p: { xs: 2.5, md: 4 }, borderRadius: 3, mb: 3 }}
      >
        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={3}
          alignItems={{ md: "flex-start" }}
        >
          <Box
            sx={{
              width: 64,
              height: 64,
              display: "grid",
              placeItems: "center",
              borderRadius: 3,
              bgcolor: "action.hover",
              color: "primary.main",
              flexShrink: 0,
            }}
          >
            <DescriptionOutlined sx={{ fontSize: 34 }} />
          </Box>
          <Box sx={{ minWidth: 0, flex: 1 }}>
            <Typography variant="h4" sx={{ fontWeight: 800 }}>
              {document.title}
            </Typography>
            <Typography color="text.secondary" sx={{ mt: 0.5 }}>
              {document.fileName}
            </Typography>
            <Stack direction="row" gap={1} flexWrap="wrap" sx={{ mt: 2 }}>
              <Chip label={displayFileType(document)} />
              <Chip
                label={status.label}
                color={status.color}
                variant="outlined"
              />
              {moderation && (
                <Chip
                  label={moderation.label}
                  color={moderation.color}
                  variant="outlined"
                />
              )}
              {sharing.label !== "Đã chọn công khai" && (
                <Chip
                  label={sharing.label}
                  color={sharing.color}
                  variant="outlined"
                />
              )}
              {tags.map((tag) => (
                <Chip
                  key={tag.id || tag.name}
                  label={tag.name}
                  size="small"
                  variant="outlined"
                />
              ))}
            </Stack>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
              {document.subject?.name} · {document.category?.name} ·{" "}
              {formatBytes(document.fileSize)} · Tải lên{" "}
              {formatDate(document.createdAt)}
            </Typography>
            {document.summary && (
              <Box sx={{ mt: 3 }}>
                <Typography fontWeight={700}>Tóm tắt AI</Typography>
                <Typography
                  color="text.secondary"
                  sx={{ mt: 0.5, whiteSpace: "pre-wrap" }}
                >
                  {document.summary}
                </Typography>
              </Box>
            )}
          </Box>
        </Stack>
      </Paper>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", lg: "minmax(0, 1fr) 340px" },
          gap: 3,
        }}
      >
        <DocumentEditForm details={details} />
        <DocumentActions details={details} />
      </Box>

      <DocumentPreviewDialog
        preview={details.preview}
        onClose={details.closePreview}
      />
    </UserLayout>
  );
}
