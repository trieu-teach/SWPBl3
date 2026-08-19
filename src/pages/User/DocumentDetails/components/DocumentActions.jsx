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
  Tooltip,
  Typography,
} from "@mui/material";
import {
  CloudDownloadOutlined,
  DeleteOutlined,
  SmartToyOutlined,
  VisibilityOutlined,
} from "@mui/icons-material";
import { CHAT_MODE_DOCUMENT } from "../../AIChat/chatContext.js";

export default function DocumentActions({ details }) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const navigate = useNavigate();
  const document = details.document;

  // AI-ready means the document has been indexed and can answer questions.
  const isAiReady = document.aiStatus === "COMPLETED";

  function handleAskAI() {
    navigate("/ai-chat", {
      state: {
        mode: CHAT_MODE_DOCUMENT,
        document: { id: document.id, title: document.title },
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
          <Tooltip
            title={
              isAiReady
                ? ""
                : "Tài liệu chưa được AI xử lý. Vui lòng chờ quá trình lập chỉ mục hoàn tất."
            }
            disableHoverListener={isAiReady}
          >
            <span>
              <Button
                fullWidth
                variant="contained"
                color="primary"
                startIcon={<SmartToyOutlined />}
                onClick={handleAskAI}
                disabled={!isAiReady}
              >
                Hỏi AI
              </Button>
            </span>
          </Tooltip>
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
