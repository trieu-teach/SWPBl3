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
  { value: "day", label: "Ngày" },
  { value: "week", label: "Tuần" },
  { value: "month", label: "Tháng" },
];

const LIMIT_OPTIONS = [
  { value: 5, label: "5" },
  { value: 10, label: "10" },
  { value: 15, label: "15" },
  { value: 20, label: "20" },
];

const TARGET_OPTIONS = [
  { value: "all", label: "Tất cả" },
  { value: "upload", label: "Upload" },
  { value: "downloaded", label: "Top tải" },
  { value: "saved", label: "Top lưu" },
  { value: "stats", label: "Phân bố gói" },
];

export default function ReportFilters({ reports }) {
  const {
    draftRange,
    draftGroupBy,
    draftLimit,
    selectedTarget,
    updateDraftRange,
    setDraftPresetRange,
    setDraftGroupBy,
    setDraftLimit,
    setSelectedTarget,
    reloadAll,
  } = reports;
  
  const presets = getDateRangePresets();
  const { from: draftFrom, to: draftTo } = draftRange;

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
      {/* Main row */}
      <Box
        sx={{
          px: 2.5,
          py: 1.5,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderBottom: "1px solid",
          borderColor: "divider",
          flexWrap: "wrap",
          gap: 2,
        }}
      >
        {/* Left: Title + Target Selector */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Box
            sx={{
              width: 32,
              height: 32,
              borderRadius: "8px",
              background: "linear-gradient(135deg, #f97316 0%, #ea580c 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
            }}
          >
            <CalendarMonthOutlined sx={{ fontSize: 16 }} />
          </Box>
          
          <Select
            size="small"
            value={selectedTarget}
            onChange={(e) => setSelectedTarget(e.target.value)}
            sx={{
              minWidth: 120,
              borderRadius: "10px",
              fontSize: "0.85rem",
              height: 36,
              "& .MuiOutlinedInput-root": { borderRadius: "10px" },
            }}
          >
            {TARGET_OPTIONS.map((opt) => (
              <MenuItem key={opt.value} value={opt.value}>
                {opt.label}
              </MenuItem>
            ))}
          </Select>

          {/* Date pickers inline */}
          <TextField
            type="date"
            size="small"
            value={draftFrom}
            onChange={(e) => updateDraftRange("from", e.target.value)}
            slotProps={{
              inputLabel: { shrink: true },
            }}
            sx={{
              width: 130,
              "& .MuiOutlinedInput-root": { borderRadius: "10px" },
              "& .MuiInputBase-input": { fontSize: "0.82rem", py: 0.75 },
            }}
          />
          <Typography variant="body2" color="text.secondary" sx={{ mx: -0.5 }}>
            –
          </Typography>
          <TextField
            type="date"
            size="small"
            value={draftTo}
            onChange={(e) => updateDraftRange("to", e.target.value)}
            slotProps={{
              inputLabel: { shrink: true },
            }}
            sx={{
              width: 130,
              "& .MuiOutlinedInput-root": { borderRadius: "10px" },
              "& .MuiInputBase-input": { fontSize: "0.82rem", py: 0.75 },
            }}
          />
        </Box>

        {/* Right: Presets + Options + Refresh */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          {/* Preset buttons */}
          <ButtonGroup size="small" variant="outlined" sx={{ borderRadius: "10px" }}>
            {presets.map((preset) => {
              const isActive = draftFrom === preset.from && draftTo === preset.to;
              return (
                <Button
                  key={preset.label}
                  onClick={() => setDraftPresetRange(preset.from, preset.to)}
                  sx={{
                    borderRadius: "10px",
                    fontSize: "0.78rem",
                    px: 1.5,
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

          {/* Options */}
          <Select
            size="small"
            value={draftGroupBy}
            onChange={(e) => setDraftGroupBy(e.target.value)}
            sx={{
              minWidth: 80,
              borderRadius: "10px",
              fontSize: "0.82rem",
              height: 36,
              "& .MuiOutlinedInput-root": { borderRadius: "10px" },
            }}
          >
            {GROUP_BY_OPTIONS.map((opt) => (
              <MenuItem key={opt.value} value={opt.value}>
                {opt.label}
              </MenuItem>
            ))}
          </Select>

          <Select
            size="small"
            value={draftLimit}
            onChange={(e) => setDraftLimit(Number(e.target.value))}
            sx={{
              minWidth: 65,
              borderRadius: "10px",
              fontSize: "0.82rem",
              height: 36,
              "& .MuiOutlinedInput-root": { borderRadius: "10px" },
            }}
          >
            {LIMIT_OPTIONS.map((opt) => (
              <MenuItem key={opt.value} value={opt.value}>
                Top {opt.label}
              </MenuItem>
            ))}
          </Select>

          <Button
            size="small"
            variant="outlined"
            startIcon={<RefreshOutlined sx={{ fontSize: 16 }} />}
            onClick={reloadAll}
            sx={{
              borderRadius: "10px",
              px: 1.5,
              borderColor: "divider",
              color: "text.secondary",
              height: 36,
              fontSize: "0.82rem",
            }}
          >
            Refresh
          </Button>
        </Box>
      </Box>
    </Box>
  );
}
