import { Box, Typography } from "@mui/material";
import PeopleAltOutlined from "@mui/icons-material/PeopleAltOutlined";

export default function AdminUsersHeader() {
  return (
    <Box
      sx={{ mb: 3, pb: 3, borderBottom: "1px solid", borderColor: "divider" }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
        <Box
          sx={{
            width: 48,
            height: 48,
            borderRadius: "14px",
            background: "linear-gradient(135deg, #f97316, #ea580c)",
            display: "grid",
            placeItems: "center",
            color: "white",
            boxShadow: "0 8px 24px rgba(249,115,22,.35)",
          }}
        >
          <PeopleAltOutlined />
        </Box>
        <Box>
          <Typography
            sx={{ fontWeight: 800, fontSize: "1.75rem", lineHeight: 1.1 }}
          >
            Quản lý người dùng
          </Typography>
          <Typography color="text.secondary" sx={{ fontSize: "0.9rem" }}>
            Theo dõi và kiểm soát tài khoản trong hệ thống
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}
