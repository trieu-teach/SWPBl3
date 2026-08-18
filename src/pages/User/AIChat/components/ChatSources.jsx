import { Box, Chip, Stack, Tooltip, Typography } from "@mui/material";
import DescriptionOutlined from "@mui/icons-material/DescriptionOutlined";
import ExpandMoreRounded from "@mui/icons-material/ExpandMoreRounded";
import ExpandLessRounded from "@mui/icons-material/ExpandLessRounded";
import { useState } from "react";

const MAX_VISIBLE_SOURCES = 2;

function SourceItem({ source }) {
  return (
    <Stack
      direction="row"
      spacing={1}
      alignItems="flex-start"
      sx={{
        p: 1,
        borderRadius: 1.5,
        bgcolor: "action.hover",
        border: "1px solid",
        borderColor: "divider",
      }}
    >
      <DescriptionOutlined
        sx={{ fontSize: "1rem", color: "text.secondary", mt: 0.15, flexShrink: 0 }}
      />
      <Box sx={{ minWidth: 0, flex: 1 }}>
        <Typography
          variant="caption"
          sx={{ fontWeight: 700, display: "block", lineHeight: 1.4 }}
          noWrap
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
        {source.sourceLocator?.length > 0 && Array.isArray(source.sourceLocator) && (
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

export default function ChatSources({ sources = [] }) {
  const [expanded, setExpanded] = useState(false);

  if (!sources || sources.length === 0) return null;

  const visibleSources = expanded ? sources : sources.slice(0, MAX_VISIBLE_SOURCES);
  const hasMore = sources.length > MAX_VISIBLE_SOURCES;

  return (
    <Box sx={{ mt: 1.25 }}>
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
          <SourceItem key={source.citationId || `source-${index}`} source={source} />
        ))}
      </Stack>

      {hasMore && (
        <Stack
          direction="row"
          alignItems="center"
          spacing={0.5}
          onClick={() => setExpanded((v) => !v)}
          sx={{
            mt: 0.75,
            cursor: "pointer",
            color: "primary.main",
            width: "fit-content",
            "&:hover": { opacity: 0.8 },
          }}
        >
          {expanded ? (
            <ExpandLessRounded sx={{ fontSize: "1rem" }} />
          ) : (
            <ExpandMoreRounded sx={{ fontSize: "1rem" }} />
          )}
          <Typography variant="caption" sx={{ fontWeight: 600 }}>
            {expanded
              ? "Thu gọn"
              : `Xem thêm ${sources.length - MAX_VISIBLE_SOURCES} nguồn`}
          </Typography>
        </Stack>
      )}
    </Box>
  );
}
