import AddOutlined from "@mui/icons-material/AddOutlined";
import PolicyOutlined from "@mui/icons-material/PolicyOutlined";
import { Box, Button, Typography } from "@mui/material";

export default function ModerationKeywordsHeader({ onCreate }) {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: { xs: "flex-start", sm: "center" },
        justifyContent: "space-between",
        flexDirection: { xs: "column", sm: "row" },
        gap: 2,
        mb: 3,
        pb: 3,
        borderBottom: "1px solid",
        borderColor: "divider",
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
            boxShadow: "0 8px 24px rgba(249,115,22,.28)",
          }}
        >
          <PolicyOutlined />
        </Box>
        <Box>
          <Typography variant="h4" fontWeight={800}>
            Từ khóa kiểm duyệt
          </Typography>
          <Typography color="text.secondary">
            Thiết lập từ khóa dùng để phát hiện nội dung cần kiểm tra.
          </Typography>
        </Box>
      </Box>
      <Button
        variant="contained"
        startIcon={<AddOutlined />}
        onClick={onCreate}
      >
        Thêm từ khóa
      </Button>
    </Box>
  );
}
