import { Box, Button, Chip, Stack, Tooltip, Typography } from "@mui/material";
import DescriptionOutlined from "@mui/icons-material/DescriptionOutlined";
import FolderOpenOutlined from "@mui/icons-material/FolderOpenOutlined";
import LibraryBooksOutlined from "@mui/icons-material/LibraryBooksOutlined";
import { isLibraryContext } from "../chatContext.js";

export default function ChatContextBar({
  chatContext,
  selectedDocuments = [],
  onRemove,
  onOpenDocuments,
}) {
  if (!isLibraryContext(chatContext)) return null;

  return (
    <Stack
      direction="row"
      gap={0.75}
      sx={{
        alignItems: "center",
        width: "100%",
        minWidth: 0,
        pb: 0.9,
        overflowX: "auto",
        scrollbarWidth: "none",
        "&::-webkit-scrollbar": { display: "none" },
      }}
    >
      <LibraryBooksOutlined sx={{ flexShrink: 0, fontSize: 17, color: "text.secondary" }} />
      <Typography
        variant="caption"
        color="text.secondary"
        sx={{ flexShrink: 0, fontWeight: 700 }}
      >
        {selectedDocuments.length === 0
          ? "Toàn bộ thư viện"
          : `${selectedDocuments.length} tài liệu`}
      </Typography>

      <Typography component="span" aria-hidden="true" color="text.disabled">
        ·
      </Typography>
      <Typography
        variant="caption"
        color="text.secondary"
        sx={{ flexShrink: 0, display: { xs: "none", sm: "block" } }}
      >
        Áp dụng cho câu hỏi tiếp theo
      </Typography>

      {selectedDocuments.map((document) => (
        <Tooltip key={document.id} title={document.title}>
          <Chip
            icon={<DescriptionOutlined sx={{ fontSize: "0.95rem !important" }} />}
            label={document.title}
            onDelete={() => onRemove?.(document.id)}
            size="small"
            variant="outlined"
            sx={{
              flexShrink: 0,
              maxWidth: 180,
              height: 28,
              borderRadius: 1.5,
              fontSize: "0.72rem",
              "& .MuiChip-label": {
                overflow: "hidden",
                textOverflow: "ellipsis",
              },
            }}
          />
        </Tooltip>
      ))}

      <Box sx={{ flex: 1, minWidth: 4 }} />
      <Button
        size="small"
        color="inherit"
        startIcon={<FolderOpenOutlined />}
        onClick={onOpenDocuments}
        sx={{
          flexShrink: 0,
          minHeight: 32,
          px: 1,
          color: "text.secondary",
          fontSize: "0.72rem",
        }}
      >
        Chọn tài liệu
      </Button>
    </Stack>
  );
}
