import {
  Alert,
  Box,
  IconButton,
  Paper,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import SendRounded from "@mui/icons-material/SendRounded";
import StopCircleOutlined from "@mui/icons-material/StopCircleOutlined";
import ChatContextBar from "./ChatContextBar.jsx";
import { isLibraryContext } from "../chatContext.js";

export default function ChatInput({
  chatContext,
  value,
  onChange,
  onSend,
  onAbort,
  isSending,
  error,
  selectedDocuments = [],
  onRemoveDocument,
  onOpenDocuments,
}) {
  const isDisabled = !value.trim() || isSending;
  const inLibraryMode = isLibraryContext(chatContext);

  function handleKeyDown(event) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      if (!isDisabled) onSend();
    }
  }

  const placeholder = inLibraryMode
    ? "Hỏi bất kỳ điều gì về tài liệu học tập của bạn..."
    : "Nhập câu hỏi học tập của bạn...";

  return (
    <Paper
      elevation={0}
      sx={{
        px: { xs: 1.25, sm: 2 },
        pt: inLibraryMode ? { xs: 1.1, sm: 1.35 } : { xs: 1.15, sm: 1.5 },
        pb: inLibraryMode ? { xs: 1, sm: 1.2 } : { xs: 1.15, sm: 1.5 },
        borderTop: "1px solid",
        borderColor: "divider",
        borderRadius: 0,
        bgcolor: "background.paper",
      }}
    >
      <Box sx={{ width: "100%", maxWidth: inLibraryMode ? 880 : 960, mx: "auto" }}>
        {error && (
          <Alert severity="error" sx={{ mb: 1.25, py: 0.25 }}>
            {error}
          </Alert>
        )}

        {inLibraryMode && (
          <ChatContextBar
            chatContext={chatContext}
            selectedDocuments={selectedDocuments}
            onRemove={onRemoveDocument}
            onOpenDocuments={onOpenDocuments}
          />
        )}

        <Box
          sx={{
            display: "flex",
            alignItems: "flex-end",
            gap: 0.75,
            width: "100%",
            minWidth: 0,
            minHeight: inLibraryMode ? 56 : undefined,
            py: inLibraryMode ? 0.8 : 0.55,
            pl: inLibraryMode ? 1.75 : 1.5,
            pr: 0.75,
            border: "1px solid",
            borderColor: "divider",
            borderRadius: inLibraryMode ? 3 : 3,
            bgcolor: "background.paper",
            boxShadow: inLibraryMode ? "0 8px 24px rgba(15, 23, 42, 0.06)" : "none",
            transition: "border-color 150ms ease, box-shadow 150ms ease",
            "&:focus-within": {
              borderColor: "primary.main",
              boxShadow: (theme) =>
                inLibraryMode
                  ? `0 8px 24px rgba(15, 23, 42, 0.06), 0 0 0 2px ${theme.palette.primary.main}18`
                  : `0 0 0 2px ${theme.palette.primary.main}18`,
            },
            "@media (prefers-reduced-motion: reduce)": { transition: "none" },
          }}
        >
          <TextField
            value={value}
            onChange={(event) => onChange(event.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            multiline
            minRows={1}
            maxRows={5}
            fullWidth
            size="small"
            variant="standard"
            disabled={isSending}
            slotProps={{
              htmlInput: { "aria-label": "Nhập câu hỏi cho AI" },
            }}
            sx={{
              "& .MuiInputBase-root": {
                alignItems: "flex-end",
                py: inLibraryMode ? 0.55 : 0.45,
              },
              "& .MuiInputBase-root::before, & .MuiInputBase-root::after": {
                display: "none",
              },
            }}
          />

          {isSending && typeof onAbort === "function" ? (
            <Tooltip title="Dừng tạo câu trả lời">
              <IconButton
                type="button"
                onClick={onAbort}
                aria-label="Dừng tạo câu trả lời"
                sx={{
                  width: 42,
                  height: 42,
                  flexShrink: 0,
                  border: "1px solid",
                  borderColor: "divider",
                  color: "text.secondary",
                  "&:hover": { color: "error.main", bgcolor: "action.hover" },
                }}
              >
                <StopCircleOutlined sx={{ fontSize: 21 }} />
              </IconButton>
            </Tooltip>
          ) : (
            <Tooltip title="Gửi">
              <span>
                <IconButton
                  type="button"
                  color="primary"
                  onClick={onSend}
                  disabled={isDisabled}
                  aria-label="Gửi câu hỏi"
                  sx={{
                    width: inLibraryMode ? 42 : 38,
                    height: inLibraryMode ? 42 : 38,
                    flexShrink: 0,
                    bgcolor: "primary.main",
                    color: "primary.contrastText",
                    "&:hover": { bgcolor: "primary.dark" },
                    "&.Mui-disabled": {
                      bgcolor: "action.disabledBackground",
                      color: "action.disabled",
                    },
                  }}
                >
                  <SendRounded sx={{ fontSize: 20 }} />
                </IconButton>
              </span>
            </Tooltip>
          )}
        </Box>

        {inLibraryMode && (
          <Typography
            variant="caption"
            color="text.disabled"
            sx={{
              display: { xs: "none", sm: "block" },
              mt: 0.7,
              fontSize: "0.66rem",
              textAlign: "center",
            }}
          >
            AI có thể mắc lỗi. Hãy kiểm tra lại thông tin quan trọng.
          </Typography>
        )}
      </Box>
    </Paper>
  );
}
