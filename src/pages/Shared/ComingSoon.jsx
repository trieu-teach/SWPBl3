import { Box, Button, Paper, Typography } from "@mui/material";
import { ConstructionOutlined } from "@mui/icons-material";
import { Link } from "react-router-dom";
import AppShell from "../../components/AppShell/AppShell.jsx";
import { useAuth } from "../../features/auth/AuthProvider.jsx";

export default function ComingSoon({ title = "Tính năng đang phát triển" }) {
  const { user } = useAuth();
  const home = user?.role === "ADMIN" ? "/admin/dashboard" : "/dashboard";
  return (
    <AppShell role={user?.role}>
      <Paper
        variant="outlined"
        sx={{
          maxWidth: 680,
          mx: "auto",
          mt: { xs: 3, md: 8 },
          p: { xs: 3, md: 6 },
          textAlign: "center",
          borderRadius: 4,
        }}
      >
        <Box
          sx={{
            width: 64,
            height: 64,
            display: "grid",
            placeItems: "center",
            mx: "auto",
            mb: 2,
            borderRadius: 3,
            bgcolor: "action.hover",
            color: "primary.main",
          }}
        >
          <ConstructionOutlined fontSize="large" />
        </Box>
        <Typography variant="h4" sx={{ fontWeight: 800, mb: 1 }}>
          {title}
        </Typography>
        <Typography sx={{ color: "text.secondary", mb: 3 }}>
          Điều hướng đã sẵn sàng. Nội dung của tính năng này sẽ được triển khai
          ở bước tiếp theo.
        </Typography>
        <Button component={Link} to={home} variant="contained">
          Quay về tổng quan
        </Button>
      </Paper>
    </AppShell>
  );
}
