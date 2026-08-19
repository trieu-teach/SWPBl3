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
        px: { xs: 2, sm: 3 },
        py: 1.25,
        borderBottom: "1px solid",
        borderColor: "divider",
        bgcolor: "action.hover",
      }}
    >
      <Stack
        direction={{ xs: "column", sm: "row" }}
        alignItems={{ xs: "flex-start", sm: "center" }}
        spacing={1}
        sx={{ gap: 0.75 }}
      >
        <Stack direction="row" spacing={0.75} alignItems="center">
          <LibraryBooksOutlined sx={{ fontSize: "1rem", color: "text.secondary" }} />
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ fontWeight: 700, flexShrink: 0 }}
          >
            {selectedDocuments.length === 0
              ? "Toàn bộ thư viện"
              : `${selectedDocuments.length} tài liệu đã chọn`}
          </Typography>
        </Stack>

        <Typography variant="caption" color="text.secondary">
          Phạm vi áp dụng cho câu hỏi tiếp theo.
        </Typography>

        {selectedDocuments.length > 0 && (
          <Stack
            direction="row"
            gap={0.75}
            flexWrap="wrap"
            sx={{ display: { xs: "flex", lg: "none" } }}
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
