import { Box, IconButton, Stack, Typography } from "@mui/material";
import SmartToyOutlined from "@mui/icons-material/SmartToyOutlined";
import DescriptionOutlined from "@mui/icons-material/DescriptionOutlined";
import MenuOpenRounded from "@mui/icons-material/MenuOpenRounded";
import { isDocumentContext, isLibraryContext } from "../chatContext.js";

export default function ChatHeader({
  chatContext,
  selectedDocuments = [],
  onOpenSidebar,
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
        py: 2.5,
        borderBottom: "1px solid",
        borderColor: "divider",
      }}
    >
      <Stack direction="row" spacing={1.5} alignItems="center" sx={{ minWidth: 0 }}>
        {/* Mobile Sidebar Toggle */}
        <IconButton
          onClick={onOpenSidebar}
          sx={{ display: { md: "none" }, mr: -0.5 }}
          aria-label="Mở danh sách hội thoại"
        >
          <MenuOpenRounded />
        </IconButton>

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

    </Stack>
  );
}
