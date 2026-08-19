import { Box, Button, Stack, Typography } from "@mui/material";
import SmartToyOutlined from "@mui/icons-material/SmartToyOutlined";
import DescriptionOutlined from "@mui/icons-material/DescriptionOutlined";
import AddCommentOutlined from "@mui/icons-material/AddCommentOutlined";
import FolderOpenOutlined from "@mui/icons-material/FolderOpenOutlined";
import HistoryOutlined from "@mui/icons-material/HistoryOutlined";
import { isDocumentContext, isLibraryContext } from "../chatContext.js";

export default function ChatHeader({
  chatContext,
  onOpenDocuments,
  onNewChat,
  onOpenHistory,
}) {
  const inDocumentMode = isDocumentContext(chatContext);
  const inLibraryMode = isLibraryContext(chatContext);

  return (
    <Stack
      direction={{ xs: "column", sm: "row" }}
      alignItems={{ xs: "flex-start", sm: "center" }}
      justifyContent="space-between"
      gap={2}
      sx={{
        px: { xs: 2, sm: 3 },
        py: 2,
        borderBottom: "1px solid",
        borderColor: "divider",
      }}
    >
      <Stack direction="row" spacing={1.5} alignItems="center" sx={{ minWidth: 0 }}>
        <Box
          sx={{
            width: 44,
            height: 44,
            borderRadius: 2,
            display: "grid",
            placeItems: "center",
            color: "primary.main",
            bgcolor: "action.hover",
            flexShrink: 0,
          }}
        >
          <SmartToyOutlined />
        </Box>
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="h5" sx={{ fontWeight: 800, lineHeight: 1.2 }}>
            Hỏi AI
          </Typography>
          {inDocumentMode && chatContext.document?.title && (
            <Stack direction="row" spacing={0.5} alignItems="center" sx={{ mt: 0.25 }}>
              <DescriptionOutlined sx={{ fontSize: "0.85rem", color: "text.secondary" }} />
              <Typography
                color="text.secondary"
                sx={{
                  fontSize: "0.85rem",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  maxWidth: { xs: 180, sm: 320 },
                }}
              >
                {chatContext.document.title}
              </Typography>
            </Stack>
          )}
          {inLibraryMode && (
            <Typography
              color="text.secondary"
              sx={{ fontSize: "0.85rem", display: { xs: "none", sm: "block" } }}
            >
              Thư viện của bạn
            </Typography>
          )}
          {!inDocumentMode && !inLibraryMode && (
            <Typography
              color="text.secondary"
              sx={{ fontSize: "0.9rem", display: { xs: "none", sm: "block" } }}
            >
              Trợ lý học tập giúp giải thích, tóm tắt và gợi ý cách ôn bài.
            </Typography>
          )}
        </Box>
      </Stack>
      {inLibraryMode && (
        <Stack direction="row" spacing={0.75} flexWrap="wrap">
          <Button
            size="small"
            startIcon={<FolderOpenOutlined />}
            onClick={onOpenDocuments}
            sx={{ display: { xs: "inline-flex", lg: "none" } }}
          >
            Tài liệu
          </Button>
          <Button
            size="small"
            startIcon={<AddCommentOutlined />}
            onClick={onNewChat}
          >
            Chat mới
          </Button>
          <Button
            size="small"
            startIcon={<HistoryOutlined />}
            onClick={onOpenHistory}
          >
            Lịch sử
          </Button>
        </Stack>
      )}
    </Stack>
  );
}
