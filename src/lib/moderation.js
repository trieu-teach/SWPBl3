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
  { value: "REVERTED", label: "Đã đảo quyết định" },
];

const reasonLabels = Object.fromEntries(
  REPORT_REASON_OPTIONS.map((option) => [option.value, option.label]),
);

const statusPresentation = {
  PENDING: { label: "Chờ xử lý", color: "warning" },
  RESOLVED: { label: "Đã xử lý", color: "success" },
  DISMISSED: { label: "Đã bỏ qua", color: "default" },
  REVERTED: { label: "Đã đảo quyết định", color: "info" },
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
