import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from "@mui/material";

function getFrameUrl(preview) {
  if (!preview) return "";
  if (!preview.fallbackToOfficeViewer) return preview.url;
  return `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(preview.url)}`;
}

export default function ModeratorDocumentPreviewDialog({ preview, onClose }) {
  if (!preview) return null;
  const frameUrl = getFrameUrl(preview);

  return (
    <Dialog open onClose={onClose} fullScreen>
      <DialogTitle>
        {preview.title}
        <div style={{ fontSize: 13, fontWeight: 400, opacity: 0.7 }}>
          {preview.fileName}
        </div>
      </DialogTitle>
      <DialogContent dividers sx={{ p: 0, display: "flex" }}>
        {frameUrl ? (
          <iframe
            title={`Xem trước ${preview.title}`}
            src={frameUrl}
            style={{ width: "100%", minHeight: "75vh", border: 0 }}
          />
        ) : (
          <Alert severity="error" sx={{ m: 2, width: "100%" }}>
            Không nhận được đường dẫn xem trước.
          </Alert>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Đóng</Button>
      </DialogActions>
    </Dialog>
  );
}
