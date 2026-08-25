import {
  Box,
  Button,
  Chip,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
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
  onClearDeepDiveScope,
  selectionLocked = false,
  scopeTransitionLocked = false,
}) {
  // In ASK_THIS_DOCUMENT mode, the header already shows the document.
  if (isDocumentContext(chatContext)) return null;
  
  if (!isLibraryContext(chatContext)) return null;
  const scope = getLibraryScopePresentation(chatContext);
  const scopeDescription =
    scope.type === "documents"
        ? "AI chỉ dùng các tài liệu đã chọn."
        : scope.type === "subjects"
          ? "AI đang tìm kiếm và tổng hợp tài liệu trong các môn học đã chọn."
          : "AI dùng toàn bộ tài liệu cá nhân và đã lưu còn khả dụng trong thư viện.";

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
            {scope.type === "documents" ? `Hỏi sâu · ${scope.label}` : scope.label}
          </Typography>
        </Stack>

        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ opacity: 0.85 }}
        >
          {scopeDescription}
        </Typography>

        {scope.type === "documents" &&
          typeof onClearDeepDiveScope === "function" && (
            <Button
              type="button"
              size="small"
              onClick={onClearDeepDiveScope}
              disabled={scopeTransitionLocked}
              sx={{ ml: { sm: "auto" }, px: 0.5, minWidth: 0, flexShrink: 0 }}
            >
              Quay lại toàn thư viện
            </Button>
          )}

        {selectedDocuments.length > 0 && (
          <Stack
            direction="row"
            sx={{ display: { xs: "flex", lg: "none" }, gap: 0.75, flexWrap: "wrap" }}
          >
            {selectedDocuments.map((doc) => {
              const tooltip = selectionLocked
                ? "Hãy tạo Chat mới để thay đổi tài liệu."
                : doc.available === false
                  ? doc.unavailableReason || "Tài liệu không còn khả dụng"
                  : doc.title;

              return (
                <Tooltip key={doc.id} title={tooltip}>
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
              );
            })}
          </Stack>
        )}
      </Stack>
    </Box>
  );
}
