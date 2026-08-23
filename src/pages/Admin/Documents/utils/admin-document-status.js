export const ADMIN_MODERATION_STATUS = {
  PENDING: { label: "Chờ duyệt / không đọc được", color: "warning" },
  APPROVED: { label: "Đã duyệt", color: "success" },
  REJECTED: { label: "Bị từ chối", color: "error" },
  FLAGGED: { label: "Cần xem (cờ từ khóa)", color: "warning" },
  AUTO_BLOCKED: { label: "Máy đã ẩn", color: "error" },
  UNDER_REVIEW: { label: "Đang được xem", color: "info" },
  APPEALED: { label: "Đang khiếu nại", color: "info" },
  SYSTEM_CLEARED: { label: "Máy đã gỡ cờ", color: "success" },
  EXPIRED: { label: "Hết hạn khiếu nại", color: "default" },
};

export const ADMIN_REVIEW_QUEUE_STATUSES = [
  "PENDING",
  "FLAGGED",
  "AUTO_BLOCKED",
  "UNDER_REVIEW",
  "APPEALED",
];

const DOCUMENT_STATUS = {
  ACTIVE: { label: "Hoạt động", color: "success" },
  HIDDEN: { label: "Đã ẩn", color: "error" },
  DELETED: { label: "Đã xóa", color: "default" },
};

export function getAdminDocumentModeration(document) {
  if (document?.visibility !== "PUBLIC") {
    return { label: "Không áp dụng", color: "default" };
  }

  return (
    ADMIN_MODERATION_STATUS[document.moderationStatus] || {
      label: document.moderationStatus || "Chưa có trạng thái",
      color: "default",
    }
  );
}

export function getAdminDocumentStatus(status) {
  return (
    DOCUMENT_STATUS[status] || {
      label: status || "Chưa có trạng thái",
      color: "default",
    }
  );
}

export function canAdminDecide(document) {
  return (
    document?.visibility === "PUBLIC" &&
    ADMIN_REVIEW_QUEUE_STATUSES.includes(document.moderationStatus)
  );
}

export function canAdminHide(document) {
  return (
    document?.status === "ACTIVE" &&
    ["APPROVED", "SYSTEM_CLEARED"].includes(document.moderationStatus)
  );
}

export function canAdminUnhide(document) {
  return (
    document?.status === "HIDDEN" &&
    !["AUTO_BLOCKED", "REJECTED", "APPEALED", "EXPIRED"].includes(
      document.moderationStatus,
    ) &&
    document.moderationFlag !== "FLAGGED"
  );
}
