import { DOCUMENT_MODERATION_STATUS } from "../../../../lib/moderation.js";

export const AI_STATUS = {
  PENDING: { label: "Chờ xử lý", color: "warning" },
  PROCESSING: { label: "Đang xử lý", color: "info" },
  COMPLETED: { label: "Sẵn sàng", color: "success" },
  FAILED: { label: "Xử lý lỗi", color: "error" },
  MOCKED: { label: "Dữ liệu mẫu", color: "default" },
};

export const MODERATION_STATUS = DOCUMENT_MODERATION_STATUS;

export function getModerationStatus(document) {
  if (document?.visibility !== "PUBLIC") return null;
  return MODERATION_STATUS[document.moderationStatus] || null;
}

export function formatBytes(bytes) {
  const value = Number(bytes || 0);
  if (value < 1024 * 1024) {
    return `${Math.max(1, Math.ceil(value / 1024))} KB`;
  }
  return `${(value / 1024 / 1024).toFixed(1)} MB`;
}

export function formatDate(value) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(value));
}

export function displayFileType(document) {
  return document.fileName?.split(".").pop()?.toUpperCase() || "FILE";
}

export function getFileTypeColors(document) {
  const extension = displayFileType(document).toLowerCase();
  if (extension === "pdf") return { main: "#dc2626", soft: "rgba(220,38,38,.12)" };
  if (["doc", "docx"].includes(extension))
    return { main: "#2563eb", soft: "rgba(37,99,235,.12)" };
  if (["xls", "xlsx"].includes(extension))
    return { main: "#16803c", soft: "rgba(22,128,60,.12)" };
  if (["ppt", "pptx"].includes(extension))
    return { main: "#ea580c", soft: "rgba(234,88,12,.12)" };
  return { main: "#64748b", soft: "rgba(100,116,139,.12)" };
}

export function normalizeTags(tags) {
  if (!Array.isArray(tags)) return [];
  return tags
    .map((item) => item?.tag || item)
    .filter((item) => item?.name?.trim());
}

export function normalizeDocumentList(response) {
  if (Array.isArray(response)) return { items: response, meta: {} };
  return {
    items: response?.items || response?.data || [],
    meta: response?.meta || response?.pagination || {},
  };
}
