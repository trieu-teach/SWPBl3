import { Alert, Box, Stack, Typography } from "@mui/material";
import LibraryBooksOutlined from "@mui/icons-material/LibraryBooksOutlined";
import ArrowBackIosNewOutlined from "@mui/icons-material/ArrowBackIosNewOutlined";

/**
 * Compatibility state shown if an invalid library source is ever detected.
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
        Hãy chọn lại phạm vi tài liệu để tiếp tục trò chuyện.
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
          Hỏi toàn bộ thư viện của bạn
        </Typography>
        <Typography
          color="text.secondary"
          sx={{ maxWidth: 400, mx: "auto", fontSize: "0.9rem", lineHeight: 1.6 }}
        >
          Bạn có thể hỏi ngay trên toàn bộ tài liệu hợp lệ, hoặc chọn môn học
          và file cụ thể để thu hẹp phạm vi.
        </Typography>
      </Stack>
    </Box>
  );
}
