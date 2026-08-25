export const MODERATOR_REVIEW_STATUSES = [
  "PENDING",
  "FLAGGED",
  "AUTO_BLOCKED",
  "UNDER_REVIEW",
  "APPEALED",
];

const MODERATION_STATUS = {
  PENDING: { label: "Chờ kiểm duyệt", color: "warning" },
  FLAGGED: { label: "Cần xem xét", color: "warning" },
  AUTO_BLOCKED: { label: "Đã tạm ẩn", color: "error" },
  UNDER_REVIEW: { label: "Đang kiểm duyệt", color: "info" },
  APPEALED: { label: "Đang xử lý khiếu nại", color: "info" },
};

export function getModeratorDocumentStatus(status) {
  return (
    MODERATION_STATUS[status] || {
      label: status || "Chưa có trạng thái",
      color: "default",
    }
  );
}

export function canModeratorDecide(document) {
  return (
    document?.visibility === "PUBLIC" &&
    MODERATOR_REVIEW_STATUSES.includes(document.moderationStatus)
  );
}
