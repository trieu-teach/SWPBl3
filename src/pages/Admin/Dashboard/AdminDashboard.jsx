import { Box, Typography, Card, CardContent } from "@mui/material";
import PeopleAltOutlined from "@mui/icons-material/PeopleAltOutlined";
import DescriptionOutlined from "@mui/icons-material/DescriptionOutlined";
import PendingActionsOutlined from "@mui/icons-material/PendingActionsOutlined";
import AssessmentOutlined from "@mui/icons-material/AssessmentOutlined";
import AdminLayout from "../Layout/AdminLayout.jsx";

const STATS = [
  {
    label: "Tổng người dùng",
    value: "—",
    gradient: "linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)",
    icon: PeopleAltOutlined,
    glow: "rgba(124, 58, 237, 0.3)",
  },
  {
    label: "Tài liệu",
    value: "—",
    gradient: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
    icon: DescriptionOutlined,
    glow: "rgba(5, 150, 105, 0.3)",
  },
  {
    label: "Yêu cầu chờ duyệt",
    value: "—",
    gradient: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
    icon: PendingActionsOutlined,
    glow: "rgba(217, 119, 6, 0.3)",
  },
  {
    label: "Báo cáo",
    value: "—",
    gradient: "linear-gradient(135deg, #f43f5e 0%, #e11d48 100%)",
    icon: AssessmentOutlined,
    glow: "rgba(225, 29, 72, 0.3)",
  },
];

export default function AdminDashboard() {
  return (
    <AdminLayout>
      {/* Page Header */}
      <Box
        sx={{
          mb: 4,
          pb: 3,
          borderBottom: "1px solid",
          borderColor: "divider",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 0.5 }}>
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: "14px",
              background: "linear-gradient(135deg, #f97316 0%, #ea580c 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              boxShadow: "0 8px 24px rgba(249, 115, 22, 0.35)",
            }}
          >
            <AssessmentOutlined sx={{ fontSize: 24 }} />
          </Box>
          <Box>
            <Typography
              sx={{
                fontWeight: 800,
                fontSize: "1.75rem",
                lineHeight: 1.1,
                letterSpacing: "-0.02em",
                color: "text.primary",
              }}
            >
              Bảng điều khiển
            </Typography>
            <Typography
              sx={{
                color: "text.secondary",
                fontSize: "0.9rem",
                fontWeight: 400,
              }}
            >
              Tổng quan hoạt động hệ thống DocuMind
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Stats Cards */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "repeat(2, 1fr)",
            sm: "repeat(2, 1fr)",
            md: "repeat(4, 1fr)",
          },
          gap: 2.5,
          mb: 4,
        }}
      >
        {STATS.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card
              key={stat.label}
              sx={{
                borderRadius: "20px",
                overflow: "hidden",
                position: "relative",
                boxShadow: "none",
                border: "1px solid",
                borderColor: "divider",
                transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                "&:hover": {
                  transform: "translateY(-4px)",
                  boxShadow: `0 20px 40px ${stat.glow}`,
                  borderColor: "transparent",
                },
              }}
            >
              {/* Top accent line */}
              <Box
                sx={{
                  height: 4,
                  background: stat.gradient,
                }}
              />
              <CardContent sx={{ p: 2.5 }}>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "flex-start",
                    justifyContent: "space-between",
                    mb: 2,
                  }}
                >
                  <Box>
                    <Typography
                      sx={{
                        fontSize: "2.25rem",
                        fontWeight: 800,
                        lineHeight: 1,
                        letterSpacing: "-0.03em",
                        color: "text.primary",
                      }}
                    >
                      {stat.value}
                    </Typography>
                  </Box>
                  <Box
                    sx={{
                      width: 48,
                      height: 48,
                      borderRadius: "14px",
                      background: stat.gradient,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "white",
                      boxShadow: `0 8px 20px ${stat.glow}`,
                    }}
                  >
                    <Icon sx={{ fontSize: 22 }} />
                  </Box>
                </Box>
                <Typography
                  sx={{
                    color: "text.secondary",
                    fontSize: "0.85rem",
                    fontWeight: 500,
                  }}
                >
                  {stat.label}
                </Typography>
              </CardContent>
            </Card>
          );
        })}
      </Box>

      {/* Placeholder Content */}
      <Card
        sx={{
          borderRadius: "20px",
          border: "1px solid",
          borderColor: "divider",
          boxShadow: "none",
        }}
      >
        <CardContent sx={{ py: 8, textAlign: "center" }}>
          <Box
            sx={{
              width: 72,
              height: 72,
              borderRadius: "50%",
              bgcolor: "action.hover",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              mx: "auto",
              mb: 2.5,
              color: "text.disabled",
            }}
          >
            <AssessmentOutlined sx={{ fontSize: 32 }} />
          </Box>
          <Typography
            variant="h6"
            fontWeight={600}
            sx={{ mb: 0.75, color: "text.primary" }}
          >
            Nội dung đang phát triển
          </Typography>
          <Typography
            sx={{
              color: "text.secondary",
              fontSize: "0.9rem",
              maxWidth: 400,
              mx: "auto",
            }}
          >
            Các biểu đồ và thống kê chi tiết sẽ được cập nhật trong các bản phát hành tiếp theo.
          </Typography>
        </CardContent>
      </Card>
    </AdminLayout>
  );
}
