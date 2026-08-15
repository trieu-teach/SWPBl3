import { Box, Chip, Stack, Tooltip, Typography } from "@mui/material";
import SmartToyOutlined from "@mui/icons-material/SmartToyOutlined";
import LibraryBooksOutlined from "@mui/icons-material/LibraryBooksOutlined";

export default function ChatHeader({ selectedDocuments = [], onOpenPicker }) {
  const count = selectedDocuments.length;

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
          <Typography color="text.secondary" sx={{ fontSize: "0.9rem" }}>
            Trợ lý học tập giúp giải thích, tóm tắt và gợi ý cách ôn bài.
          </Typography>
        </Box>
      </Stack>

      <Tooltip
        title={
          count > 0
            ? `Đang dùng ${count} tài liệu làm ngữ cảnh`
            : "Chọn tài liệu để AI trả lời chính xác hơn"
        }
      >
        <Chip
          icon={<LibraryBooksOutlined />}
          label={count > 0 ? `${count} tài liệu` : "Chọn tài liệu"}
          onClick={onOpenPicker}
          color={count > 0 ? "primary" : "default"}
          variant={count > 0 ? "filled" : "outlined"}
          size="small"
          clickable
          sx={{ fontWeight: 700 }}
        />
      </Tooltip>
    </Stack>
  );
}
