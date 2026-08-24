export const SEVERITY_OPTIONS = [
  { value: "LOW", label: "Thấp", color: "success" },
  { value: "MEDIUM", label: "Trung bình", color: "warning" },
  { value: "HIGH", label: "Cao", color: "error" },
  { value: "CRITICAL", label: "Nghiêm trọng", color: "error" },
];

export const DOMAIN_OPTIONS = [
  { value: "KHAC", label: "Khác" },
  { value: "BAO_LUC", label: "Bạo lực" },
  { value: "MA_TUY", label: "Ma túy" },
  { value: "DOI_TRUY", label: "Đồi trụy" },
  { value: "CHINH_TRI", label: "Chính trị" },
  { value: "LUA_DAO", label: "Lừa đảo" },
  { value: "XUC_PHAM", label: "Xúc phạm" },
  { value: "BAN_QUYEN", label: "Bản quyền" },
  { value: "CO_BAC", label: "Cờ bạc" },
  { value: "NGUY_HIEM", label: "Nguy hiểm" },
];

export function getSeverityOption(value) {
  return (
    SEVERITY_OPTIONS.find((option) => option.value === value) || {
      value,
      label: value || "—",
      color: "default",
    }
  );
}

export function getDomainLabel(value) {
  return (
    DOMAIN_OPTIONS.find((option) => option.value === value)?.label ||
    value ||
    "—"
  );
}
