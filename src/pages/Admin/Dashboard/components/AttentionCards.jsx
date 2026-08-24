import WarningAmberOutlined from "@mui/icons-material/WarningAmberOutlined";
import { Box, Card, CardContent, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";

const items = [
  { label: "Chờ kiểm duyệt", field: "pendingModeration", color: "#d97706" },
  { label: "AI xử lý lỗi", field: "extractionFailed", color: "#dc2626" },
  { label: "AI bị treo", field: "extractionStuck", color: "#ea580c" },
  {
    label: "Báo cáo chờ xử lý",
    field: "pendingReports",
    color: "#be123c",
    path: "/admin/violation-reports",
  },
  { label: "Thanh toán chờ", field: "pendingPayments", color: "#2563eb" },
  { label: "Gần đầy dung lượng", field: "nearStorageQuota", color: "#7c3aed" },
];

export default function AttentionCards({ attention }) {
  const navigate = useNavigate();

  return (
    <Box>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
        <WarningAmberOutlined color="warning" />
        <Typography variant="h6" fontWeight={750}>
          Cần chú ý
        </Typography>
      </Box>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            sm: "repeat(2, 1fr)",
            lg: "repeat(3, 1fr)",
          },
          gap: 2,
        }}
      >
        {items.map(({ label, field, color, path }) => (
          <Card
            key={field}
            component={path ? "button" : "div"}
            type={path ? "button" : undefined}
            variant="outlined"
            onClick={path ? () => navigate(path) : undefined}
            aria-label={path ? `Mở ${label.toLowerCase()}` : undefined}
            sx={{
              width: "100%",
              borderRadius: 3,
              color: "text.primary",
              font: "inherit",
              textAlign: "left",
              cursor: path ? "pointer" : "default",
              transition: "border-color 160ms ease, transform 160ms ease",
              ...(path && {
                "&:hover": {
                  borderColor: color,
                  transform: "translateY(-2px)",
                },
                "&:focus-visible": {
                  outline: "3px solid",
                  outlineColor: "primary.main",
                  outlineOffset: 2,
                },
              }),
            }}
          >
            <CardContent
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <Typography fontWeight={700}>{label}</Typography>
              <Typography variant="h4" fontWeight={800} sx={{ color }}>
                {attention?.[field] || 0}
              </Typography>
            </CardContent>
          </Card>
        ))}
      </Box>
    </Box>
  );
}
