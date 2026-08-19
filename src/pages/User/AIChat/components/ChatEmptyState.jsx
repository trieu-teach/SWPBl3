import { Box, Card, Chip, Stack, Typography } from "@mui/material";
import AutoAwesomeOutlined from "@mui/icons-material/AutoAwesomeOutlined";
import { isLibraryContext } from "../chatContext.js";

const DOC_SUGGESTIONS = [
  "Tóm tắt nội dung chính",
  "Giải thích các khái niệm khó",
  "Gợi ý câu hỏi ôn tập",
];

const LIBRARY_SUGGESTIONS = [
  "Tóm tắt các tài liệu gần đây",
  "Tìm các khái niệm chính",
  "Gợi ý lộ trình học tập",
];

export default function ChatEmptyState({ chatContext }) {
  const isLibrary = isLibraryContext(chatContext);
  
  const title = isLibrary ? "Thư viện của bạn" : "Bắt đầu hỏi AI";
  const description = isLibrary
    ? "Hỏi AI về các tài liệu trong thư viện của bạn. AI sẽ tìm kiếm và tổng hợp thông tin từ toàn bộ thư viện."
    : "Nhập câu hỏi để nhận gợi ý học tập, tóm tắt nội dung hoặc giải thích khái niệm theo cách dễ hiểu hơn.";
  
  const suggestions = isLibrary ? LIBRARY_SUGGESTIONS : DOC_SUGGESTIONS;

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
          {title}
        </Typography>
        <Typography color="text.secondary" sx={{ maxWidth: 560, mx: "auto", mb: 3 }}>
          {description}
        </Typography>

        <Stack direction="row" gap={1} justifyContent="center" flexWrap="wrap">
          {suggestions.map((suggestion) => (
            <Chip key={suggestion} label={suggestion} variant="outlined" />
          ))}
        </Stack>
      </Card>
    </Box>
  );
}
