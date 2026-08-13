import {
  Avatar,
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  Chip,
  CircularProgress,
  IconButton,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import {
  BookmarkRemoveOutlined,
  CloudDownloadOutlined,
  DescriptionOutlined,
  VisibilityOutlined,
} from "@mui/icons-material";
import {
  AI_STATUS,
  displayFileType,
  formatBytes,
  formatDate,
  getFileTypeColors,
  normalizeTags,
} from "../../DocumentLibrary/utils/document-formatters.js";

export default function SavedDocumentCard({
  document,
  actionId,
  onOpen,
  onRemove,
}) {
  const status = AI_STATUS[document.aiStatus] || AI_STATUS.PENDING;
  const tags = normalizeTags(document.tags);
  const fileColors = getFileTypeColors(document);
  return (
    <Card
      variant="outlined"
      sx={{ borderRadius: 3, display: "flex", flexDirection: "column" }}
    >
      <CardContent sx={{ flex: 1 }}>
        <Stack direction="row" justifyContent="space-between" spacing={3}>
          <Box
            sx={{
              width: 48,
              height: 48,
              display: "grid",
              placeItems: "center",
              borderRadius: 2,
              bgcolor: fileColors.soft,
              color: fileColors.main,
            }}
          >
            <DescriptionOutlined />
          </Box>
          <Chip
            size="small"
            label={displayFileType(document)}
            sx={{
              ml: "auto",
              bgcolor: fileColors.soft,
              color: fileColors.main,
              fontWeight: 700,
            }}
          />
        </Stack>
        <Typography
          variant="h6"
          noWrap
          title={document.title}
          sx={{ mt: 2, fontWeight: 750 }}
        >
          {document.title}
        </Typography>
        <Typography variant="body2" color="text.secondary" noWrap>
          {document.subject?.name} · {document.category?.name}
        </Typography>
        <Stack
          direction="row"
          alignItems="center"
          gap={1.5}
          sx={{ mt: 2, minWidth: 0 }}
        >
          <Avatar
            src={document.owner?.avatarUrl || undefined}
            sx={{ width: 32, height: 32, fontSize: 12, flexShrink: 0 }}
          >
            {document.owner?.fullName?.[0]}
          </Avatar>
          <Typography
            variant="body2"
            noWrap
            sx={{ minWidth: 0, flex: 1, ml: 1 }}
          >
            {document.owner?.fullName || "Người chia sẻ"}
          </Typography>
        </Stack>
        <Stack direction="row" gap={1} sx={{ mt: 1.5 }}>
          <Chip
            size="small"
            label={status.label}
            color={status.color}
            variant="outlined"
          />
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ alignSelf: "center" }}
          >
            {formatBytes(document.fileSize)} · Lưu{" "}
            {formatDate(document.savedAt)}
          </Typography>
        </Stack>
        {tags.length > 0 && (
          <Stack direction="row" gap={0.75} flexWrap="wrap" sx={{ mt: 1.5 }}>
            {tags.slice(0, 3).map((tag) => (
              <Chip
                key={tag.id || tag.name}
                label={tag.name}
                size="small"
                variant="outlined"
              />
            ))}
          </Stack>
        )}
      </CardContent>
      <CardActions
        sx={{ px: 2, pb: 2, borderTop: "1px solid", borderColor: "divider" }}
      >
        <Button
          size="small"
          startIcon={
            actionId === `preview-${document.id}` ? (
              <CircularProgress size={15} />
            ) : (
              <VisibilityOutlined />
            )
          }
          onClick={() => onOpen(document, "preview")}
        >
          Xem
        </Button>
        <Tooltip title="Tải xuống">
          <span>
            <IconButton
              size="small"
              disabled={Boolean(actionId)}
              onClick={() => onOpen(document, "download")}
            >
              {actionId === `download-${document.id}` ? (
                <CircularProgress size={18} />
              ) : (
                <CloudDownloadOutlined />
              )}
            </IconButton>
          </span>
        </Tooltip>
        <Button
          color="error"
          size="small"
          disabled={actionId === `remove-${document.id}`}
          startIcon={<BookmarkRemoveOutlined />}
          onClick={() => onRemove(document)}
        >
          Bỏ lưu
        </Button>
      </CardActions>
    </Card>
  );
}
