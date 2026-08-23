import { Box, Button, Typography } from "@mui/material";
import DescriptionOutlined from "@mui/icons-material/DescriptionOutlined";
import FactCheckOutlined from "@mui/icons-material/FactCheckOutlined";

export default function AdminDocumentsHeader({ admin }) {
  return (
    <Box
      sx={{ mb: 3, pb: 3, borderBottom: "1px solid", borderColor: "divider" }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: { xs: "flex-start", sm: "center" },
          justifyContent: "space-between",
          flexDirection: { xs: "column", sm: "row" },
          gap: 2,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: "14px",
              background: "linear-gradient(135deg,#f97316,#ea580c)",
              color: "white",
              display: "grid",
              placeItems: "center",
              boxShadow: "0 8px 24px rgba(249,115,22,.35)",
            }}
          >
            <DescriptionOutlined />
          </Box>
          <Box>
            <Typography
              sx={{ fontWeight: 800, fontSize: "1.75rem", lineHeight: 1.1 }}
            >
              Quản lý tài liệu
            </Typography>
            <Typography color="text.secondary" sx={{ fontSize: ".9rem" }}>
              Kiểm duyệt và quản lý tài liệu toàn hệ thống
            </Typography>
          </Box>
        </Box>
        <Button
          variant={admin.reviewQueueOnly ? "contained" : "outlined"}
          startIcon={<FactCheckOutlined />}
          onClick={admin.toggleReviewQueue}
        >
          {admin.reviewQueueOnly ? "Xem tất cả tài liệu" : "Hàng chờ xử lý"}
        </Button>
      </Box>
    </Box>
  );
}
