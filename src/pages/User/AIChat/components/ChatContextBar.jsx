import { Box, Chip, Stack, Tooltip, Typography } from "@mui/material";
import DescriptionOutlined from "@mui/icons-material/DescriptionOutlined";
import LibraryBooksOutlined from "@mui/icons-material/LibraryBooksOutlined";
import WarningAmberRounded from "@mui/icons-material/WarningAmberRounded";
import {
  getLibraryScopePresentation,
  isDocumentContext,
  isLibraryContext,
} from "../chatContext.js";

export default function ChatContextBar({
  chatContext,
  selectedDocuments = [],
  onRemove,
  selectionLocked = false,
}) {
  // In ASK_THIS_DOCUMENT mode, the header already shows the document.
  if (isDocumentContext(chatContext)) return null;
  
  // Only render for ASK_MY_LIBRARY or when we don't have a specific context but want to default to library visually
  if (!isLibraryContext(chatContext)) return null;
  const scope = getLibraryScopePresentation(chatContext);

  return (
    <Box
      sx={{
        px: { xs: 2, sm: 3 },
        py: 0.8,
        flexShrink: 0,
        borderBottom: "1px solid",
        borderColor: "divider",
        bgcolor: "background.paper",
      }}
    >
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={0.75}
        sx={{ alignItems: { xs: "flex-start", sm: "center" }, gap: 0.75 }}
      >
        <Stack direction="row" spacing={0.75} sx={{ alignItems: "center" }}>
          <LibraryBooksOutlined sx={{ fontSize: "1rem", color: "text.secondary" }} />
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ fontWeight: 750, flexShrink: 0 }}
          >
            {scope.label}
          </Typography>
        </Stack>

        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ opacity: 0.85 }}
        >
          {selectionLocked
            ? "Phạm vi được cố định trong cuộc trò chuyện này."
            : "Phạm vi sẽ được cố định khi tạo cuộc trò chuyện."}
        </Typography>

        {selectedDocuments.length > 0 && (
          <Stack
            direction="row"
            sx={{ display: { xs: "flex", lg: "none" }, gap: 0.75, flexWrap: "wrap" }}
          >
            {selectedDocuments.map((doc) => (
              <Tooltip
                key={doc.id}
                title={
                  doc.available === false
                    ? doc.unavailableReason || "Tài liệu không còn khả dụng"
                    : doc.title
                }
              >
                <Chip
                  icon={
                    doc.available === false
                      ? <WarningAmberRounded sx={{ fontSize: "0.95rem !important" }} />
                      : <DescriptionOutlined sx={{ fontSize: "0.95rem !important" }} />
                  }
                  label={doc.title}
                  onDelete={selectionLocked ? undefined : () => onRemove(doc.id)}
                  size="small"
                  variant="outlined"
                  color={doc.available === false ? "error" : "default"}
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
