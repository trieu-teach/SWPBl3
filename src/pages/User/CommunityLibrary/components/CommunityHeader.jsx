import { Box, Stack, Typography } from "@mui/material";
import { GroupsOutlined } from "@mui/icons-material";

export default function CommunityHeader() {
  return (
    <Stack
      direction={{ xs: "column", sm: "row" }}
      gap={{ xs: 2, sm: 3 }}
      alignItems={{ xs: "flex-start", sm: "center" }}
      sx={{ mb: 4 }}
    >
      <Box
        sx={{
          width: 52,
          height: 52,
          display: "grid",
          placeItems: "center",
          borderRadius: 3,
          bgcolor: "primary.main",
          color: "primary.contrastText",
        }}
      >
        <GroupsOutlined />
      </Box>
      <Box sx={{ minWidth: 0 }}>
        <Typography variant="h4" fontWeight={800}>
          Thư viện cộng đồng
        </Typography>
        <Typography color="text.secondary">
          Khám phá tài liệu học tập được chia sẻ bởi cộng đồng.
        </Typography>
      </Box>
    </Stack>
  );
}
