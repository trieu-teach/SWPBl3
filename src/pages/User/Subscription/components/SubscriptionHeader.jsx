import { Box, Typography } from "@mui/material";

export default function SubscriptionHeader() {
  return (
    <Box sx={{ mb: 4 }}>
      <Typography
        variant="h4"
        sx={{ fontWeight: 800, mb: 0.5 }}
      >
        Đăng ký gói dịch vụ
      </Typography>
      <Typography
        className="bx-form-sub"
        sx={{ color: "var(--text-secondary)", fontSize: "1rem" }}
      >
        Chọn gói phù hợp với nhu cầu của bạn để trải nghiệm đầy đủ tính năng của DocuMind.
      </Typography>
    </Box>
  );
}
