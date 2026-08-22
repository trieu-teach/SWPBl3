import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControlLabel,
  Paper,
  Radio,
  RadioGroup,
  Stack,
  Typography,
} from "@mui/material";
import {
  CloudDownloadOutlined,
  DeleteOutlined,
  SmartToyOutlined,
  VisibilityOutlined,
} from "@mui/icons-material";
import DocumentRatingButtons from "../../../../components/DocumentRating/DocumentRatingButtons.jsx";

export default function DocumentActions({ details }) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const navigate = useNavigate();
  const document = details.document;
  const documentId =
    typeof document?.id === "string" ? document.id.trim() : "";

  function handleAskAI() {
    if (!documentId) return;
    const title =
      typeof document?.title === "string" && document.title.trim()
        ? document.title.trim()
        : document?.fileName || "Tài liệu";

    navigate("/hoi-ai", {
      state: {
        libraryDocumentPreselection: {
          id: documentId,
          title,
        },
      },
    });
  }

  return (
    <>
      <Paper variant="outlined" sx={{ p: 3, borderRadius: 3 }}>
        <Typography variant="h6" fontWeight={750}>
          Thao tác
        </Typography>
        <Stack spacing={1.25} sx={{ mt: 2 }}>
          <Button
            fullWidth
            variant="contained"
            color="primary"
            startIcon={<SmartToyOutlined />}
            onClick={handleAskAI}
            disabled={!documentId}
          >
            Hỏi AI
          </Button>
          <Button
            variant="contained"
            startIcon={<VisibilityOutlined />}
            onClick={() => details.openFile("preview")}
          >
            Xem tài liệu
          </Button>
          <Button
            variant="outlined"
            startIcon={<CloudDownloadOutlined />}
            onClick={() => details.openFile("download")}
          >
            Tải xuống
          </Button>
        </Stack>
        <Divider sx={{ my: 3 }} />
        <Typography fontWeight={700} sx={{ mb: 1 }}>
          Quyền riêng tư
        </Typography>
        <RadioGroup
          value={document.visibility}
          onChange={(event) => details.changeVisibility(event.target.value)}
        >
          <FormControlLabel
            value="PRIVATE"
            control={<Radio />}
            label="Riêng tư"
            disabled={details.saving}
          />
          <FormControlLabel
            value="PUBLIC"
            control={<Radio />}
            label="Công khai"
            disabled={details.saving}
          />
        </RadioGroup>
        <Typography variant="caption" color="text.secondary">
          Tài liệu công khai sẽ được gửi duyệt trước khi xuất hiện trong cộng
          đồng.
        </Typography>
        {document.visibility === "PUBLIC" && (
          <>
            <Divider sx={{ my: 3 }} />
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
            >
              <Typography fontWeight={700} variant="body2">
                Đánh giá tài liệu
              </Typography>
              <DocumentRatingButtons
                documentId={documentId}
                helpfulRating={document.helpfulRating}
                totalRatings={document.ratingCount || document.totalRatings}
                showStats
              />
            </Stack>
          </>
        )}
        <Divider sx={{ my: 3 }} />
        <Button
          fullWidth
          color="error"
          variant="outlined"
          startIcon={<DeleteOutlined />}
          onClick={() => setConfirmOpen(true)}
        >
          Xóa tài liệu
        </Button>
      </Paper>

      <Dialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Xóa tài liệu?</DialogTitle>
        <DialogContent>
          <Typography>
            “{document.title}” sẽ bị xóa khỏi thư viện. Thao tác này không thể
            hoàn tác trên giao diện.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setConfirmOpen(false)}
            disabled={details.deleting}
          >
            Hủy
          </Button>
          <Button
            color="error"
            variant="contained"
            onClick={details.remove}
            disabled={details.deleting}
          >
            {details.deleting ? "Đang xóa..." : "Xóa"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
