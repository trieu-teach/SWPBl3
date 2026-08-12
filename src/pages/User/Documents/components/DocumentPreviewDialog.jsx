import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Stack,
  Typography,
} from "@mui/material";
import { CloseOutlined, OpenInFullOutlined } from "@mui/icons-material";

export default function DocumentPreviewDialog({ preview, onClose }) {
  return (
    <Dialog
      open={Boolean(preview)}
      onClose={onClose}
      fullWidth
      maxWidth={false}
      sx={{
        "& .MuiDialog-container": {
          alignItems: "center",
        },
        "& .MuiDialog-paper": {
          width: { xs: "100vw", sm: "96vw" },
          maxWidth: "1800px",
          height: { xs: "100dvh", sm: "calc(100dvh - 16px)" },
          maxHeight: { xs: "100dvh", sm: "calc(100dvh - 16px)" },
          margin: { xs: 0, sm: "8px" },
          display: "flex",
          flexDirection: "column",
        },
      }}
      PaperProps={{
        sx: {
          borderRadius: { xs: 0, sm: 3 },
          overflow: "hidden",
        },
      }}
    >
      <DialogTitle sx={{ px: { xs: 2, sm: 3 }, py: 1.5 }}>
        <Stack direction="row" alignItems="center" gap={2}>
          <Box sx={{ minWidth: 0, flex: 1 }}>
            <Typography noWrap sx={{ fontWeight: 750 }}>
              {preview?.title}
            </Typography>
            <Typography noWrap variant="caption" color="text.secondary">
              {preview?.fileName}
            </Typography>
          </Box>
          <IconButton onClick={onClose} aria-label="Đóng bản xem trước">
            <CloseOutlined />
          </IconButton>
        </Stack>
      </DialogTitle>

      <DialogContent
        dividers
        sx={{
          p: 0,
          display: "flex",
          flex: 1,
          height: "calc(100dvh - 132px)",
          minHeight: 0,
          overflow: "hidden",
          bgcolor: "#e5e7eb",
        }}
      >
        {preview?.url && (
          <Box
            component="iframe"
            src={preview.url}
            title={preview.title}
            sx={{
              width: "100%",
              height: "100%",
              minHeight: 0,
              border: 0,
              bgcolor: "white",
            }}
          />
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 1 }}>
        <Button onClick={onClose}>Đóng</Button>
        <Button
          component="a"
          href={preview?.url || "#"}
          target="_blank"
          rel="noopener noreferrer"
          startIcon={<OpenInFullOutlined />}
        >
          Mở toàn màn hình
        </Button>
      </DialogActions>
    </Dialog>
  );
}
