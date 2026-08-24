import { Alert, Box, Stack, Typography } from "@mui/material";
import LibraryBooksOutlined from "@mui/icons-material/LibraryBooksOutlined";
import ArrowBackIosNewOutlined from "@mui/icons-material/ArrowBackIosNewOutlined";

/**
 * Shown in ASK_MY_LIBRARY mode when no source (subject or document) is selected.
 *
 * @param {{ variant?: "fullscreen" | "banner" }} props
 */
export default function LibrarySourceEmptyState({ variant = "fullscreen" }) {
  if (variant === "banner") {
    return (
      <Alert
        severity="warning"
        icon={<ArrowBackIosNewOutlined fontSize="inherit" />}
        sx={{ borderRadius: 0, fontSize: "0.82rem", py: 0.75 }}
      >
        Hãy chọn ít nhất một tài liệu hoặc môn học ở bảng bên trái để tiếp tục trò chuyện.
      </Alert>
    );
  }

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
        sx={{
          alignItems: "center",
          maxWidth: 520,
          width: "100%",
          mx: "auto",
          textAlign: "center",
        }}
      >
        <Box
          sx={{
            width: 48,
            height: 48,
            display: "grid",
            placeItems: "center",
            mx: "auto",
            mb: 2,
            borderRadius: 2.5,
            bgcolor: "warning.light",
            color: "warning.dark",
            opacity: 0.85,
          }}
        >
          <LibraryBooksOutlined sx={{ fontSize: 24 }} />
        </Box>
        <Typography variant="h6" sx={{ fontWeight: 800, mb: 0.75 }}>
          Chọn tài liệu để bắt đầu
        </Typography>
        <Typography
          color="text.secondary"
          sx={{ maxWidth: 400, mx: "auto", fontSize: "0.9rem", lineHeight: 1.6 }}
        >
          AI chỉ trả lời dựa trên những tài liệu bạn lựa chọn. Hãy tích chọn ít nhất
          một tài liệu ở bảng nguồn bên trái.
        </Typography>
      </Stack>
    </Box>
  );
}
