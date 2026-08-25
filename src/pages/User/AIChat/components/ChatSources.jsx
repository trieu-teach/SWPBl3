import {
  Box,
  Button,
  Chip,
  CircularProgress,
  IconButton,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import ExpandMoreRounded from "@mui/icons-material/ExpandMoreRounded";
import ExpandLessRounded from "@mui/icons-material/ExpandLessRounded";
import VisibilityOutlined from "@mui/icons-material/VisibilityOutlined";
import { useState } from "react";
import {
  getChatSourceDocumentId,
  getChatSourceNumber,
} from "../chatSource.model.js";

const MAX_VISIBLE_SOURCES = 2;

function SourceItem({ source, index, onSourceSelect, onPreviewDocument, loadingId }) {
  const isSelectable = typeof onSourceSelect === "function";
  const previewableId = getChatSourceDocumentId(source);
  const displayNumber = getChatSourceNumber(source, index);
  const isPreviewLoading = loadingId === previewableId;

  function handleKeyDown(event) {
    if (!isSelectable) return;
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onSourceSelect(source);
    }
  }

  function handlePreviewClick(event) {
    event.stopPropagation();
    if (onPreviewDocument && previewableId) {
      onPreviewDocument(previewableId, source.title);
    }
  }

  return (
    <Stack
      // Always a div — avoids <button><button/></button> when adding the
      // preview IconButton. Click / keyboard behaviour is restored below.
      component="div"
      role={isSelectable ? "button" : undefined}
      tabIndex={isSelectable ? 0 : undefined}
      direction="row"
      spacing={1}
      onClick={isSelectable ? () => onSourceSelect(source) : undefined}
      onKeyDown={handleKeyDown}
      sx={{
        alignItems: "flex-start",
        px: 1,
        py: 0.85,
        borderRadius: 1.5,
        bgcolor: "action.hover",
        border: 0,
        cursor: isSelectable ? "pointer" : "default",
        ...(isSelectable && {
          width: "100%",
          "&:hover": { bgcolor: "action.selected" },
          "&:focus-visible": {
            outline: "2px solid",
            outlineColor: "primary.main",
            outlineOffset: 2,
          },
        }),
      }}
    >
      <Typography
        variant="caption"
        color="primary.main"
        sx={{ mt: 0.05, minWidth: 22, fontWeight: 800, flexShrink: 0 }}
      >
        [{displayNumber}]
      </Typography>
      <Box sx={{ minWidth: 0, flex: 1 }}>
        <Typography
          variant="caption"
          sx={{ fontWeight: 700, display: "block", lineHeight: 1.4 }}
          title={source.title}
        >
          {source.title}
        </Typography>
        {source.snippet && (
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
              lineHeight: 1.5,
              mt: 0.25,
            }}
          >
            &ldquo;{source.snippet}&rdquo;
          </Typography>
        )}
        {source.sourceLocator && (
          <Typography
            variant="caption"
            color="text.disabled"
            sx={{ display: "block", mt: 0.25 }}
          >
            {Array.isArray(source.sourceLocator)
              ? source.sourceLocator.join(" · ")
              : source.sourceLocator}
          </Typography>
        )}
      </Box>

      {/* Preview button — only rendered when a valid document ID exists */}
      {previewableId && typeof onPreviewDocument === "function" && (
        <Tooltip title="Xem trước tài liệu">
          <span>
            <IconButton
              size="small"
              onClick={handlePreviewClick}
              disabled={isPreviewLoading}
              aria-label={`Xem trước ${source.title || "tài liệu"}`}
              sx={{
                flexShrink: 0,
                alignSelf: "center",
                p: 0.5,
                color: "text.secondary",
                "&:hover": { color: "primary.main" },
              }}
            >
              {isPreviewLoading ? (
                <CircularProgress size={14} thickness={4} />
              ) : (
                <VisibilityOutlined sx={{ fontSize: 15 }} />
              )}
            </IconButton>
          </span>
        </Tooltip>
      )}
    </Stack>
  );
}

export default function ChatSources({
  sources = [],
  onSourceSelect,
  onPreviewDocument,
  loadingId,
}) {
  const [expanded, setExpanded] = useState(false);

  if (!sources || sources.length === 0) return null;

  const visibleSources = expanded ? sources : sources.slice(0, MAX_VISIBLE_SOURCES);
  const hasMore = sources.length > MAX_VISIBLE_SOURCES;

  return (
    <Box sx={{ mt: 1.4, pt: 1.25, borderTop: "1px solid", borderColor: "divider" }}>
      <Stack
        direction="row"
        spacing={0.75}
        sx={{ mb: 0.75, alignItems: "center" }}
      >
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ fontWeight: 700 }}
        >
          Nguồn tham khảo
        </Typography>
        <Tooltip title={`${sources.length} tài liệu`}>
          <Chip
            label={sources.length}
            size="small"
            sx={{
              height: 18,
              fontSize: "0.68rem",
              fontWeight: 700,
              "& .MuiChip-label": { px: 0.75 },
            }}
          />
        </Tooltip>
      </Stack>

      <Stack spacing={0.75}>
        {visibleSources.map((source, index) => (
          <SourceItem
            key={`${getChatSourceDocumentId(source) || "source"}-${getChatSourceNumber(source, index)}`}
            source={source}
            index={index}
            onSourceSelect={onSourceSelect}
            onPreviewDocument={onPreviewDocument}
            loadingId={loadingId}
          />
        ))}
      </Stack>

      {hasMore && (
        <Button
          type="button"
          size="small"
          onClick={() => setExpanded((v) => !v)}
          startIcon={
            expanded ? (
              <ExpandLessRounded sx={{ fontSize: "1rem" }} />
            ) : (
              <ExpandMoreRounded sx={{ fontSize: "1rem" }} />
            )
          }
          sx={{
            mt: 0.75,
            px: 0.5,
            minWidth: 0,
            fontSize: "0.72rem",
          }}
        >
          {expanded
            ? "Thu gọn"
            : `Xem thêm ${sources.length - MAX_VISIBLE_SOURCES} nguồn`}
        </Button>
      )}
    </Box>
  );
}
