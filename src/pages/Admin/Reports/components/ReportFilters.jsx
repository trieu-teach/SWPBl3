import {
  Box,
  Button,
  ButtonGroup,
  MenuItem,
  Select,
  TextField,
  Typography,
} from "@mui/material";
import CalendarMonthOutlined from "@mui/icons-material/CalendarMonthOutlined";
import RefreshOutlined from "@mui/icons-material/RefreshOutlined";
import { getDateRangePresets } from "../../utils/admin-formatters.js";

const GROUP_BY_OPTIONS = [
  { value: "day", label: "Theo ngày" },
  { value: "week", label: "Theo tuần" },
  { value: "month", label: "Theo tháng" },
];

const LIMIT_OPTIONS = [
  { value: 5, label: "Top 5" },
  { value: 10, label: "Top 10" },
  { value: 15, label: "Top 15" },
  { value: 20, label: "Top 20" },
];

export default function ReportFilters({ reports }) {
  const { dateRange, groupBy, chartLimit } = reports;
  const presets = getDateRangePresets();

  return (
    <Box
      sx={{
        borderRadius: "16px",
        overflow: "hidden",
        mb: 3,
        background: "background.paper",
        border: "1px solid",
        borderColor: "divider",
        boxShadow: "none",
      }}
    >
      {/* Header bar */}
      <Box
        sx={{
          px: 2.5,
          py: 2,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderBottom: "1px solid",
          borderColor: "divider",
          flexWrap: "wrap",
          gap: 2,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Box
            sx={{
              width: 36,
              height: 36,
              borderRadius: "10px",
              background: "linear-gradient(135deg, #f97316 0%, #ea580c 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              boxShadow: "0 4px 12px rgba(249, 115, 22, 0.25)",
            }}
          >
            <CalendarMonthOutlined sx={{ fontSize: 18 }} />
          </Box>
          <Typography variant="body1" fontWeight={600}>
            Bộ lọc thời gian
          </Typography>
        </Box>

        {/* Date presets */}
        <ButtonGroup size="medium" variant="outlined" sx={{ borderRadius: "12px" }}>
          {presets.map((preset) => {
            const isActive = dateRange.from === preset.from && dateRange.to === preset.to;
            return (
              <Button
                key={preset.label}
                onClick={() => reports.setPresetRange(preset.from, preset.to)}
                sx={{
                  borderRadius: "12px",
                  fontSize: "0.82rem",
                  px: 2,
                  fontWeight: isActive ? 600 : 500,
                  color: isActive ? "#f97316" : "text.secondary",
                  bgcolor: isActive ? "rgba(249, 115, 22, 0.08)" : "transparent",
                  borderColor: isActive ? "#f97316" : "divider",
                  "&:hover": {
                    bgcolor: "rgba(249, 115, 22, 0.08)",
                    borderColor: "#f97316",
                  },
                }}
              >
                {preset.label}
              </Button>
            );
          })}
        </ButtonGroup>

        {/* Date pickers */}
        <Box sx={{ display: "flex", gap: 1.5, alignItems: "center", flexWrap: "wrap" }}>
          <TextField
            type="date"
            size="medium"
            label="Từ ngày"
            value={dateRange.from}
            onChange={(e) => reports.updateDateRange("from", e.target.value)}
            slotProps={{
              inputLabel: { shrink: true },
            }}
            sx={{
              width: 160,
              "& .MuiOutlinedInput-root": { borderRadius: "12px" },
            }}
          />
          <TextField
            type="date"
            size="medium"
            label="Đến ngày"
            value={dateRange.to}
            onChange={(e) => reports.updateDateRange("to", e.target.value)}
            slotProps={{
              inputLabel: { shrink: true },
            }}
            sx={{
              width: 160,
              "& .MuiOutlinedInput-root": { borderRadius: "12px" },
            }}
          />
        </Box>

        {/* Selectors */}
        <Box sx={{ display: "flex", gap: 1.5, alignItems: "center" }}>
          <Select
            size="medium"
            value={groupBy}
            onChange={(e) => reports.setGroupBy(e.target.value)}
            sx={{
              minWidth: 130,
              borderRadius: "12px",
              fontSize: "0.85rem",
              "& .MuiOutlinedInput-root": { borderRadius: "12px" },
            }}
          >
            {GROUP_BY_OPTIONS.map((opt) => (
              <MenuItem key={opt.value} value={opt.value}>
                {opt.label}
              </MenuItem>
            ))}
          </Select>
          <Select
            size="medium"
            value={chartLimit}
            onChange={(e) => reports.setChartLimit(Number(e.target.value))}
            sx={{
              minWidth: 110,
              borderRadius: "12px",
              fontSize: "0.85rem",
              "& .MuiOutlinedInput-root": { borderRadius: "12px" },
            }}
          >
            {LIMIT_OPTIONS.map((opt) => (
              <MenuItem key={opt.value} value={opt.value}>
                {opt.label}
              </MenuItem>
            ))}
          </Select>
          <Button
            size="medium"
            variant="outlined"
            startIcon={<RefreshOutlined sx={{ fontSize: 18 }} />}
            onClick={reports.reload}
            sx={{
              borderRadius: "12px",
              px: 2,
              borderColor: "divider",
              color: "text.secondary",
            }}
          >
            Làm mới
          </Button>
        </Box>
      </Box>
    </Box>
  );
}
