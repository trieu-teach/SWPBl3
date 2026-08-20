import { Box, Chip, Stack, Tooltip, Typography } from "@mui/material";
import DescriptionOutlined from "@mui/icons-material/DescriptionOutlined";
import LibraryBooksOutlined from "@mui/icons-material/LibraryBooksOutlined";
import { isDocumentContext, isLibraryContext } from "../chatContext.js";

export default function ChatContextBar({
  chatContext,
  selectedDocuments = [],
  onRemove,
}) {
  // In ASK_THIS_DOCUMENT mode, the header already shows the document.
  if (isDocumentContext(chatContext)) return null;
  
  // Only render for ASK_MY_LIBRARY or when we don't have a specific context but want to default to library visually
  if (!isLibraryContext(chatContext)) return null;

  return (
    <Box
      sx={{
        px: { xs: 2, sm: 2.5, md: 3 },
        py: 0.7,
        flexShrink: 0,
        borderBottom: "1px solid",
        borderColor: "divider",
        bgcolor: "background.paper",
      }}
    >
      <Stack
        direction="row"
        alignItems="center"
        flexWrap="wrap"
        gap={0.75}
      >
        <Stack direction="row" spacing={0.75} alignItems="center">
          <LibraryBooksOutlined
            sx={{ fontSize: "1rem", color: "text.secondary" }}
          />
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ fontWeight: 750, flexShrink: 0 }}
          >
            {selectedDocuments.length === 0
              ? "Toàn bộ thư viện"
              : `${selectedDocuments.length} tài liệu đã chọn`}
          </Typography>
        </Stack>

        <Typography
          component="span"
          aria-hidden="true"
          color="text.disabled"
          sx={{ fontSize: "0.72rem", lineHeight: 1 }}
        >
          ·
        </Typography>

        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ opacity: 0.8 }}
        >
          Áp dụng cho câu hỏi tiếp theo.
        </Typography>

        {selectedDocuments.length > 0 && (
          <Stack
            direction="row"
            gap={0.75}
            flexWrap="wrap"
            sx={{
              display: { xs: "flex", lg: "none" },
              flexBasis: { xs: "100%", sm: "auto" },
            }}
          >
            {selectedDocuments.map((doc) => (
              <Tooltip key={doc.id} title={doc.title}>
                <Chip
                  icon={
                    <DescriptionOutlined sx={{ fontSize: "0.95rem !important" }} />
                  }
                  label={doc.title}
                  onDelete={() => onRemove(doc.id)}
                  size="small"
                  variant="outlined"
                  sx={{ maxWidth: 220, fontWeight: 600, fontSize: "0.75rem" }}
                />
              </Tooltip>
            ))}
          </Stack>
        )}
      </Stack>
    </Box>
  );
}
