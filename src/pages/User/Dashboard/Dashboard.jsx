import { Box, Typography, Card, CardContent, Grid } from "@mui/material";
import UserLayout from "../Layout/UserLayout.jsx";

const QUICK_ACTIONS = [
  { title: "Tài liệu", desc: "Quản lý tài liệu cá nhân", count: 0 },
  { title: "Chia sẻ", desc: "Tài liệu đã chia sẻ với tôi", count: 0 },
  { title: "Yêu thích", desc: "Tài liệu đánh dấu yêu thích", count: 0 },
  { title: "Gần đây", desc: "Tài liệu truy cập gần đây", count: 0 },
];

export default function Dashboard() {
  return (
    <UserLayout>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 800, mb: 0.5 }}>
          Xin chào!
        </Typography>
        <Typography className="bx-form-sub" sx={{ color: "var(--text-secondary)", fontSize: "1rem" }}>
          Chào mừng bạn quay trở lại DocuMind.
        </Typography>
      </Box>

      <Grid container spacing={2}>
        {QUICK_ACTIONS.map((item) => (
          <Grid item xs={12} sm={6} key={item.title}>
            <Card
              sx={{
                cursor: "pointer",
                background: "var(--bg-card)",
                border: "1px solid",
                borderColor: "var(--border-color)",
                borderRadius: "var(--radius-md)",
                transition: "transform 0.15s, box-shadow 0.15s",
                "&:hover": {
                  transform: "translateY(-2px)",
                  boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
                },
              }}
            >
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
                  {item.title}
                </Typography>
                <Typography sx={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>
                  {item.desc}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </UserLayout>
  );
}
