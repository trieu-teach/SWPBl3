export const DOCUMENT_MODERATION_STATUS = Object.freeze({
  PENDING: { label: "Chờ duyệt / không đọc được", color: "warning" },
  APPROVED: { label: "Đã duyệt", color: "success" },
  REJECTED: { label: "Bị từ chối", color: "error" },
  FLAGGED: { label: "Cần xem (cờ từ khóa)", color: "warning" },
  AUTO_BLOCKED: { label: "Máy đã ẩn", color: "error" },
  UNDER_REVIEW: { label: "Đang được xem", color: "info" },
  APPEALED: { label: "Đang khiếu nại", color: "info" },
  SYSTEM_CLEARED: { label: "Máy đã gỡ cờ", color: "success" },
  EXPIRED: { label: "Hết hạn khiếu nại", color: "default" },
});

export const DOCUMENT_MODERATION_FLAG = Object.freeze({
  NOT_SCANNED: { label: "Chưa quét", color: "default" },
  NORMAL: { label: "Đã quét, bình thường", color: "success" },
  FLAGGED: { label: "Có từ khóa cần xem", color: "error" },
  SCAN_FAILED: { label: "Không đọc được", color: "warning" },
});

export const QUEUED_DOCUMENT_MODERATION_STATUSES = Object.freeze([
  "PENDING",
  "FLAGGED",
  "AUTO_BLOCKED",
  "UNDER_REVIEW",
  "APPEALED",
]);

const DEFAULT_PRESENTATION = Object.freeze({
  label: "Không xác định",
  color: "default",
});

export function getDocumentModerationStatusPresentation(status) {
  return DOCUMENT_MODERATION_STATUS[status] || {
    ...DEFAULT_PRESENTATION,
    label: status || DEFAULT_PRESENTATION.label,
  };
}

export function getDocumentModerationFlagPresentation(flag) {
  return DOCUMENT_MODERATION_FLAG[flag] || {
    ...DEFAULT_PRESENTATION,
    label: flag || DEFAULT_PRESENTATION.label,
  };
}

export function isQueuedDocumentModerationStatus(status) {
  return QUEUED_DOCUMENT_MODERATION_STATUSES.includes(status);
}

export function canDecideDocumentModeration(document) {
  return (
    document?.visibility === "PUBLIC" &&
    isQueuedDocumentModerationStatus(document.moderationStatus)
  );
}

export function canUnhideModeratedDocument(document) {
  return (
    document?.status === "HIDDEN" &&
    !["AUTO_BLOCKED", "REJECTED", "APPEALED", "EXPIRED"].includes(
      document.moderationStatus,
    ) &&
    document.moderationFlag !== "FLAGGED"
  );
}

export function canHideModeratedDocument(document) {
  return (
    document?.status === "ACTIVE" &&
    !isQueuedDocumentModerationStatus(document.moderationStatus)
  );
}

export function normalizeModerationKeyword(value) {
  return typeof value === "string"
    ? value.normalize("NFC").trim().toLocaleLowerCase("vi-VN")
    : "";
}

export function buildModerationKeywordIdMap(keywords) {
  if (!Array.isArray(keywords)) return {};
  return Object.fromEntries(
    keywords
      .map((item) => [normalizeModerationKeyword(item?.keyword), item?.id])
      .filter(([keyword, id]) => keyword && id),
  );
}

export function canBanOwnerFromModerationReview(ownerReview) {
  return ownerReview?.canBan === true && ownerReview.status === "ACTIVE";
}

export const REPORT_REASON_OPTIONS = [
  { value: "SPAM", label: "Nội dung rác" },
  { value: "INAPPROPRIATE", label: "Nội dung không phù hợp" },
  { value: "COPYRIGHT", label: "Vi phạm bản quyền" },
  { value: "BAD_QUALITY", label: "Chất lượng kém" },
];

export const REPORT_STATUS_OPTIONS = [
  { value: "PENDING", label: "Chờ xử lý" },
  { value: "RESOLVED", label: "Đã xử lý" },
  { value: "DISMISSED", label: "Đã bỏ qua" },
];

const reasonLabels = Object.fromEntries(
  REPORT_REASON_OPTIONS.map((option) => [option.value, option.label]),
);

const statusPresentation = {
  PENDING: { label: "Chờ xử lý", color: "warning" },
  RESOLVED: { label: "Đã xử lý", color: "success" },
  DISMISSED: { label: "Đã bỏ qua", color: "default" },
};

export function getReportReasonLabel(reason) {
  return reasonLabels[reason] || reason || "—";
}

export function getReportStatusPresentation(status) {
  return statusPresentation[status] || { label: status || "—", color: "default" };
}

export function formatModerationDate(value) {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "—" : date.toLocaleString("vi-VN");
}
