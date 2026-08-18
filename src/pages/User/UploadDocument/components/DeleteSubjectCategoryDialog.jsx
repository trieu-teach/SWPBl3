import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from "@mui/material";

export default function DeleteSubjectCategoryDialog({ upload }) {
  const target = upload.deleteTarget;
  const label = target?.type === "subject" ? "môn học" : "danh mục";
  const documentCount = upload.deleteTaxonomyError?.details?.documentCount;

  return (
    <Dialog
      open={Boolean(target)}
      onClose={upload.deletingTaxonomy ? undefined : upload.closeDeleteDialog}
      fullWidth
      maxWidth="sm"
    >
      <DialogTitle>Xóa {label}</DialogTitle>
      <DialogContent>
        <Typography>
          Bạn có chắc muốn xóa {label} <strong>{target?.item?.name}</strong>?
        </Typography>
        <Alert severity="warning" sx={{ mt: 2 }}>
          Chỉ có thể xóa khi không còn tài liệu liên quan. Hệ thống không tự xóa
          tài liệu.
        </Alert>
        {upload.deleteTaxonomyError && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {documentCount
              ? `Không thể xóa vì vẫn còn ${documentCount} tài liệu. Hãy chuyển hoặc xóa các tài liệu đó trước.`
              : upload.deleteTaxonomyError.message}
          </Alert>
        )}
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button
          onClick={upload.closeDeleteDialog}
          disabled={upload.deletingTaxonomy}
        >
          Hủy
        </Button>
        <Button
          color="error"
          variant="contained"
          onClick={upload.confirmDeleteTaxonomy}
          disabled={upload.deletingTaxonomy}
        >
          {upload.deletingTaxonomy ? "Đang xóa..." : "Xác nhận xóa"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
