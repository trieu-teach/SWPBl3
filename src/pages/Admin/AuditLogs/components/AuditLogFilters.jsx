import { useState } from "react";
import {
  Box,
  Button,
  Chip,
  Collapse,
  FormControl,
  IconButton,
  InputAdornment,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
} from "@mui/material";
import FilterListOutlined from "@mui/icons-material/FilterListOutlined";
import SearchOutlined from "@mui/icons-material/SearchOutlined";
import CloseOutlined from "@mui/icons-material/CloseOutlined";
import ArrowDownwardOutlined from "@mui/icons-material/ArrowDownwardOutlined";
import ArrowUpwardOutlined from "@mui/icons-material/ArrowUpwardOutlined";

export const ACTION_DROPDOWN = [
  { action: "USER_LOGIN", label: "Đăng nhập" },
  { action: "auth.registration_pending", label: "Đăng ký tài khoản" },
  { action: "auth.account_activated", label: "Kích hoạt tài khoản" },
  { action: "DOCUMENT_UPLOAD", label: "Tải tài liệu lên" },
  { action: "DOCUMENT_DELETE", label: "Xóa tài liệu" },
  { action: "DOCUMENT_HIDE", label: "Ẩn tài liệu" },
  { action: "PUBLIC_DOCUMENT_SAVE", label: "Lưu tài liệu cộng đồng" },
  { action: "PUBLIC_DOCUMENT_UNSAVE", label: "Bỏ lưu tài liệu cộng đồng" },
  { action: "DOCUMENT_MODERATION", label: "Kiểm duyệt tài liệu" },
  { action: "DOCUMENT_REPORT_RESOLUTION", label: "Xử lý báo cáo vi phạm" },
  { action: "admin.user_status_updated", label: "Cập nhật trạng thái người dùng" },
  { action: "admin.user_role_updated", label: "Cập nhật vai trò người dùng" },
  { action: "user.profile_updated", label: "Cập nhật hồ sơ" },
  { action: "payment.created", label: "Tạo thanh toán" },
  { action: "payment.paid", label: "Thanh toán thành công" },
  { action: "payment.expired", label: "Thanh toán hết hạn" },
  { action: "payment.refunded", label: "Hoàn tiền" },
  { action: "subscription.activated", label: "Kích hoạt gói" },
  { action: "subscription.expired", label: "Hết hạn gói" },
  { action: "subscription.refund_applied", label: "Áp dụng hoàn tiền gói" },
];

const ROLE_OPTIONS = [
  { value: "USER", label: "Người dùng" },
  { value: "ADMIN", label: "Quản trị viên" },
  { value: "MODERATOR", label: "Kiểm duyệt viên" },
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
  const [expanded, setExpanded] = useState(false);

  const hasActiveFilters = filters.userRole || filters.action || filters.result || filters.from || filters.to;
  const activeCount = [filters.userRole, filters.action, filters.result, filters.from, filters.to].filter(Boolean).length;

  const handleClearFilters = () => {
    updateFilter("userRole", "");
    updateFilter("action", "");
    updateFilter("result", "");
    updateFilter("from", "");
    updateFilter("to", "");
  };

  return (
    <Box sx={{ borderRadius: "16px", overflow: "hidden", mb: 3, background: "background.paper", border: "1px solid", borderColor: "divider", boxShadow: "none" }}>
      {/* Header */}
      <Box sx={{ px: 2.5, py: 2, display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: expanded ? "1px solid" : "none", borderColor: "divider" }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Box sx={{ width: 36, height: 36, borderRadius: "10px", background: expanded ? "linear-gradient(135deg, #f97316 0%, #ea580c 100%)" : "action.selected", display: "flex", alignItems: "center", justifyContent: "center", color: expanded ? "white" : "text.secondary", boxShadow: expanded ? "0 4px 12px rgba(249,115,22,0.25)" : "none" }}>
            <FilterListOutlined sx={{ fontSize: 18 }} />
          </Box>
          <Typography variant="body2" fontWeight={600} color={expanded ? "text.primary" : "text.secondary"}>Bộ lọc</Typography>
          {hasActiveFilters && <Chip label={activeCount} size="small" sx={{ height: 20, fontSize: "0.7rem", fontWeight: 700, bgcolor: "#f97316", color: "white" }} />}
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          {hasActiveFilters && (
            <Button size="small" variant="outlined" color="error" startIcon={<CloseOutlined sx={{ fontSize: 14 }} />} onClick={handleClearFilters} sx={{ fontSize: "0.8rem", borderRadius: "10px", height: 36 }}>
              Xóa lọc
            </Button>
          )}
          <Button size="small" variant="text" endIcon={<FilterListOutlined sx={{ fontSize: 16, transition: "transform 0.2s", transform: expanded ? "rotate(180deg)" : "rotate(0deg)" }} />} onClick={() => setExpanded(!expanded)} sx={{ fontSize: "0.8rem", color: expanded ? "primary.main" : "text.secondary", borderRadius: "10px", fontWeight: expanded ? 600 : 400 }}>
            {expanded ? "Ẩn lọc" : "Lọc"}
          </Button>
        </Box>
      </Box>

      <Collapse in={expanded}>
        <Box sx={{ p: 2.5 }}>
          {/* Row 1: Role + Action + Result */}
          <Box sx={{ display: "flex", gap: 2, mb: 2, flexWrap: "wrap" }}>
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel id="filter-role-label">Vai trò</InputLabel>
              <Select labelId="filter-role-label" value={filters.userRole || ""} onChange={(e) => updateFilter("userRole", e.target.value)} label="Vai trò">
                <MenuItem value=""><em>Tất cả</em></MenuItem>
                {ROLE_OPTIONS.map((opt) => <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>)}
              </Select>
            </FormControl>

            <FormControl size="small" sx={{ minWidth: 220 }}>
              <InputLabel id="filter-action-label">Hành động</InputLabel>
              <Select labelId="filter-action-label" value={filters.action || ""} onChange={(e) => updateFilter("action", e.target.value)} label="Hành động">
                <MenuItem value=""><em>Tất cả</em></MenuItem>
                {ACTION_DROPDOWN.map((opt) => <MenuItem key={opt.action} value={opt.action}>{opt.label}</MenuItem>)}
              </Select>
            </FormControl>

            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel id="filter-result-label">Kết quả</InputLabel>
              <Select labelId="filter-result-label" value={filters.result || ""} onChange={(e) => updateFilter("result", e.target.value)} label="Kết quả">
                <MenuItem value=""><em>Tất cả</em></MenuItem>
                {RESULT_OPTIONS.map((opt) => <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>)}
              </Select>
            </FormControl>
          </Box>

          {/* Row 2: Date range + Sort */}
          <Box sx={{ display: "flex", gap: 2, mb: 2, alignItems: "center", flexWrap: "wrap" }}>
            <TextField type="date" size="small" label="Từ ngày" value={filters.from || ""} onChange={(e) => updateFilter("from", e.target.value)} slotProps={{ inputLabel: { shrink: true } }} sx={{ minWidth: 150 }} />
            <TextField type="date" size="small" label="Đến ngày" value={filters.to || ""} onChange={(e) => updateFilter("to", e.target.value)} slotProps={{ inputLabel: { shrink: true } }} sx={{ minWidth: 150 }} />

            <Box sx={{ display: "flex", gap: 0.5, alignItems: "center" }}>
              <Typography variant="caption" color="text.secondary" sx={{ mr: 0.5 }}>Thứ tự:</Typography>
              <Chip icon={<ArrowDownwardOutlined sx={{ fontSize: 16 }} />} label="Mới nhất" onClick={() => updateFilter("sortOrder", "desc")} color={filters.sortOrder === "desc" || !filters.sortOrder ? "primary" : "default"} variant={filters.sortOrder === "desc" || !filters.sortOrder ? "filled" : "outlined"} size="small" sx={{ borderRadius: "8px" }} />
              <Chip icon={<ArrowUpwardOutlined sx={{ fontSize: 16 }} />} label="Cũ nhất" onClick={() => updateFilter("sortOrder", "asc")} color={filters.sortOrder === "asc" ? "primary" : "default"} variant={filters.sortOrder === "asc" ? "filled" : "outlined"} size="small" sx={{ borderRadius: "8px" }} />
            </Box>
          </Box>

          {/* Row 3: Search */}
          <Box component="form" onSubmit={audit.applySearch} sx={{ display: "flex", gap: 1.5 }} role="search">
            <TextField
              fullWidth
              size="medium"
              value={searchInput}
              onChange={(e) => audit.setSearchInput(e.target.value)}
              placeholder="Tìm kiếm hành động, đối tượng..."
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: "12px",
                  backgroundColor: "action.hover",
                  "&:hover": { backgroundColor: "action.selected" },
                  "&.Mui-focused": { backgroundColor: "background.paper", boxShadow: "0 0 0 3px rgba(249,115,22,0.1)" },
                },
              }}
              slotProps={{
                input: {
                  startAdornment: <InputAdornment position="start"><SearchOutlined sx={{ fontSize: 20, color: "text.disabled" }} /></InputAdornment>,
                  endAdornment: searchInput ? (
                    <InputAdornment position="end">
                      <IconButton size="small" onClick={() => audit.setSearchInput("")} sx={{ minWidth: "auto", p: 0.5, color: "text.disabled" }}>
                        <CloseOutlined fontSize="small" />
                      </IconButton>
                    </InputAdornment>
                  ) : null,
                },
              }}
            />
          </Box>
        </Box>
      </Collapse>
    </Box>
  );
}
