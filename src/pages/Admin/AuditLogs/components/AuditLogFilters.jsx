import { useState } from "react";
import {
  Box,
  Button,
  Chip,
  InputAdornment,
  TextField,
  Typography,
  Collapse,
} from "@mui/material";
import FilterListOutlined from "@mui/icons-material/FilterListOutlined";
import SearchOutlined from "@mui/icons-material/SearchOutlined";
import CloseOutlined from "@mui/icons-material/CloseOutlined";
import {
  ACTIONS_BY_CATEGORY,
  ACTION_CATEGORIES,
} from "../../utils/admin-formatters.js";

export default function AuditLogFilters({ audit }) {
  const { filters, searchInput } = audit;
  const [expanded, setExpanded] = useState(false);

  const hasActiveFilters = filters.action || filters.keyword || filters.userId;
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
          borderBottom: expanded ? "1px solid" : "none",
          borderColor: "divider",
          background: "background.paper",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Box
            sx={{
              width: 36,
              height: 36,
              borderRadius: "10px",
              background: expanded
                ? "linear-gradient(135deg, #f97316 0%, #ea580c 100%)"
                : "action.selected",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: expanded ? "white" : "text.secondary",
              boxShadow: expanded ? "0 4px 12px rgba(249, 115, 22, 0.25)" : "none",
              transition: "all 0.2s",
            }}
          >
            <FilterListOutlined sx={{ fontSize: 18 }} />
          </Box>
          <Typography
            variant="body2"
            fontWeight={600}
            color={expanded ? "text.primary" : "text.secondary"}
          >
            Bộ lọc
          </Typography>
          {hasActiveFilters && (
            <Chip
              label={activeCount}
              size="small"
              sx={{
                height: 20,
                fontSize: "0.7rem",
                fontWeight: 700,
                bgcolor: "#f97316",
                color: "white",
              }}
            />
          )}
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          {hasActiveFilters && (
            <Button
              size="small"
              variant="outlined"
              color="error"
              startIcon={<CloseOutlined sx={{ fontSize: 14 }} />}
              onClick={audit.resetFilters}
              sx={{
                fontSize: "0.8rem",
                borderRadius: "10px",
                height: 36,
              }}
            >
              Xóa
            </Button>
          )}
          <Button
            size="small"
            variant="text"
            endIcon={
              <FilterListOutlined
                sx={{
                  fontSize: 16,
                  transition: "transform 0.2s",
                  transform: expanded ? "rotate(180deg)" : "rotate(0deg)",
                }}
              />
            }
            onClick={() => setExpanded(!expanded)}
            sx={{
              fontSize: "0.8rem",
              color: expanded ? "primary.main" : "text.secondary",
              borderRadius: "10px",
              fontWeight: expanded ? 600 : 400,
            }}
          >
            {expanded ? "Ẩn lọc" : "Lọc"}
          </Button>
        </Box>
      </Box>

      <Collapse in={expanded}>
        <Box sx={{ p: 2.5 }}>
          {/* Search bar */}
          <Box
            component="form"
            onSubmit={audit.applySearch}
            sx={{ display: "flex", gap: 1.5, mb: 3 }}
          >
            <TextField
              fullWidth
              size="medium"
              value={searchInput}
              onChange={(e) => audit.setSearchInput(e.target.value)}
              placeholder="Tìm kiếm hành động, người thực hiện, đối tượng..."
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: "12px",
                  backgroundColor: "action.hover",
                  "&:hover": {
                    backgroundColor: "action.selected",
                  },
                  "&.Mui-focused": {
                    backgroundColor: "background.paper",
                    boxShadow: "0 0 0 3px rgba(249, 115, 22, 0.1)",
                  },
                },
              }}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchOutlined sx={{ fontSize: 20, color: "text.disabled" }} />
                    </InputAdornment>
                  ),
                  endAdornment: searchInput ? (
                    <InputAdornment position="end">
                      <Button
                        size="small"
                        onClick={() => {
                          audit.setSearchInput("");
                          audit.updateFilter("keyword", "");
                        }}
                        sx={{ minWidth: "auto", p: 0.5, color: "text.disabled" }}
                      >
                        ✕
                      </Button>
                    </InputAdornment>
                  ) : null,
                },
              }}
            />
            <Button
              type="submit"
              variant="contained"
              sx={{
                px: 3,
                borderRadius: "12px",
                whiteSpace: "nowrap",
                fontWeight: 600,
                boxShadow: "none",
                background: "linear-gradient(135deg, #f97316 0%, #ea580c 100%)",
                "&:hover": {
                  boxShadow: "0 4px 12px rgba(249, 115, 22, 0.3)",
                },
              }}
            >
              Tìm kiếm
            </Button>
          </Box>

          {/* Action category filters */}
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
            {Object.entries(ACTIONS_BY_CATEGORY).map(([catKey, actions]) => {
              const cat = ACTION_CATEGORIES[catKey];
              if (!cat) return null;
              return (
                <Box key={catKey}>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      mb: 1,
                    }}
                  >
                    <Box
                      sx={{
                        width: 8,
                        height: 8,
                        borderRadius: "50%",
                        bgcolor: cat.color,
                        flexShrink: 0,
                      }}
                    />
                    <Typography
                      variant="caption"
                      fontWeight={700}
                      color="text.secondary"
                      sx={{
                        textTransform: "uppercase",
                        letterSpacing: "0.08em",
                        fontSize: "0.7rem",
                      }}
                    >
                      {cat.label}
                    </Typography>
                  </Box>
                  <Box
                    sx={{ display: "flex", flexWrap: "wrap", gap: 0.75, ml: 0.5 }}
                  >
                    {actions.map((action) => {
                      const isActive = filters.action === action.key;
                      return (
                        <Chip
                          key={action.key}
                          label={action.label}
                          onClick={() =>
                            audit.updateFilter(
                              "action",
                              isActive ? "" : action.key,
                            )
                          }
                          sx={{
                            cursor: "pointer",
                            fontWeight: isActive ? 600 : 500,
                            fontSize: "0.78rem",
                            height: 32,
                            borderRadius: "10px",
                            bgcolor: isActive ? action.bg : "transparent",
                            color: isActive ? action.color : "text.secondary",
                            border: "1px solid",
                            borderColor: isActive
                              ? action.color + "44"
                              : "divider",
                            transition: "all 0.2s ease",
                            "&:hover": {
                              bgcolor: action.bg,
                              color: action.color,
                              borderColor: action.color + "44",
                            },
                          }}
                        />
                      );
                    })}
                  </Box>
                </Box>
              );
            })}
          </Box>
        </Box>
      </Collapse>
    </Box>
  );
}
