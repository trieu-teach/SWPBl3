import {
  Box,
  Button,
  FormControl,
  InputAdornment,
  MenuItem,
  Select,
  TextField,
  Typography,
} from "@mui/material";
import SearchOutlined from "@mui/icons-material/SearchOutlined";
import ClearOutlined from "@mui/icons-material/ClearOutlined";

const ROLE_OPTIONS = [
  { value: "USER", label: "Người dùng" },
  { value: "ADMIN", label: "Quản trị viên" },
  { value: "MODERATOR", label: "Kiểm duyệt viên" },
];

const ACTION_OPTIONS = [
  { value: "USER_LOGIN", label: "Đăng nhập" },
  { value: "auth.registration_pending", label: "Đăng ký" },
  { value: "auth.account_activated", label: "Kích hoạt" },
  { value: "DOCUMENT_UPLOAD", label: "Tải lên" },
  { value: "DOCUMENT_DELETE", label: "Xóa tài liệu" },
  { value: "DOCUMENT_HIDE", label: "Ẩn tài liệu" },
  { value: "PUBLIC_DOCUMENT_SAVE", label: "Lưu tài liệu" },
  { value: "PUBLIC_DOCUMENT_UNSAVE", label: "Bỏ lưu" },
  { value: "DOCUMENT_MODERATION", label: "Kiểm duyệt" },
  { value: "DOCUMENT_REPORT_RESOLUTION", label: "Xử lý báo cáo" },
  { value: "admin.user_status_updated", label: "Cập nhật trạng thái" },
  { value: "admin.user_role_updated", label: "Cập nhật vai trò" },
  { value: "user.profile_updated", label: "Cập nhật hồ sơ" },
  { value: "payment.created", label: "Tạo thanh toán" },
  { value: "payment.paid", label: "Thanh toán" },
  { value: "payment.expired", label: "Hết hạn TT" },
  { value: "payment.refunded", label: "Hoàn tiền" },
  { value: "subscription.activated", label: "Kích hoạt gói" },
  { value: "subscription.expired", label: "Hết hạn gói" },
  { value: "subscription.refund_applied", label: "Áp dụng hoàn tiền" },
];

const RESULT_OPTIONS = [
  { value: "ACTIVE", label: "Hoạt động" },
  { value: "BLOCKED", label: "Bị chặn" },
  { value: "HIDDEN", label: "Bị ẩn" },
  { value: "APPROVED", label: "Đã duyệt" },
  { value: "REJECTED", label: "Bị từ chối" },
  { value: "MODERATOR", label: "Kiểm duyệt" },
  { value: "PAID", label: "Đã thanh toán" },
  { value: "EXPIRED", label: "Hết hạn" },
  { value: "CANCELLED", label: "Đã hủy" },
  { value: "REFUNDED", label: "Đã hoàn tiền" },
  { value: "PENDING", label: "Đang chờ" },
];

export default function AuditLogFilters({ audit }) {
  const { filters, searchInput, updateFilter } = audit;

  const hasActiveFilters =
    filters.userRole || filters.action || filters.result || filters.from || filters.to;

  const handleClearFilters = () => {
    updateFilter("userRole", "");
    updateFilter("action", "");
    updateFilter("result", "");
    updateFilter("from", "");
    updateFilter("to", "");
  };

  return (
    <Box
      sx={{
        borderRadius: "12px",
        overflow: "hidden",
        mb: 2,
        background: "background.paper",
        border: "1px solid",
        borderColor: "divider",
        boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
      }}
    >
      {/* Search + Filters Row */}
      <Box sx={{ px: 2, py: 1.5 }}>
        <Box sx={{ display: "flex", gap: 2, alignItems: "flex-start" }}>
          {/* Search */}
          <Box sx={{ flex: 1 }}>
            <TextField
              fullWidth
              size="small"
              value={searchInput}
              onChange={(e) => audit.setSearchInput(e.target.value)}
              placeholder="Tìm kiếm hành động, đối tượng..."
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: "8px",
                  backgroundColor: "action.hover",
                  py: 0,
                  "& fieldset": { border: "none" },
                },
                "& .MuiOutlinedInput-input": {
                  py: "6px",
                  fontSize: "0.875rem",
                },
              }}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchOutlined sx={{ fontSize: 18, color: "text.disabled" }} />
                    </InputAdornment>
                  ),
                },
              }}
            />
          </Box>

          {/* Quick Filters */}
          <Box sx={{ display: "flex", gap: 1, flexShrink: 0 }}>
            <FormControl size="small" sx={{ minWidth: 110 }}>
              <Select
                value={filters.userRole}
                onChange={(e) => updateFilter("userRole", e.target.value)}
                displayEmpty
                sx={{
                  borderRadius: "8px",
                  backgroundColor: "action.hover",
                  fontSize: "0.8rem",
                  "& .MuiSelect-select": { py: "4px", px: 1.5 },
                  "& fieldset": { border: "none" },
                }}
                renderValue={(value) => {
                  const opt = ROLE_OPTIONS.find((o) => o.value === value);
                  return (
                    <Typography sx={{ fontSize: "0.8rem" }}>
                      {opt ? opt.label : "Vai trò"}
                    </Typography>
                  );
                }}
              >
                <MenuItem value=""><em>Tất cả vai trò</em></MenuItem>
                {ROLE_OPTIONS.map((opt) => (
                  <MenuItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl size="small" sx={{ minWidth: 120 }}>
              <Select
                value={filters.action}
                onChange={(e) => updateFilter("action", e.target.value)}
                displayEmpty
                sx={{
                  borderRadius: "8px",
                  backgroundColor: "action.hover",
                  fontSize: "0.8rem",
                  "& .MuiSelect-select": { py: "4px", px: 1.5 },
                  "& fieldset": { border: "none" },
                }}
                renderValue={(value) => {
                  const opt = ACTION_OPTIONS.find((o) => o.value === value);
                  return (
                    <Typography sx={{ fontSize: "0.8rem" }}>
                      {opt ? opt.label : "Hành động"}
                    </Typography>
                  );
                }}
              >
                <MenuItem value=""><em>Tất cả hành động</em></MenuItem>
                {ACTION_OPTIONS.map((opt) => (
                  <MenuItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl size="small" sx={{ minWidth: 100 }}>
              <Select
                value={filters.result}
                onChange={(e) => updateFilter("result", e.target.value)}
                displayEmpty
                sx={{
                  borderRadius: "8px",
                  backgroundColor: "action.hover",
                  fontSize: "0.8rem",
                  "& .MuiSelect-select": { py: "4px", px: 1.5 },
                  "& fieldset": { border: "none" },
                }}
                renderValue={(value) => {
                  const opt = RESULT_OPTIONS.find((o) => o.value === value);
                  return (
                    <Typography sx={{ fontSize: "0.8rem" }}>
                      {opt ? opt.label : "Kết quả"}
                    </Typography>
                  );
                }}
              >
                <MenuItem value=""><em>Tất cả kết quả</em></MenuItem>
                {RESULT_OPTIONS.map((opt) => (
                  <MenuItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Date range */}
            <TextField
              type="date"
              size="small"
              value={filters.from}
              onChange={(e) => updateFilter("from", e.target.value)}
              placeholder="Từ"
              sx={{
                width: 130,
                "& .MuiOutlinedInput-root": {
                  borderRadius: "8px",
                  backgroundColor: "action.hover",
                  fontSize: "0.8rem",
                  "& fieldset": { border: "none" },
                },
                "& input": { py: "4px", px: 1.5 },
              }}
              slotProps={{
                inputLabel: { shrink: true },
              }}
            />
            <TextField
              type="date"
              size="small"
              value={filters.to}
              onChange={(e) => updateFilter("to", e.target.value)}
              placeholder="Đến"
              sx={{
                width: 130,
                "& .MuiOutlinedInput-root": {
                  borderRadius: "8px",
                  backgroundColor: "action.hover",
                  fontSize: "0.8rem",
                  "& fieldset": { border: "none" },
                },
                "& input": { py: "4px", px: 1.5 },
              }}
              slotProps={{
                inputLabel: { shrink: true },
              }}
            />

            {hasActiveFilters && (
              <Button
                size="small"
                variant="text"
                color="error"
                startIcon={<ClearOutlined sx={{ fontSize: 14 }} />}
                onClick={handleClearFilters}
                sx={{
                  fontSize: "0.75rem",
                  borderRadius: "8px",
                  px: 1,
                  whiteSpace: "nowrap",
                }}
              >
                Xóa
              </Button>
            )}
          </Box>
        </Box>
      </Box>

    </Box>
  );
}
