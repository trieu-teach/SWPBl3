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

const FILE_TYPE_OPTIONS = [
  { value: "PDF", label: "PDF" },
  { value: "DOCX", label: "DOCX" },
  { value: "PPTX", label: "PPTX" },
  { value: "XLSX", label: "XLSX" },
];

const VISIBILITY_OPTIONS = [
  { value: "PUBLIC", label: "Cộng đồng" },
  { value: "PRIVATE", label: "Riêng tư" },
];

export default function DownloadLogFilters({ download }) {
  const { filters, hasActiveFilters, updateFilter, resetFilters } = download;

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
      {/* Compact Search Row */}
      <Box sx={{ px: 2, py: 1.5 }}>
        <Box sx={{ display: "flex", gap: 2, alignItems: "flex-start" }}>
          {/* Search */}
          <Box sx={{ flex: 1 }}>
            <TextField
              fullWidth
              size="small"
              value={filters.keyword}
              onChange={(e) => updateFilter("keyword", e.target.value)}
              placeholder="Tìm tên, email, tài liệu, môn học..."
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
                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                      <Typography sx={{ fontSize: "0.8rem" }}>
                        {opt ? opt.label : "Vai trò"}
                      </Typography>
                    </Box>
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

            <FormControl size="small" sx={{ minWidth: 100 }}>
              <Select
                value={filters.fileType}
                onChange={(e) => updateFilter("fileType", e.target.value)}
                displayEmpty
                sx={{
                  borderRadius: "8px",
                  backgroundColor: "action.hover",
                  fontSize: "0.8rem",
                  "& .MuiSelect-select": { py: "4px", px: 1.5 },
                  "& fieldset": { border: "none" },
                }}
                renderValue={(value) => {
                  const opt = FILE_TYPE_OPTIONS.find((o) => o.value === value);
                  return (
                    <Typography sx={{ fontSize: "0.8rem" }}>
                      {opt ? opt.label : "Loại file"}
                    </Typography>
                  );
                }}
              >
                <MenuItem value=""><em>Tất cả loại</em></MenuItem>
                {FILE_TYPE_OPTIONS.map((opt) => (
                  <MenuItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl size="small" sx={{ minWidth: 100 }}>
              <Select
                value={filters.visibility}
                onChange={(e) => updateFilter("visibility", e.target.value)}
                displayEmpty
                sx={{
                  borderRadius: "8px",
                  backgroundColor: "action.hover",
                  fontSize: "0.8rem",
                  "& .MuiSelect-select": { py: "4px", px: 1.5 },
                  "& fieldset": { border: "none" },
                }}
                renderValue={(value) => {
                  const opt = VISIBILITY_OPTIONS.find((o) => o.value === value);
                  return (
                    <Typography sx={{ fontSize: "0.8rem" }}>
                      {opt ? opt.label : "Phạm vi"}
                    </Typography>
                  );
                }}
              >
                <MenuItem value=""><em>Tất cả phạm vi</em></MenuItem>
                {VISIBILITY_OPTIONS.map((opt) => (
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
                onClick={resetFilters}
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
