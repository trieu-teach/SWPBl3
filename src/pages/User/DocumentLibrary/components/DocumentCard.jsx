import {
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
  CloudDownloadOutlined,
  DescriptionOutlined,
  LockOutlined,
  PublicOutlined,
  VisibilityOutlined,
} from "@mui/icons-material";
import { Link } from "react-router-dom";
import {
  AI_STATUS,
  displayFileType,
  formatBytes,
  formatDate,
  getFileTypeColors,
  getModerationStatus,
  normalizeTags,
} from "../utils/document-formatters.js";

export default function DocumentCard({ document, actionId, onOpen }) {
  const status = AI_STATUS[document.aiStatus] || AI_STATUS.PENDING;
  const tags = normalizeTags(document.tags);
  const fileColors = getFileTypeColors(document);
  const moderation = getModerationStatus(document);

  return (
    <Card
      variant="outlined"
      sx={{
        borderRadius: 3,
        display: "flex",
        flexDirection: "column",
        minWidth: 0,
      }}
    >
      <CardContent sx={{ flex: 1, position: "relative" }}>
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
        <Tooltip
          title={
            document.visibility === "PUBLIC"
              ? moderation
                ? `Công khai · ${moderation.label}`
                : "Công khai"
              : "Riêng tư"
          }
        >
          <Box
            color="text.secondary"
            sx={{ position: "absolute", top: 20, right: 20, display: "grid" }}
          >
            {document.visibility === "PUBLIC" ? (
              <PublicOutlined />
            ) : (
              <LockOutlined />
            )}
          </Box>
        </Tooltip>

        <Typography
          noWrap
          variant="h6"
          title={document.title}
          sx={{ mt: 2, fontWeight: 750 }}
        >
          {document.title}
        </Typography>
        <Typography variant="body2" color="text.secondary" noWrap>
          {document.fileName}
        </Typography>
        <Stack direction="row" gap={0.75} flexWrap="wrap" sx={{ my: 2 }}>
          <Chip
            size="small"
            label={displayFileType(document)}
            sx={{ bgcolor: fileColors.soft, color: fileColors.main, fontWeight: 700 }}
          />
          <Chip
            size="small"
            label={status.label}
            color={status.color}
            variant="outlined"
          />
          {moderation && (
            <Chip
              size="small"
              label={moderation.label}
              color={moderation.color}
              variant="outlined"
            />
          )}
        </Stack>
        <Typography variant="body2" color="text.secondary" noWrap>
          {document.subject?.name || "Chưa phân môn"} ·{" "}
          {document.category?.name || "Chưa phân loại"}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {formatBytes(document.fileSize)} · {formatDate(document.createdAt)}
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
        <Button component={Link} to={`/documents/${document.id}`} size="small">
          Chi tiết
        </Button>
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
      </CardActions>
    </Card>
  );
}
