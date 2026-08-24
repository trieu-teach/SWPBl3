export const USER_APPEAL_FILTERS = [
  { value: "", label: "Tất cả trạng thái" },
  { value: "PENDING", label: "Chờ xử lý" },
  { value: "UNDER_REVIEW", label: "Đang xem xét" },
  { value: "APPROVED", label: "Đã chấp nhận" },
  { value: "REJECTED", label: "Đã từ chối" },
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

export function getUserAppealStatus(status) {
  return STATUS_MAP[status] || {
    label: status || "Chưa có trạng thái",
    color: "default",
  };
}

export function getAppealSourceLabel(source) {
  if (source === "KEYWORD_MODERATION") return "Kiểm duyệt từ khóa";
  if (source === "USER_REPORT") return "Báo cáo cộng đồng";
  return source || "Kiểm duyệt tài liệu";
}
