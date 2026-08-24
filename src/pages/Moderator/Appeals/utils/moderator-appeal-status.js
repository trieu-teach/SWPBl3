export const MODERATOR_APPEAL_FILTERS = [
  { value: "PENDING", label: "Chờ xử lý" },
  { value: "APPROVED", label: "Đã chấp nhận" },
  { value: "REJECTED", label: "Đã từ chối" },
  { value: "UNDER_REVIEW", label: "Đang xem xét" },
  { value: "EXPIRED", label: "Đã hết hạn" },
  { value: "CANCELLED", label: "Đã hủy" },
];

const STATUS_MAP = {
  PENDING: { label: "Chờ xử lý", color: "warning" },
  UNDER_REVIEW: { label: "Đang xem xét", color: "info" },
  APPROVED: { label: "Đã chấp nhận", color: "success" },
  REJECTED: { label: "Đã từ chối", color: "error" },
  EXPIRED: { label: "Đã hết hạn", color: "default" },
  CANCELLED: { label: "Đã hủy", color: "default" },
};

export function getModeratorAppealStatus(status) {
  return STATUS_MAP[status] || {
    label: status || "Chưa có trạng thái",
    color: "default",
  };
}

export function getModeratorAppealSourceLabel(source) {
  const labels = {
    KEYWORD_MODERATION: "Kiểm duyệt từ khóa",
    USER_REPORT: "Báo cáo cộng đồng",
  };

  return labels[source] || source || "Kiểm duyệt tài liệu";
}

export function canDecideAppeal(appeal) {
  return appeal?.status === "PENDING";
}
