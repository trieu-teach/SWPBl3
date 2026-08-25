import { Alert, AlertTitle } from "@mui/material";

function formatAppealDeadline(value) {
  if (!value) return "";

  const deadline = new Date(value);
  if (Number.isNaN(deadline.getTime())) return "";

  return deadline.toLocaleString("vi-VN");
}

function getModerationAlert(document) {
  const deadline = formatAppealDeadline(document.appealDeadline);

  if (
    document.status === "HIDDEN" &&
    ["APPROVED", "SYSTEM_CLEARED"].includes(document.moderationStatus)
  ) {
    return {
      severity: "error",
      title: "Tài liệu đã bị ẩn",
      message:
        "Tài liệu vẫn được đặt ở chế độ công khai nhưng hiện không xuất hiện trong Cộng đồng.",
    };
  }

  switch (document.moderationStatus) {
    case "PENDING":
      return {
        severity: "info",
        title: "Tài liệu đang chờ xem xét",
        message:
          "Hệ thống chưa thể tự xác nhận nội dung. Tài liệu chưa xuất hiện trong Cộng đồng.",
      };
    case "FLAGGED":
      return {
        severity: "warning",
        title: "Tài liệu đang chờ người xem",
        message:
          "Tài liệu cần được kiểm tra thêm và hiện chưa xuất hiện trong Cộng đồng.",
      };
    case "AUTO_BLOCKED":
      return {
        severity: "error",
        title: "Tài liệu đã bị hệ thống tạm ẩn",
        message: deadline
          ? `Bạn có thể gửi khiếu nại trước ${deadline}.`
          : "Bạn có thể gửi khiếu nại nếu tài liệu vẫn còn trong thời hạn cho phép.",
      };
    case "UNDER_REVIEW":
      return {
        severity: "info",
        title: "Tài liệu đang được xem xét",
        message:
          "Một kiểm duyệt viên đang xem tài liệu. Trạng thái sẽ được cập nhật sau khi xử lý xong.",
      };
    case "REJECTED":
      return {
        severity: "error",
        title: "Tài liệu đã bị từ chối",
        message:
          document.rejectionReason || "Chưa có lý do từ chối cụ thể.",
      };
    case "APPEALED":
      return {
        severity: "info",
        title: "Đã gửi khiếu nại",
        message: "Khiếu nại của bạn đang chờ được xem xét.",
      };
    case "EXPIRED":
      return {
        severity: "warning",
        title: "Đã hết hạn khiếu nại",
        message: "Tài liệu này không thể gửi khiếu nại lại.",
      };
    default:
      return null;
  }
}

export default function DocumentModerationAlert({ document }) {
  if (document?.visibility !== "PUBLIC") return null;

  const alert = getModerationAlert(document);
  if (!alert) return null;

  return (
    <Alert severity={alert.severity} sx={{ mb: 2 }}>
      <AlertTitle sx={{ fontWeight: 700 }}>{alert.title}</AlertTitle>
      {alert.message}
    </Alert>
  );
}
