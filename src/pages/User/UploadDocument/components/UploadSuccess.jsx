import { Alert, Button, Paper, Stack, Typography } from "@mui/material";
import { CheckCircleOutlined, ScheduleOutlined } from "@mui/icons-material";
import { Link } from "react-router-dom";
import { getUploadModerationOutcome } from "../../../../lib/moderation.js";

export default function UploadSuccess({ document, fallbackTitle, onReset }) {
  const moderationOutcome = getUploadModerationOutcome(document);

  return (
    <Paper
      variant="outlined"
      sx={{
        maxWidth: 720,
        mx: "auto",
        mt: 5,
        p: { xs: 3, md: 6 },
        borderRadius: 4,
        textAlign: "center",
      }}
    >
      <CheckCircleOutlined
        sx={{ fontSize: 72, color: "success.main", mb: 2 }}
      />
      <Typography variant="h4" sx={{ fontWeight: 800, mb: 1 }}>
        Tải tài liệu thành công
      </Typography>
      <Typography color="text.secondary">
        “{document.title || fallbackTitle}” đã được lưu. Hệ thống đang trích
        xuất nội dung cho tìm kiếm và AI.
      </Typography>
      {moderationOutcome === "published" && (
        <Alert severity="success" sx={{ mt: 3, textAlign: "left" }}>
          <strong>Đã lên Cộng đồng.</strong> Hệ thống đã kiểm tra và tự động
          duyệt tài liệu công khai này.
        </Alert>
      )}
      {moderationOutcome === "review" && (
        <Alert
          severity="info"
          icon={<ScheduleOutlined />}
          sx={{ mt: 3, textAlign: "left" }}
        >
          <strong>Đang chờ người xem.</strong> Hệ thống chưa thể tự động xác
          nhận tài liệu an toàn; tài liệu chưa xuất hiện trong Cộng đồng.
        </Alert>
      )}
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={1.5}
        justifyContent="center"
        sx={{ mt: 4 }}
      >
        <Button component={Link} to="/documents" variant="contained">
          Đến thư viện
        </Button>
        <Button variant="outlined" onClick={onReset}>
          Tải thêm tài liệu
        </Button>
      </Stack>
    </Paper>
  );
}
