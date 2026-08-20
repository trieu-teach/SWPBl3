export const REPORT_REASONS = [
  "SPAM",
  "INAPPROPRIATE",
  "COPYRIGHT",
  "BAD_QUALITY",
];

export const REPORT_STATUSES = ["PENDING", "RESOLVED", "DISMISSED"];

export const REPORT_RESOLUTION_ACTIONS = [
  "NONE",
  "HIDE_DOCUMENT",
  "DELETE_DOCUMENT",
];

export const MODERATION_DECISIONS = ["APPROVED", "REJECTED"];

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

export function normalizeModerationMeta(meta, defaults = {}) {
  const page = Number(meta?.page ?? defaults.page ?? 1);
  const limit = Number(meta?.limit ?? defaults.limit ?? 20);
  const total = Number(
    meta?.total ?? meta?.totalItems ?? defaults.total ?? defaults.totalItems ?? 0,
  );
  const totalPages = Number(
    meta?.totalPages ?? (total > 0 ? Math.ceil(total / limit) : 0),
  );

  return {
    page,
    limit,
    total,
    totalItems: total,
    totalPages,
    hasNext: meta?.hasNext ?? page < totalPages,
    hasPrevious: meta?.hasPrevious ?? (page > 1 && totalPages > 0),
  };
}

export function getModerationRequestError(error, fallback, notFoundMessage) {
  if (error?.status === 400) {
    return error.message || "Dữ liệu gửi lên không hợp lệ.";
  }
  if (error?.status === 403) {
    return "Bạn không có quyền thực hiện thao tác này.";
  }
  if (error?.status === 404 && notFoundMessage) return notFoundMessage;
  return error?.message || fallback;
}

export function canReportDocument(document) {
  return Boolean(
    document &&
      document.owned === false &&
      document.visibility === "PUBLIC" &&
      document.status === "ACTIVE" &&
      document.moderationStatus === "APPROVED",
  );
}
