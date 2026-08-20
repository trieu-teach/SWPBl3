import { Box, ButtonBase, Chip, Stack, Typography } from "@mui/material";
import AutoAwesomeOutlined from "@mui/icons-material/AutoAwesomeOutlined";
import { isLibraryContext } from "../chatContext.js";

const DOC_SUGGESTIONS = [
  "Tóm tắt nội dung chính",
  "Giải thích các khái niệm khó",
  "Gợi ý câu hỏi ôn tập",
];

const LIBRARY_SUGGESTIONS = [
  "Tóm tắt tài liệu học tập của tôi",
  "Giải thích một khái niệm khó",
  "Tạo câu hỏi luyện tập",
  "Gợi ý lộ trình ôn tập",
];

export default function ChatEmptyState({
  chatContext,
  onSend,
  isSending = false,
}) {
  const isLibrary = isLibraryContext(chatContext);
  const title = isLibrary
    ? "Hôm nay mình có thể giúp bạn học gì?"
    : "Bắt đầu hỏi AI";
  const description = isLibrary
    ? "Đặt câu hỏi, khám phá tài liệu hoặc cùng AI làm rõ những khái niệm khó."
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
        pt: isLibrary ? { xs: 3, sm: 4 } : { xs: 4, sm: 6 },
        pb: isLibrary ? { xs: 7, sm: 10 } : { xs: 4, sm: 6 },
        px: 2,
      }}
    >
      <Stack
        sx={{
          maxWidth: 760,
          width: "100%",
          mx: "auto",
          textAlign: "center",
        }}
      >
        <Box
          sx={{
            width: isLibrary ? 52 : 44,
            height: isLibrary ? 52 : 44,
            display: "grid",
            placeItems: "center",
            mx: "auto",
            mb: isLibrary ? 2 : 1.5,
            borderRadius: 2.5,
            bgcolor: "action.selected",
            color: "primary.main",
          }}
        >
          <AutoAwesomeOutlined sx={{ fontSize: isLibrary ? 25 : 22 }} />
        </Box>

        <Typography
          component="h1"
          variant="h5"
          sx={{
            fontWeight: 800,
            fontSize: isLibrary ? { xs: "1.35rem", sm: "1.65rem" } : undefined,
            letterSpacing: "-0.02em",
            mb: 1,
          }}
        >
          {title}
        </Typography>
        <Typography
          color="text.secondary"
          sx={{
            maxWidth: isLibrary ? 560 : 520,
            mx: "auto",
            mb: isLibrary ? 3 : 2.5,
            fontSize: isLibrary ? "0.94rem" : "0.9rem",
            lineHeight: 1.65,
          }}
        >
          {description}
        </Typography>

        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            flexWrap: "wrap",
            gap: 1.25,
            width: "100%",
          }}
        >
          {suggestions.map((suggestion) => (
            <Chip
              key={suggestion}
              label={suggestion}
              variant="outlined"
              size="small"
              sx={{ px: 0.5 }}
            />
          ))}
        </Box>
      </Stack>
    </Box>
  );
}
