import WarningAmberOutlined from "@mui/icons-material/WarningAmberOutlined";
import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from "@mui/material";

export default function DeleteModerationKeywordDialog({
  keyword,
  loading,
  onClose,
  onConfirm,
}) {
  return (
    <Dialog
      open={Boolean(keyword)}
      onClose={loading ? undefined : onClose}
      fullWidth
      maxWidth="xs"
    >
      <DialogTitle>Xóa từ khóa kiểm duyệt?</DialogTitle>
      <DialogContent dividers>
        <Typography sx={{ mb: 2 }}>
          Từ khóa <strong>“{keyword?.keyword}”</strong> sẽ bị xóa vĩnh viễn.
        </Typography>
        <Alert severity="warning" icon={<WarningAmberOutlined />}>
          Nếu chỉ muốn ngừng quét từ khóa này, hãy dùng công tắc trạng thái thay
          vì xóa.
        </Alert>
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} disabled={loading}>
          Hủy
        </Button>
        <Button
          color="error"
          variant="contained"
          onClick={onConfirm}
          disabled={loading}
        >
          {loading ? "Đang xóa..." : "Xóa vĩnh viễn"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
