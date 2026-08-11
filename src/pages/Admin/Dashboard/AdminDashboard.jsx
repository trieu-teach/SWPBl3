import { Box, Typography, Card, CardContent, Grid } from "@mui/material";
import AdminLayout from "../Layout/AdminLayout.jsx";

const STATS = [
  { label: "Tổng người dùng", value: "—", color: "#818cf8" },
  { label: "Tài liệu", value: "—", color: "#34d399" },
  { label: "Yêu cầu chờ duyệt", value: "—", color: "#fbbf24" },
  { label: "Báo cáo", value: "—", color: "#f87171" },
];

export default function AdminDashboard() {
  return (
    <AdminLayout>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 800, mb: 0.5 }}>
          Bảng điều khiển
        </Typography>
        <Typography sx={{ color: "var(--text-secondary)" }}>
          Quản lý hệ thống DocuMind.
        </Typography>
      </Box>

      <Grid container spacing={2} sx={{ mb: 4 }}>
        {STATS.map((s) => (
          <Grid item xs={6} sm={3} key={s.label}>
            <Card
              sx={{
                background: "var(--bg-card)",
                border: "1px solid var(--border-color)",
                borderRadius: "var(--radius-md)",
              }}
            >
              <CardContent>
                <Typography
                  sx={{ color: s.color, fontWeight: 800, fontSize: "1.8rem", mb: 0.5 }}
                >
                  {s.value}
                </Typography>
                <Typography sx={{ color: "var(--text-secondary)", fontSize: "0.85rem" }}>
                  {s.label}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Typography
        sx={{
          color: "var(--text-secondary)",
          textAlign: "center",
          py: 6,
          fontSize: "0.95rem",
        }}
      >
        Nội dung quản trị sẽ được phát triển trong các bước tiếp theo.
      </Typography>
    </AdminLayout>
  );
}
