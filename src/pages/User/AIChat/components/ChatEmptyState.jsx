import { Box, Card, Chip, Stack, Typography } from "@mui/material";
import AutoAwesomeOutlined from "@mui/icons-material/AutoAwesomeOutlined";
const CHAT_SUGGESTIONS = [
  "Tóm tắt nội dung chính của một chương học",
  "Gợi ý kế hoạch ôn tập trong 7 ngày",
  "Giải thích một khái niệm khó hiểu",
];
export default function ChatEmptyState() {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        height: "100%",
        width: "100%",
        py: 2,
      }}
    >
    <Card
      variant="outlined"
      sx={{
        maxWidth: 720,
        width: "100%",
        mx: "auto",
        px: { xs: 2.5, sm: 4 },
        py: { xs: 4, sm: 5 },
        textAlign: "center",
        borderRadius: 3,
      }}
    >
      <Box
        sx={{
          width: 64,
          height: 64,
          display: "grid",
          placeItems: "center",
          mx: "auto",
          mb: 2,
          borderRadius: 3,
          bgcolor: "action.hover",
          color: "primary.main",
        }}
      >
        <AutoAwesomeOutlined fontSize="large" />
      </Box>
      <Typography variant="h5" sx={{ fontWeight: 800, mb: 1 }}>
        Bắt đầu hỏi AI
      </Typography>
      <Typography color="text.secondary" sx={{ maxWidth: 560, mx: "auto", mb: 3 }}>
        Nhập câu hỏi để nhận gợi ý học tập, tóm tắt nội dung hoặc giải thích khái
        niệm theo cách dễ hiểu hơn.
      </Typography>

      <Stack direction="row" gap={1} justifyContent="center" flexWrap="wrap">
        {CHAT_SUGGESTIONS.map((suggestion) => (
          <Chip key={suggestion} label={suggestion} variant="outlined" />
        ))}
      </Stack>
    </Card>
    </Box>
  );
}
