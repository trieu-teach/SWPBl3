import { Box, Button, Chip, Stack, Tooltip, Typography } from "@mui/material";
import ExpandMoreRounded from "@mui/icons-material/ExpandMoreRounded";
import ExpandLessRounded from "@mui/icons-material/ExpandLessRounded";
import { useState } from "react";

const MAX_VISIBLE_SOURCES = 2;

function SourceItem({ source, index, onSourceSelect }) {
  const isSelectable = typeof onSourceSelect === "function";

  return (
    <Stack
      component={isSelectable ? "button" : "div"}
      type={isSelectable ? "button" : undefined}
      direction="row"
      spacing={1}
      alignItems="flex-start"
      onClick={
        isSelectable ? () => onSourceSelect(source) : undefined
      }
      sx={{
        px: 1,
        py: 0.85,
        borderRadius: 1.5,
        bgcolor: "action.hover",
        border: 0,
        ...(isSelectable && {
          width: "100%",
          color: "inherit",
          font: "inherit",
          textAlign: "left",
          cursor: "pointer",
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
        [{index + 1}]
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
        {Array.isArray(source.sourceLocator) && source.sourceLocator.length > 0 && (
          <Typography
            variant="caption"
            color="text.disabled"
            sx={{ display: "block", mt: 0.25 }}
          >
            {source.sourceLocator.join(" · ")}
          </Typography>
        )}
      </Box>
    </Stack>
  );
}

export default function ChatSources({ sources = [], onSourceSelect }) {
  const [expanded, setExpanded] = useState(false);

  if (!sources || sources.length === 0) return null;

  const visibleSources = expanded ? sources : sources.slice(0, MAX_VISIBLE_SOURCES);
  const hasMore = sources.length > MAX_VISIBLE_SOURCES;

  return (
    <Box sx={{ mt: 1.4, pt: 1.25, borderTop: "1px solid", borderColor: "divider" }}>
      <Stack
        direction="row"
        alignItems="center"
        spacing={0.75}
        sx={{ mb: 0.75 }}
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
            key={source.citationId || `source-${index}`}
            source={source}
            index={index}
            onSourceSelect={onSourceSelect}
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
