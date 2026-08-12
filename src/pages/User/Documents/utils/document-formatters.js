export const AI_STATUS = {
  PENDING: { label: "Chờ xử lý", color: "warning" },
  PROCESSING: { label: "Đang xử lý", color: "info" },
  COMPLETED: { label: "Sẵn sàng", color: "success" },
  FAILED: { label: "Xử lý lỗi", color: "error" },
  MOCKED: { label: "Dữ liệu mẫu", color: "default" },
};

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
