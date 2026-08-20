import { Box, Chip, Stack, Typography } from "@mui/material";
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
    ? "Hỏi AI về các tài liệu trong thư viện của bạn."
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
        py: { xs: 4, sm: 6 },
        px: 2,
      }}
    >
      <Stack
        alignItems="center"
        sx={{
          maxWidth: 620,
          width: "100%",
          mx: "auto",
          textAlign: "center",
        }}
      >
        <Box
          sx={{
            width: 44,
            height: 44,
            display: "grid",
            placeItems: "center",
            mx: "auto",
            mb: 1.5,
            borderRadius: 2,
            bgcolor: "action.hover",
            color: "primary.main",
          }}
        >
          <AutoAwesomeOutlined sx={{ fontSize: 22 }} />
        </Box>
        <Typography variant="h6" sx={{ fontWeight: 800, mb: 0.75 }}>
          {title}
        </Typography>
        <Typography color="text.secondary" sx={{ maxWidth: 520, mx: "auto", mb: 2.5, fontSize: "0.9rem" }}>
          {description}
        </Typography>

        <Stack direction="row" gap={1} justifyContent="center" flexWrap="wrap">
          {suggestions.map((suggestion) => (
            <Chip key={suggestion} label={suggestion} variant="outlined" size="small" />
          ))}
        </Stack>
      </Stack>
    </Box>
  );
}
