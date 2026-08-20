import { Button, Stack, Typography } from "@mui/material";
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
      gap={1.5}
      sx={{
        width: "100%",
        px: { xs: 2, sm: 2.5, md: 3 },
        py: { xs: 1.25, sm: 1.5 },
        minHeight: { sm: 68 },
        flexShrink: 0,
        borderBottom: "1px solid",
        borderColor: "divider",
        bgcolor: "background.paper",
      }}
    >
      <Stack spacing={0.35} sx={{ minWidth: 0, flex: "1 1 360px" }}>
        <Typography
          sx={{ fontWeight: 800, fontSize: "1.05rem", lineHeight: 1.3 }}
        >
          {inLibraryMode ? "Thư viện của bạn" : "Trợ lý tài liệu"}
        </Typography>
        {inDocumentMode && chatContext.document?.title && (
          <Stack direction="row" spacing={0.5} alignItems="center" sx={{ mt: 0.25 }}>
            <DescriptionOutlined
              sx={{ fontSize: "0.85rem", color: "text.secondary" }}
            />
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
            sx={{ fontSize: "0.78rem", lineHeight: 1.45 }}
          >
            Chọn tài liệu bên trái để thu hẹp phạm vi câu hỏi tiếp theo.
          </Typography>
        )}
        {!inDocumentMode && !inLibraryMode && (
          <Typography
            color="text.secondary"
            sx={{ fontSize: "0.76rem", display: { xs: "none", sm: "block" } }}
          >
            Trợ lý học tập giúp giải thích, tóm tắt và gợi ý cách ôn bài.
          </Typography>
        )}
      </Stack>
      {inLibraryMode && (
        <Stack
          direction="row"
          alignItems="center"
          justifyContent={{ xs: "flex-start", sm: "flex-end" }}
          flexWrap="wrap"
          gap={0.75}
          sx={{ flexShrink: 0, ml: { sm: "auto" } }}
        >
          <Button
            size="small"
            startIcon={<FolderOpenOutlined />}
            onClick={onOpenDocuments}
            sx={{
              display: { xs: "inline-flex", lg: "none" },
              minHeight: 36,
            }}
          >
            Tài liệu
          </Button>
          <Button
            size="small"
            variant="outlined"
            startIcon={<AddCommentOutlined />}
            onClick={onNewChat}
            sx={{ minHeight: 36, px: 1.5, fontWeight: 700 }}
          >
            Chat mới
          </Button>
          <Button
            size="small"
            startIcon={<HistoryOutlined />}
            onClick={onOpenHistory}
            sx={{ minHeight: 36, color: "text.secondary", px: 1.25 }}
          >
            Lịch sử
          </Button>
        </Stack>
      )}
    </Stack>
  );
}
