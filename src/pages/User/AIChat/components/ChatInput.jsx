import { Alert, Button, Paper, Stack, TextField } from "@mui/material";
import SendRounded from "@mui/icons-material/SendRounded";
import { isLibraryContext } from "../chatContext.js";

export default function ChatInput({ chatContext, value, onChange, onSend, isSending, error }) {
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
        p: { xs: 1.5, sm: 2 },
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
      <Stack direction="row" spacing={1.5} alignItems="flex-end">
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
          variant="outlined"
          disabled={isSending}
          inputProps={{ "aria-label": "Nhập câu hỏi cho AI" }}
          sx={{
            "& .MuiInputBase-root": {
              borderRadius: 2,
              alignItems: "flex-end",
            },
          }}
        />
        <Button
          type="button"
          variant="contained"
          onClick={onSend}
          disabled={isDisabled}
          endIcon={<SendRounded />}
          sx={{
            minHeight: 40,
            px: { xs: 1.5, sm: 2.5 },
            flexShrink: 0,
          }}
        >
          {isSending ? "Đang gửi" : "Gửi"}
        </Button>
      </Stack>
    </Paper>
  );
}
