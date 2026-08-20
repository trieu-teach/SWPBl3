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
        pt: isLibrary ? { xs: 3, sm: 5 } : { xs: 4, sm: 6 },
        pb: isLibrary ? { xs: 7, sm: 10 } : { xs: 4, sm: 6 },
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
            width: isLibrary ? 48 : 44,
            height: isLibrary ? 48 : 44,
            display: "grid",
            placeItems: "center",
            mx: "auto",
            mb: isLibrary ? 1.75 : 1.5,
            borderRadius: 2,
            bgcolor: "action.hover",
            color: "primary.main",
          }}
        >
          <AutoAwesomeOutlined sx={{ fontSize: isLibrary ? 24 : 22 }} />
        </Box>
        <Typography
          variant="h6"
          sx={{
            fontWeight: 800,
            fontSize: isLibrary ? "1.25rem" : undefined,
            mb: 0.75,
          }}
        >
          {title}
        </Typography>
        <Typography
          color="text.secondary"
          sx={{
            maxWidth: isLibrary ? 540 : 520,
            mx: "auto",
            mb: isLibrary ? 2.75 : 2.5,
            fontSize: isLibrary ? "0.92rem" : "0.9rem",
            lineHeight: isLibrary ? 1.6 : undefined,
          }}
        >
          {description}
        </Typography>

        <Stack
          direction="row"
          gap={isLibrary ? 1.1 : 1}
          justifyContent="center"
          flexWrap="wrap"
        >
          {suggestions.map((suggestion) => (
            <Chip
              key={suggestion}
              label={suggestion}
              variant="outlined"
              size="small"
              sx={
                isLibrary
                  ? {
                      height: 34,
                      borderRadius: 1.75,
                      color: "text.secondary",
                      bgcolor: "background.paper",
                      "& .MuiChip-label": { px: 1.4 },
                      "&:hover": { bgcolor: "action.hover" },
                    }
                  : undefined
              }
            />
          ))}
        </Stack>
      </Stack>
    </Box>
  );
}
