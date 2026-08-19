import {
  Alert,
  Box,
  Button,
  Chip,
  Divider,
  Paper,
  Skeleton,
  Stack,
  Typography,
} from "@mui/material";
import {
  AutoAwesomeOutlined,
  DescriptionOutlined,
  VisibilityOutlined,
} from "@mui/icons-material";
import {
  displayFileType,
  formatBytes,
  formatDate,
} from "../../DocumentLibrary/utils/document-formatters.js";

const paneSx = {
  width: "100%",
  height: "100%",
  minWidth: 0,
  minHeight: 0,
  borderRadius: 3,
  display: "flex",
  flexDirection: "column",
  overflow: "hidden",
};

function MetadataItem({ label, value }) {
  return (
    <Box sx={{ minWidth: 0 }}>
      <Typography variant="caption" color="text.secondary">
        {label}
      </Typography>
      <Typography
        variant="body2"
        sx={{ mt: 0.25, fontWeight: 650, overflowWrap: "anywhere" }}
      >
        {value}
      </Typography>
    </Box>
  );
}

export default function DocumentWorkspacePane({
  document,
  loading = false,
  error = "",
  isAiReady = false,
  onReload,
  onOpenPreview,
}) {
  const canReload = typeof onReload === "function";
  const canOpenPreview = typeof onOpenPreview === "function";

  if (loading) {
    return (
      <Paper variant="outlined" aria-busy="true" sx={paneSx}>
        <Box sx={{ p: { xs: 2.5, sm: 3 } }}>
          <Stack direction="row" spacing={2} alignItems="center">
            <Skeleton variant="rounded" width={56} height={56} />
            <Box sx={{ minWidth: 0, flex: 1 }}>
              <Skeleton width="72%" height={32} />
              <Skeleton width="48%" />
            </Box>
          </Stack>
          <Stack spacing={1.5} sx={{ mt: 4 }}>
            <Skeleton variant="rounded" height={48} />
            <Skeleton variant="rounded" height={96} />
            <Skeleton variant="rounded" height={120} />
          </Stack>
        </Box>
      </Paper>
    );
  }

  if (!document) {
    return (
      <Paper variant="outlined" sx={paneSx}>
        <Box
          sx={{
            p: { xs: 2.5, sm: 3 },
            flex: 1,
            display: "grid",
            alignItems: "start",
          }}
        >
          <Alert
            severity={error ? "error" : "info"}
            action={
              error && canReload ? (
                <Button color="inherit" onClick={onReload}>
                  Thử lại
                </Button>
              ) : undefined
            }
          >
            {error
              ? "Không thể tải tài liệu. Vui lòng thử lại."
              : "Chưa có tài liệu để hiển thị."}
          </Alert>
        </Box>
      </Paper>
    );
  }

  const title = document.title || document.fileName || "Tài liệu";
  const visibility =
    document.visibility === "PUBLIC"
      ? "Công khai"
      : document.visibility === "PRIVATE"
        ? "Riêng tư"
        : "Chưa xác định";
  const fileSize =
    document.fileSize === null || document.fileSize === undefined
      ? "Chưa có thông tin"
      : formatBytes(document.fileSize);

  return (
    <Paper variant="outlined" sx={paneSx}>
      <Box sx={{ p: { xs: 2.5, sm: 3 } }}>
        <Stack direction="row" spacing={2} alignItems="flex-start">
          <Box
            sx={{
              width: 56,
              height: 56,
              flexShrink: 0,
              display: "grid",
              placeItems: "center",
              borderRadius: 2.5,
              bgcolor: "action.hover",
              color: "primary.main",
            }}
          >
            <DescriptionOutlined sx={{ fontSize: 32 }} />
          </Box>
          <Box sx={{ minWidth: 0, flex: 1 }}>
            <Typography
              variant="h5"
              component="h2"
              sx={{ fontWeight: 800, overflowWrap: "anywhere" }}
            >
              {title}
            </Typography>
            {document.fileName && (
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mt: 0.5, overflowWrap: "anywhere" }}
              >
                {document.fileName}
              </Typography>
            )}
          </Box>
        </Stack>
      </Box>

      <Divider />

      <Box
        sx={{
          p: { xs: 2.5, sm: 3 },
          minHeight: 0,
          flex: 1,
          overflowY: "auto",
        }}
      >
        <Stack spacing={3}>
          <Box>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Trạng thái
            </Typography>
            <Stack direction="row" gap={1} flexWrap="wrap">
              <Chip label={displayFileType(document)} />
              <Chip label={visibility} variant="outlined" />
              <Chip
                icon={<AutoAwesomeOutlined />}
                label={
                  isAiReady ? "Sẵn sàng cho AI" : "Đang xử lý cho AI"
                }
                color={isAiReady ? "success" : "warning"}
                variant="outlined"
              />
            </Stack>
          </Box>

          <Box>
            <Typography variant="subtitle2" sx={{ mb: 1.5 }}>
              Thông tin tài liệu
            </Typography>
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                gap: 2,
              }}
            >
              <MetadataItem
                label="Môn học"
                value={document.subject?.name || "Chưa phân môn"}
              />
              <MetadataItem
                label="Danh mục"
                value={document.category?.name || "Chưa phân loại"}
              />
              <MetadataItem label="Dung lượng" value={fileSize} />
              <MetadataItem
                label="Ngày tải lên"
                value={formatDate(document.createdAt)}
              />
            </Box>
          </Box>

          {document.description && (
            <Box>
              <Typography variant="subtitle2">Mô tả</Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mt: 0.75, whiteSpace: "pre-wrap" }}
              >
                {document.description}
              </Typography>
            </Box>
          )}

          {document.summary && (
            <Box>
              <Typography variant="subtitle2">Tóm tắt AI</Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mt: 0.75, whiteSpace: "pre-wrap" }}
              >
                {document.summary}
              </Typography>
            </Box>
          )}
        </Stack>
      </Box>

      <Divider />

      <Box sx={{ p: { xs: 2, sm: 2.5 } }}>
        <Button
          fullWidth
          variant="contained"
          startIcon={<VisibilityOutlined />}
          onClick={onOpenPreview}
          disabled={!canOpenPreview}
        >
          Xem tài liệu
        </Button>
      </Box>
    </Paper>
  );
}
