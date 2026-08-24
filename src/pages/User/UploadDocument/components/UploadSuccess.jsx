import {
  Alert,
  AlertTitle,
  Button,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import { CheckCircleOutlined } from "@mui/icons-material";
import { Link } from "react-router-dom";

function getUploadModerationOutcome(document) {
  if (document.visibility !== "PUBLIC") {
    return {
      severity: "success",
      title: "Đã lưu vào thư viện riêng tư",
      message: "Chỉ bạn mới có thể truy cập tài liệu này.",
    };
  }

  switch (document.moderationStatus) {
    case "APPROVED":
      return {
        severity: "success",
        title: "Đã xuất hiện trong Cộng đồng",
        message: "Tài liệu đã được hệ thống kiểm tra và tự động duyệt.",
      };
    case "SYSTEM_CLEARED":
      return {
        severity: "success",
        title: "Đã xuất hiện trong Cộng đồng",
        message: "Hệ thống đã gỡ cờ và cho phép công khai tài liệu.",
      };
    case "FLAGGED":
      return {
        severity: "warning",
        title: "Tài liệu cần được xem xét thêm",
        message: "Tài liệu chưa xuất hiện trong Cộng đồng.",
      };
    case "AUTO_BLOCKED":
      return {
        severity: "error",
        title: "Tài liệu đã bị hệ thống tạm ẩn",
        message:
          "Bạn có thể xem thông tin và thời hạn khiếu nại trong trang chi tiết tài liệu.",
      };
    case "UNDER_REVIEW":
      return {
        severity: "info",
        title: "Tài liệu đang được xem xét",
        message: "Một kiểm duyệt viên đang xử lý tài liệu này.",
      };
    case "REJECTED":
      return {
        severity: "error",
        title: "Tài liệu chưa được chấp nhận",
        message:
          document.rejectionReason ||
          "Bạn có thể xem lý do và quyền khiếu nại trong trang chi tiết tài liệu.",
      };
    case "APPEALED":
      return {
        severity: "info",
        title: "Khiếu nại đang chờ xem xét",
        message: "Trạng thái sẽ được cập nhật sau khi khiếu nại được xử lý.",
      };
    case "EXPIRED":
      return {
        severity: "warning",
        title: "Đã hết hạn khiếu nại",
        message: "Tài liệu hiện không xuất hiện trong Cộng đồng.",
      };
    case "PENDING":
      return {
        severity: "info",
        title:
          document.moderationFlag === "SCAN_FAILED" ||
          document.moderationFlag === "NOT_SCANNED"
            ? "Đang chờ người xem xét"
            : "Hệ thống đang kiểm tra tài liệu",
        message: "Tài liệu chưa xuất hiện trong Cộng đồng.",
      };
    default:
      return {
        severity: "info",
        title: "Hệ thống đang cập nhật trạng thái",
        message:
          "Bạn có thể theo dõi kết quả trong thư viện sau khi quá trình xử lý hoàn tất.",
      };
  }
}

export default function UploadSuccess({ document, fallbackTitle, onReset }) {
  const outcome = getUploadModerationOutcome(document);

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
      <Alert severity={outcome.severity} sx={{ mt: 3, textAlign: "left" }}>
        <AlertTitle sx={{ fontWeight: 700 }}>{outcome.title}</AlertTitle>
        {outcome.message}
      </Alert>
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
