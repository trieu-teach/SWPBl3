import { Box, Typography, useTheme } from "@mui/material";
import VerifiedUserOutlined from "@mui/icons-material/VerifiedUserOutlined";

export default function SubscriptionHeader() {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  return (
    <Box
      sx={{
        mb: 4,
        pb: 3,
        borderBottom: "1px solid",
        borderColor: "var(--border-color)",
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1 }}>
        <Box
          sx={{
            width: 44,
            height: 44,
            borderRadius: "12px",
            background: isDark
              ? "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)"
              : "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: isDark
              ? "0 4px 12px rgba(99, 102, 241, 0.4)"
              : "0 4px 12px rgba(99, 102, 241, 0.3)",
          }}
        >
          <VerifiedUserOutlined sx={{ color: "white", fontSize: 24 }} />
        </Box>
        <Typography
          variant="h4"
          sx={{
            fontWeight: 800,
            fontSize: { xs: "1.5rem", md: "1.75rem" },
            color: isDark ? "#f9fafb" : "#1f2937",
          }}
        >
          Đăng ký gói dịch vụ
        </Typography>
      </Box>
      <Typography
        className="bx-form-sub"
        sx={{
          color: "var(--text-secondary)",
          fontSize: "1rem",
          lineHeight: 1.6,
          ml: 0.5,
        }}
      >
        Chọn gói phù hợp với nhu cầu của bạn và thanh toán an toàn qua{" "}
        <Box
          component="span"
          sx={{
            fontWeight: 600,
            color: isDark ? "#4ade80" : "#16a34a",
          }}
        >
          SePay
        </Box>
        .
      </Typography>
    </Box>
  );
}
