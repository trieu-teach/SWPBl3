import WarningAmberOutlined from "@mui/icons-material/WarningAmberOutlined";
import { Box, Card, CardContent, Typography } from "@mui/material";

const items = [
  ["Chờ kiểm duyệt", "pendingModeration", "#d97706"],
  ["AI xử lý lỗi", "extractionFailed", "#dc2626"],
  ["AI bị treo", "extractionStuck", "#ea580c"],
  ["Báo cáo chờ xử lý", "pendingReports", "#be123c"],
  ["Thanh toán chờ", "pendingPayments", "#2563eb"],
  ["Gần đầy dung lượng", "nearStorageQuota", "#7c3aed"],
];

export default function AttentionCards({ attention }) {
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
        {items.map(([label, field, color]) => (
          <Card key={field} variant="outlined" sx={{ borderRadius: 3 }}>
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
