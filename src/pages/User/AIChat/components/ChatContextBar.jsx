import { Box, Chip, Stack, Tooltip, Typography } from "@mui/material";
import AddOutlined from "@mui/icons-material/AddOutlined";
import DescriptionOutlined from "@mui/icons-material/DescriptionOutlined";
import LibraryBooksOutlined from "@mui/icons-material/LibraryBooksOutlined";
import { isDocumentContext, isLibraryContext } from "../chatContext.js";

export default function ChatContextBar({
  chatContext,
  selectedDocuments = [],
  onRemove,
  onOpenPicker,
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
        direction="row"
        alignItems="center"
        spacing={1}
        sx={{ flexWrap: "wrap", gap: 0.75 }}
      >
        <Stack direction="row" spacing={0.5} alignItems="center" sx={{ mr: 1 }}>
          <LibraryBooksOutlined sx={{ fontSize: "1rem", color: "text.secondary" }} />
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ fontWeight: 600, flexShrink: 0 }}
          >
            Thư viện của bạn
          </Typography>
        </Stack>

        {selectedDocuments.map((doc) => (
          <Tooltip key={doc.id} title={doc.title}>
            <Chip
              icon={<DescriptionOutlined sx={{ fontSize: "0.95rem !important" }} />}
              label={doc.title}
              onDelete={() => onRemove(doc.id)}
              size="small"
              variant="outlined"
              sx={{
                maxWidth: { xs: 160, sm: 240 },
                fontWeight: 600,
                fontSize: "0.78rem",
                "& .MuiChip-label": {
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                },
              }}
            />
          </Tooltip>
        ))}

        <Tooltip title={selectedDocuments.length > 0 ? "Thêm tài liệu lọc" : "Lọc theo tài liệu cụ thể"}>
          <Chip
            icon={<AddOutlined sx={{ fontSize: "0.95rem !important" }} />}
            label={selectedDocuments.length > 0 ? "Thêm" : "Lọc kết quả"}
            onClick={onOpenPicker}
            size="small"
            variant="outlined"
            color="primary"
            clickable
            sx={{ fontWeight: 600, fontSize: "0.78rem" }}
          />
        </Tooltip>
      </Stack>
    </Box>
  );
}
