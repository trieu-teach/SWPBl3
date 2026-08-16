import {
  Box,
  Button,
  InputAdornment,
  TextField,
  Typography,
} from "@mui/material";
import FilterListOutlined from "@mui/icons-material/FilterListOutlined";
import SearchOutlined from "@mui/icons-material/SearchOutlined";
import PersonOutlined from "@mui/icons-material/PersonOutlined";
import DescriptionOutlined from "@mui/icons-material/DescriptionOutlined";
import ClearOutlined from "@mui/icons-material/ClearOutlined";

export default function DownloadLogFilters({ download }) {
  const { filters } = download;

  const hasActiveFilters = filters.userId || filters.documentId;
  const activeCount = Object.values(filters).filter(Boolean).length;

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
            <FilterListOutlined sx={{ fontSize: 18 }} />
          </Box>
          <Box>
            <Typography variant="body1" fontWeight={600}>
              Bộ lọc
            </Typography>
            {activeCount > 0 && (
              <Typography variant="caption" color="text.secondary">
                {activeCount} bộ lọc đang hoạt động
              </Typography>
            )}
          </Box>
        </Box>
        {hasActiveFilters && (
          <Button
            size="small"
            variant="outlined"
            color="error"
            startIcon={<ClearOutlined sx={{ fontSize: 14 }} />}
            onClick={download.resetFilters}
            sx={{
              fontSize: "0.8rem",
              borderRadius: "10px",
              height: 36,
            }}
          >
            Xóa tất cả
          </Button>
        )}
      </Box>

      {/* Filter fields */}
      <Box sx={{ p: 2.5 }}>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              sm: "repeat(2, 1fr)",
              md: "repeat(3, 1fr)",
            },
            gap: 2,
          }}
        >
          {/* User ID */}
          <Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, mb: 1 }}>
              <PersonOutlined sx={{ fontSize: 14, color: "text.secondary" }} />
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ fontWeight: 600, fontSize: "0.78rem" }}
              >
                Người dùng
              </Typography>
            </Box>
            <TextField
              fullWidth
              size="medium"
              value={filters.userId}
              onChange={(e) => download.updateFilter("userId", e.target.value)}
              placeholder="UUID người dùng..."
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: "12px",
                  backgroundColor: "action.hover",
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

          {/* Document ID */}
          <Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, mb: 1 }}>
              <DescriptionOutlined sx={{ fontSize: 14, color: "text.secondary" }} />
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ fontWeight: 600, fontSize: "0.78rem" }}
              >
                Tài liệu
              </Typography>
            </Box>
            <TextField
              fullWidth
              size="medium"
              value={filters.documentId}
              onChange={(e) => download.updateFilter("documentId", e.target.value)}
              placeholder="UUID tài liệu..."
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: "12px",
                  backgroundColor: "action.hover",
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

          {/* Placeholder */}
          <Box />
        </Box>
      </Box>
    </Box>
  );
}
