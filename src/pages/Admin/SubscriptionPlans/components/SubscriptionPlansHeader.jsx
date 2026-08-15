import { AddOutlined } from "@mui/icons-material";
import { Box, Button, Typography } from "@mui/material";

export default function SubscriptionPlansHeader({ onCreate }) {
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: { xs: "flex-start", sm: "center" },
        flexDirection: { xs: "column", sm: "row" },
        gap: 2,
        mb: 3,
      }}
    >
      <Box>
        <Typography variant="h4" fontWeight={800}>
          Quản lý gói dịch vụ
        </Typography>
        <Typography color="text.secondary">
          Thiết lập giá, thời hạn và giới hạn sử dụng của từng gói.
        </Typography>
      </Box>
      <Button
        variant="contained"
        startIcon={<AddOutlined />}
        onClick={onCreate}
      >
        Tạo gói mới
      </Button>
    </Box>
  );
}
