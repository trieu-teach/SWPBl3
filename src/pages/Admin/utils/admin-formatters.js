/**
 * Admin formatters: action mapping, date helpers, file type helpers.
 * Shared across Audit Logs, Download Logs, and Reports.
 */

// ─── ACTION MAPPING ──────────────────────────────────────────────────────────
// Maps raw API action strings → friendly labels + MUI icons + category groups.

export const ACTION_CATEGORIES = {
  USER: { label: "Người dùng", color: "#8b5cf6" },
  DOCUMENT: { label: "Tài liệu", color: "#6366f1" },
  AUTH: { label: "Xác thực", color: "#06b6d4" },
  PAYMENT: { label: "Thanh toán", color: "#f59e0b" },
  SYSTEM: { label: "Hệ thống", color: "#64748b" },
};

export const ACTION_CONFIG = {
  // ── Auth ──────────────────────────────────────────────────────────────────
  "auth.register": {
    category: "AUTH",
    label: "Đăng ký tài khoản",
    color: "#06b6d4",
    bg: "#ecfeff",
    Icon: "PersonAddAlt",
  },
  "auth.login": {
    category: "AUTH",
    label: "Đăng nhập",
    color: "#06b6d4",
    bg: "#ecfeff",
    Icon: "Login",
  },
  "auth.logout": {
    category: "AUTH",
    label: "Đăng xuất",
    color: "#64748b",
    bg: "#f8fafc",
    Icon: "Logout",
  },
  "auth.token_refresh": {
    category: "AUTH",
    label: "Làm mới token",
    color: "#64748b",
    bg: "#f8fafc",
    Icon: "Refresh",
  },

  // ── User management ───────────────────────────────────────────────────────
  "user.register": {
    category: "USER",
    label: "Đăng ký người dùng",
    color: "#8b5cf6",
    bg: "#f5f3ff",
    Icon: "PersonAdd",
  },
  "user.login": {
    category: "USER",
    label: "Đăng nhập",
    color: "#8b5cf6",
    bg: "#f5f3ff",
    Icon: "Login",
  },
  "user.logout": {
    category: "USER",
    label: "Đăng xuất",
    color: "#8b5cf6",
    bg: "#f5f3ff",
    Icon: "Logout",
  },
  "user.profile_update": {
    category: "USER",
    label: "Cập nhật hồ sơ",
    color: "#8b5cf6",
    bg: "#f5f3ff",
    Icon: "Edit",
  },
  "user.block": {
    category: "USER",
    label: "Khóa tài khoản",
    color: "#ef4444",
    bg: "#fef2f2",
    Icon: "Block",
  },
  "user.unblock": {
    category: "USER",
    label: "Mở khóa tài khoản",
    color: "#22c55e",
    bg: "#f0fdf4",
    Icon: "CheckCircle",
  },
  "user.status_change": {
    category: "USER",
    label: "Thay đổi trạng thái",
    color: "#f59e0b",
    bg: "#fffbeb",
    Icon: "Sync",
  },
  "user.role_change": {
    category: "USER",
    label: "Thay đổi quyền",
    color: "#f59e0b",
    bg: "#fffbeb",
    Icon: "AdminPanelSettings",
  },

  // ── Document ──────────────────────────────────────────────────────────────
  "document.upload": {
    category: "DOCUMENT",
    label: "Upload tài liệu",
    color: "#6366f1",
    bg: "#eef2ff",
    Icon: "UploadFile",
  },
  "document.create": {
    category: "DOCUMENT",
    label: "Tạo tài liệu mới",
    color: "#6366f1",
    bg: "#eef2ff",
    Icon: "NoteAdd",
  },
  "document.update": {
    category: "DOCUMENT",
    label: "Cập nhật tài liệu",
    color: "#6366f1",
    bg: "#eef2ff",
    Icon: "Edit",
  },
  "document.delete": {
    category: "DOCUMENT",
    label: "Xóa tài liệu",
    color: "#ef4444",
    bg: "#fef2f2",
    Icon: "Delete",
  },
  "document.view": {
    category: "DOCUMENT",
    label: "Xem tài liệu",
    color: "#6366f1",
    bg: "#eef2ff",
    Icon: "Visibility",
  },
  "document.download": {
    category: "DOCUMENT",
    label: "Tải tài liệu",
    color: "#6366f1",
    bg: "#eef2ff",
    Icon: "Download",
  },
  "document.share": {
    category: "DOCUMENT",
    label: "Chia sẻ tài liệu",
    color: "#6366f1",
    bg: "#eef2ff",
    Icon: "Share",
  },
  "document.visibility_change": {
    category: "DOCUMENT",
    label: "Thay đổi chế độ hiển thị",
    color: "#f59e0b",
    bg: "#fffbeb",
    Icon: "Visibility",
  },
  "document.approve": {
    category: "DOCUMENT",
    label: "Duyệt tài liệu",
    color: "#22c55e",
    bg: "#f0fdf4",
    Icon: "CheckCircle",
  },
  "document.reject": {
    category: "DOCUMENT",
    label: "Từ chối tài liệu",
    color: "#ef4444",
    bg: "#fef2f2",
    Icon: "Cancel",
  },
  "document.hide": {
    category: "DOCUMENT",
    label: "Ẩn tài liệu",
    color: "#f59e0b",
    bg: "#fffbeb",
    Icon: "VisibilityOff",
  },
  "document.unhide": {
    category: "DOCUMENT",
    label: "Bỏ Ẩn tài liệu",
    color: "#22c55e",
    bg: "#f0fdf4",
    Icon: "Visibility",
  },
  "document.save": {
    category: "DOCUMENT",
    label: "Lưu tài liệu",
    color: "#6366f1",
    bg: "#eef2ff",
    Icon: "Bookmark",
  },
  "document.unsave": {
    category: "DOCUMENT",
    label: "Bỏ lưu tài liệu",
    color: "#64748b",
    bg: "#f8fafc",
    Icon: "BookmarkBorder",
  },
  "document.extract": {
    category: "DOCUMENT",
    label: "Trích xuất nội dung",
    color: "#6366f1",
    bg: "#eef2ff",
    Icon: "AutoAwesome",
  },
  "document.moderate": {
    category: "DOCUMENT",
    label: "Kiểm duyệt tài liệu",
    color: "#f59e0b",
    bg: "#fffbeb",
    Icon: "Gavel",
  },

  // ── Payment ───────────────────────────────────────────────────────────────
  "payment.initiate": {
    category: "PAYMENT",
    label: "Khởi tạo thanh toán",
    color: "#f59e0b",
    bg: "#fffbeb",
    Icon: "Payment",
  },
  "payment.success": {
    category: "PAYMENT",
    label: "Thanh toán thành công",
    color: "#22c55e",
    bg: "#f0fdf4",
    Icon: "CheckCircle",
  },
  "payment.failed": {
    category: "PAYMENT",
    label: "Thanh toán thất bại",
    color: "#ef4444",
    bg: "#fef2f2",
    Icon: "Error",
  },
  "payment.refund": {
    category: "PAYMENT",
    label: "Hoàn tiền",
    color: "#f59e0b",
    bg: "#fffbeb",
    Icon: "MoneyOff",
  },
  "subscription.create": {
    category: "PAYMENT",
    label: "Đăng ký gói dịch vụ",
    color: "#f59e0b",
    bg: "#fffbeb",
    Icon: "CardMembership",
  },
  "subscription.cancel": {
    category: "PAYMENT",
    label: "Hủy gói dịch vụ",
    color: "#ef4444",
    bg: "#fef2f2",
    Icon: "Cancel",
  },
  "subscription.renew": {
    category: "PAYMENT",
    label: "Gia hạn gói dịch vụ",
    color: "#22c55e",
    bg: "#f0fdf4",
    Icon: "Renew",
  },

  // ── System ───────────────────────────────────────────────────────────────
  "system.error": {
    category: "SYSTEM",
    label: "Lỗi hệ thống",
    color: "#ef4444",
    bg: "#fef2f2",
    Icon: "ErrorOutline",
  },
  "system.config_change": {
    category: "SYSTEM",
    label: "Thay đổi cấu hình",
    color: "#64748b",
    bg: "#f8fafc",
    Icon: "Settings",
  },
};

/** Fallback for unknown action keys */
const UNKNOWN_ACTION = {
  category: "SYSTEM",
  label: "Hành động khác",
  color: "#64748b",
  bg: "#f8fafc",
  Icon: "Info",
};

export function getActionConfig(action) {
  if (!action) return UNKNOWN_ACTION;
  const normalized = action.toLowerCase().replace(/\s+/g, "_");
  return ACTION_CONFIG[normalized] || {
    ...UNKNOWN_ACTION,
    label: normalizeActionLabel(action),
  };
}

/** Turn "firebase_login" → "Firebase Login" */
function normalizeActionLabel(raw) {
  return raw
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export const ALL_ACTIONS = Object.entries(ACTION_CONFIG).map(([key, cfg]) => ({
  key,
  ...cfg,
}));

/** Group actions by category for filter UI */
export const ACTIONS_BY_CATEGORY = ALL_ACTIONS.reduce((acc, action) => {
  const cat = action.category;
  if (!acc[cat]) acc[cat] = [];
  acc[cat].push(action);
  return acc;
}, {});

// ─── DATE HELPERS ────────────────────────────────────────────────────────────

export function formatDate(value) {
  if (!value) return "—";
  const date = new Date(value);
  if (isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).format(date);
}

export function formatDateShort(value) {
  if (!value) return "—";
  const date = new Date(value);
  if (isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

export function formatTime(value) {
  if (!value) return "—";
  const date = new Date(value);
  if (isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).format(date);
}

export function formatRelativeTime(value) {
  if (!value) return "—";
  const date = new Date(value);
  if (isNaN(date.getTime())) return "—";
  const now = new Date();
  const diffMs = now - date;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffSec < 60) return "Vừa xong";
  if (diffMin < 60) return `${diffMin} phút trước`;
  if (diffHour < 24) return `${diffHour} giờ trước`;
  if (diffDay < 7) return `${diffDay} ngày trước`;
  return formatDateShort(value);
}

export function formatRelativeFull(value) {
  if (!value) return "—";
  const date = new Date(value);
  if (isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

// ─── FILE HELPERS ────────────────────────────────────────────────────────────

export function formatFileSize(bytes) {
  if (!bytes && bytes !== 0) return "—";
  const n = Number(bytes);
  if (isNaN(n)) return "—";
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  if (n < 1024 * 1024 * 1024) return `${(n / (1024 * 1024)).toFixed(1)} MB`;
  return `${(n / (1024 * 1024 * 1024)).toFixed(1)} GB`;
}

export const FILE_TYPE_CONFIG = {
  pdf: { label: "PDF", color: "#ef4444", bg: "#fef2f2" },
  docx: { label: "DOCX", color: "#2563eb", bg: "#eff6ff" },
  doc: { label: "DOC", color: "#2563eb", bg: "#eff6ff" },
  pptx: { label: "PPTX", color: "#ea580c", bg: "#fff7ed" },
  xlsx: { label: "XLSX", color: "#16a34a", bg: "#f0fdf4" },
  xls: { label: "XLS", color: "#16a34a", bg: "#f0fdf4" },
};

export function getFileTypeConfig(fileType) {
  if (!fileType) return { label: "FILE", color: "#64748b", bg: "#f1f5f9" };
  return FILE_TYPE_CONFIG[fileType.toLowerCase()] || { label: fileType.toUpperCase(), color: "#64748b", bg: "#f1f5f9" };
}

export function getFileTypeColors(fileType) {
  const cfg = getFileTypeConfig(fileType);
  return { main: cfg.color, soft: cfg.bg };
}

export function displayFileType(doc) {
  const ext = doc?.fileType || "";
  const map = { pdf: "PDF", docx: "DOCX", doc: "DOC", pptx: "PPTX", xlsx: "XLSX", xls: "XLS" };
  return map[ext.toLowerCase()] || ext.toUpperCase() || "FILE";
}

// ─── NUMBER HELPERS ──────────────────────────────────────────────────────────

export function formatNumber(value) {
  if (value === null || value === undefined) return "0";
  const n = Number(value);
  if (isNaN(n)) return "0";
  return new Intl.NumberFormat("vi-VN").format(n);
}

// ─── DATE RANGE PRESETS ─────────────────────────────────────────────────────

export function getDateRangePresets() {
  const now = new Date();
  const today = now.toISOString().split("T")[0];
  const weekAgo = new Date(now);
  weekAgo.setDate(weekAgo.getDate() - 7);
  const monthAgo = new Date(now);
  monthAgo.setDate(monthAgo.getDate() - 30);
  const threeMonthsAgo = new Date(now);
  threeMonthsAgo.setDate(threeMonthsAgo.getDate() - 90);
  return [
    { label: "7 ngày qua", from: weekAgo.toISOString().split("T")[0], to: today },
    { label: "30 ngày qua", from: monthAgo.toISOString().split("T")[0], to: today },
    { label: "90 ngày qua", from: threeMonthsAgo.toISOString().split("T")[0], to: today },
    { label: "Tất cả", from: undefined, to: undefined },
  ];
}

// ─── CHART HELPERS ──────────────────────────────────────────────────────────

function truncateLabel(text, maxLength) {
  console.log("[DEBUG truncateLabel] input:", text, "maxLength:", maxLength);
  if (!text) return "Không tên";
  if (text.length <= maxLength) {
    console.log("[DEBUG truncateLabel] output (no truncate):", text);
    return text;
  }
  const result = text.slice(0, maxLength - 3) + "...";
  console.log("[DEBUG truncateLabel] output (truncated):", result);
  return result;
}

export function formatChartLabel(rawLabel, fallbackLabel = "Không tên", maxLength = 35) {
  return truncateLabel(rawLabel || fallbackLabel, maxLength);
}

export function ensureUniqueChartLabels(data, options = {}) {
  const {
    labelKey = "chartLabel",
    rawKey = "title",
    fallbackLabel = "Tài liệu không xác định",
    maxLength = 35,
  } = options;

  if (!data || data.length === 0) return data;

  console.log("[DEBUG ensureUniqueChartLabels] INPUT:", data.length, "items, labelKey:", labelKey, "maxLength:", maxLength);

  // STEP 1: Build raw labels (no truncation yet)
  const withRawLabels = data.map((item) => ({
    ...item,
    _rawLabel: item[rawKey] || fallbackLabel,
  }));

  // STEP 2: Count occurrences to find duplicates
  const labelCounts = {};
  withRawLabels.forEach((item) => {
    const label = item._rawLabel;
    labelCounts[label] = (labelCounts[label] || 0) + 1;
  });

  console.log("[DEBUG ensureUniqueChartLabels] labelCounts:", labelCounts);

  const duplicates = new Set(
    Object.entries(labelCounts)
      .filter(([, count]) => count > 1)
      .map(([label]) => label)
  );

  console.log("[DEBUG ensureUniqueChartLabels] duplicates:", [...duplicates]);

  // STEP 3: Build final labels with #N suffix where needed
  const seenCounts = {};
  const withSuffix = withRawLabels.map((item) => {
    const rawLabel = item._rawLabel;
    let finalLabel;
    if (duplicates.has(rawLabel)) {
      seenCounts[rawLabel] = (seenCounts[rawLabel] || 0) + 1;
      finalLabel = `${rawLabel} #${seenCounts[rawLabel]}`;
    } else {
      finalLabel = rawLabel;
    }
    console.log("[DEBUG ensureUniqueChartLabels] item:", rawLabel, "-> finalLabel:", finalLabel);
    return {
      ...item,
      [labelKey]: finalLabel,
    };
  });

  // NOTE: NO truncation here - WrappedTick component handles word wrapping automatically
  // maxLength parameter is kept for backward compatibility but labels are passed through raw
  
  console.log("[DEBUG ensureUniqueChartLabels] OUTPUT:", withSuffix.map(r => ({ [labelKey]: r[labelKey] })));

  return withSuffix;
}
