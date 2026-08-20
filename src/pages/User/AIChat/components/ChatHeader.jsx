import { Box, Button, IconButton, Stack, Tooltip, Typography } from "@mui/material";
import AddCommentOutlined from "@mui/icons-material/AddCommentOutlined";
import ChatBubbleOutlineOutlined from "@mui/icons-material/ChatBubbleOutlineOutlined";
import FolderOpenOutlined from "@mui/icons-material/FolderOpenOutlined";
import SmartToyOutlined from "@mui/icons-material/SmartToyOutlined";

export default function ChatHeader({
  onOpenDocuments,
  onNewChat,
  onOpenHistory,
  selectedDocumentCount = 0,
}) {
  const documentLabel =
    selectedDocumentCount > 0
      ? `Tài liệu (${selectedDocumentCount})`
      : "Tài liệu";

  return (
    <Stack
      component="header"
      direction="row"
      gap={1.5}
      sx={{
        alignItems: "center",
        justifyContent: "space-between",
        width: "100%",
        minHeight: 68,
        px: { xs: 1.5, sm: 2.5 },
        py: 1.25,
        flexShrink: 0,
        borderBottom: "1px solid",
        borderColor: "divider",
        bgcolor: "background.paper",
      }}
    >
      <Stack
        direction="row"
        spacing={1.25}
        sx={{ minWidth: 0, alignItems: "center" }}
      >
        <Tooltip title="Mở danh sách cuộc trò chuyện">
          <IconButton
            onClick={onOpenHistory}
            aria-label="Mở danh sách cuộc trò chuyện"
            sx={{ display: { xs: "inline-flex", lg: "none" }, width: 40, height: 40 }}
          >
            <ChatBubbleOutlineOutlined />
          </IconButton>
        </Tooltip>

        <Box
          sx={{
            width: 38,
            height: 38,
            flexShrink: 0,
            display: { xs: "none", sm: "grid" },
            placeItems: "center",
            borderRadius: 2,
            bgcolor: "action.selected",
            color: "primary.main",
          }}
        >
          <SmartToyOutlined sx={{ fontSize: 21 }} />
        </Box>

        <Box sx={{ minWidth: 0 }}>
          <Typography
            noWrap
            sx={{ fontWeight: 800, fontSize: { xs: "0.95rem", sm: "1.02rem" }, lineHeight: 1.35 }}
          >
            Trợ lý học tập AI
          </Typography>
          <Typography
            noWrap
            color="text.secondary"
            sx={{ display: { xs: "none", sm: "block" }, fontSize: "0.74rem" }}
          >
            Hỏi đáp dựa trên tài liệu học tập của bạn
          </Typography>
        </Box>
      </Stack>

      <Stack
        direction="row"
        spacing={0.75}
        sx={{ flexShrink: 0, alignItems: "center" }}
      >
        <Button
          size="small"
          color="inherit"
          startIcon={<FolderOpenOutlined />}
          onClick={onOpenDocuments}
          aria-label={`Mở tài liệu, ${selectedDocumentCount} tài liệu đã chọn`}
          sx={{
            minHeight: 40,
            color: "text.secondary",
            px: { xs: 1, sm: 1.25 },
            "& .MuiButton-startIcon": { mr: { xs: 0, sm: 0.75 } },
          }}
        >
          <Box component="span" sx={{ display: { xs: "none", sm: "inline" } }}>
            {documentLabel}
          </Box>
        </Button>
        <Button
          size="small"
          variant="outlined"
          startIcon={<AddCommentOutlined />}
          onClick={onNewChat}
          aria-label="Tạo cuộc trò chuyện mới"
          sx={{
            minHeight: 40,
            px: { xs: 1, sm: 1.5 },
            fontWeight: 700,
            "& .MuiButton-startIcon": { mr: { xs: 0, sm: 0.75 } },
          }}
        >
          <Box component="span" sx={{ display: { xs: "none", sm: "inline" } }}>
            Chat mới
          </Box>
        </Button>
      </Stack>
    </Stack>
  );
}
