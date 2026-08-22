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
      sx={{
        alignItems: { xs: "flex-start", sm: "center" },
        justifyContent: "space-between",
        gap: 1,
        px: { xs: 2, sm: 3 },
        py: 1.25,
        minHeight: { sm: 62 },
        flexShrink: 0,
        borderBottom: "1px solid",
        borderColor: "divider",
      }}
    >
      <Stack spacing={0.2} sx={{ minWidth: 0 }}>
        <Typography sx={{ fontWeight: 800, fontSize: "1rem", lineHeight: 1.3 }}>
          {inLibraryMode ? "Thư viện của bạn" : "Trợ lý tài liệu"}
        </Typography>
        {inDocumentMode && chatContext.document?.title && (
          <Stack direction="row" spacing={0.5} sx={{ mt: 0.25, alignItems: "center" }}>
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
            sx={{ fontSize: "0.76rem", display: { xs: "none", sm: "block" } }}
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
        <Stack direction="row" spacing={0.75} sx={{ flexWrap: "wrap" }}>
          <Button
            size="small"
            startIcon={<FolderOpenOutlined />}
            onClick={onOpenDocuments}
            sx={{ display: { xs: "inline-flex", lg: "none" }, minHeight: 36 }}
          >
            Tài liệu
          </Button>
          <Button
            size="small"
            variant="outlined"
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
