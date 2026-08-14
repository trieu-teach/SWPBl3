import { Box, Card, Chip, Stack, Typography } from "@mui/material";
import AutoAwesomeOutlined from "@mui/icons-material/AutoAwesomeOutlined";
import { mockEmptyChatSuggestions } from "../mocks/chat.mock.js";

export default function ChatEmptyState() {
  return (
    <Card
      variant="outlined"
      sx={{
        maxWidth: 720,
        mx: "auto",
        my: { xs: 3, md: 8 },
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
        {mockEmptyChatSuggestions.map((suggestion) => (
          <Chip key={suggestion} label={suggestion} variant="outlined" />
        ))}
      </Stack>
    </Card>
  );
}
