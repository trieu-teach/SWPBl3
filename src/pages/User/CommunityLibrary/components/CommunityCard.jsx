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
  BookmarkBorderOutlined,
  BookmarkOutlined,
  CloudDownloadOutlined,
  DescriptionOutlined,
  VisibilityOutlined,
} from "@mui/icons-material";
import {
  displayFileType,
  formatBytes,
  formatDate,
  getFileTypeColors,
  normalizeTags,
} from "../../DocumentLibrary/utils/document-formatters.js";

export default function CommunityCard({
  document,
  actionId,
  onPreview,
  onDownload,
  onSave,
}) {
  const tags = normalizeTags(document.tags);
  const fileColors = getFileTypeColors(document);
  return (
    <Card
      variant="outlined"
      sx={{ borderRadius: 3, display: "flex", flexDirection: "column" }}
    >
      <CardContent sx={{ flex: 1 }}>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="flex-start"
          spacing={3}
          sx={{ width: "100%" }}
        >
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
              flexShrink: 0,
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
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ display: "block", mt: 1.5 }}
        >
          {formatBytes(document.fileSize)} · {formatDate(document.createdAt)} ·{" "}
          {document.viewCount || 0} lượt xem
        </Typography>
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
          onClick={() => onPreview(document)}
        >
          Xem
        </Button>
        <Tooltip title="Tải xuống">
          <span>
            <IconButton
              size="small"
              disabled={Boolean(actionId)}
              onClick={() => onDownload(document)}
            >
              {actionId === `download-${document.id}` ? (
                <CircularProgress size={18} />
              ) : (
                <CloudDownloadOutlined />
              )}
            </IconButton>
          </span>
        </Tooltip>
        {!document.owned && (
          <Button
            size="small"
            disabled={actionId === `save-${document.id}`}
            startIcon={
              document.saved ? <BookmarkOutlined /> : <BookmarkBorderOutlined />
            }
            onClick={() => onSave(document)}
          >
            {document.saved ? "Bỏ lưu" : "Lưu"}
          </Button>
        )}
      </CardActions>
    </Card>
  );
}
