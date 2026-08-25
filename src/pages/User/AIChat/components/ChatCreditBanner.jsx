import { Alert, Button } from "@mui/material";
import CreditScoreOutlined from "@mui/icons-material/CreditScoreOutlined";
import { Link as RouterLink } from "react-router-dom";

export default function ChatCreditBanner({ presentation }) {
  if (!presentation?.blocked) return null;

  return (
    <Alert
      severity="warning"
      icon={<CreditScoreOutlined />}
      action={
        <Button
          component={RouterLink}
          to="/subscription"
          color="inherit"
          size="small"
          variant="outlined"
          sx={{ whiteSpace: "nowrap" }}
        >
          Xem gói &amp; thanh toán
        </Button>
      }
      sx={{ borderRadius: 0, alignItems: "center" }}
    >
      Bạn cần {presentation.required} AI Credits cho câu hỏi tiếp theo nhưng chỉ
      còn {presentation.remaining ?? 0}.
    </Alert>
  );
}
