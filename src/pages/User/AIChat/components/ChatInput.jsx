import {
  Alert,
  Box,
  CircularProgress,
  IconButton,
  Paper,
  TextField,
  Tooltip,
} from "@mui/material";
import SendRounded from "@mui/icons-material/SendRounded";
import { isLibraryContext } from "../chatContext.js";

export default function ChatInput({
  chatContext,
  value,
  onChange,
  onSend,
  isSending,
  error,
}) {
  const isDisabled = !value.trim() || isSending;

  function handleKeyDown(event) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      if (!isDisabled) onSend();
    }
  }

  const placeholder = isLibraryContext(chatContext)
    ? "Hỏi về tài liệu trong thư viện của bạn..."
    : "Nhập câu hỏi học tập của bạn...";

  return (
    <Paper
      elevation={0}
      sx={{
        px: { xs: 1.25, sm: 2 },
        py: { xs: 1.15, sm: 1.5 },
        borderTop: "1px solid",
        borderColor: "divider",
        borderRadius: 0,
        bgcolor: "background.paper",
      }}
    >
      {error && (
        <Alert severity="error" sx={{ mb: 1.5 }}>
          {error}
        </Alert>
      )}
      <Box
        sx={{
          display: "flex",
          alignItems: "flex-end",
          gap: 0.75,
          width: "100%",
          maxWidth: 960,
          minWidth: 0,
          mx: "auto",
          py: 0.55,
          pl: 1.5,
          pr: 0.65,
          border: "1px solid",
          borderColor: "divider",
          borderRadius: 3,
          bgcolor: "background.paper",
          transition: "border-color 120ms ease, box-shadow 120ms ease",
          "&:focus-within": {
            borderColor: "primary.main",
            boxShadow: (theme) => `0 0 0 2px ${theme.palette.primary.main}18`,
          },
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
          inputProps={{ "aria-label": "Nhập câu hỏi cho AI" }}
          sx={{
            "& .MuiInputBase-root": {
              alignItems: "flex-end",
              py: 0.45,
            },
            "& .MuiInputBase-root::before, & .MuiInputBase-root::after": {
              display: "none",
            },
          }}
        />
        <Tooltip title={isSending ? "Đang gửi" : "Gửi"}>
          <span>
            <IconButton
              type="button"
              color="primary"
              onClick={onSend}
              disabled={isDisabled}
              aria-label={isSending ? "Đang gửi câu hỏi" : "Gửi câu hỏi"}
              sx={{
                width: 38,
                height: 38,
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
              {isSending ? (
                <CircularProgress size={18} color="inherit" />
              ) : (
                <SendRounded sx={{ fontSize: 19 }} />
              )}
            </IconButton>
          </span>
        </Tooltip>
      </Box>
    </Paper>
  );
}
