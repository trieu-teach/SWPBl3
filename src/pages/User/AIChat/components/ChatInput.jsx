import { Button, Paper, Stack, TextField } from "@mui/material";
import SendRounded from "@mui/icons-material/SendRounded";

export default function ChatInput({ value, onChange, onSend }) {
  const isDisabled = !value.trim();

  function handleKeyDown(event) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      if (!isDisabled) onSend();
    }
  }

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
      <Stack direction="row" spacing={1.5} alignItems="flex-end">
        <TextField
          value={value}
          onChange={(event) => onChange(event.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Nhập câu hỏi học tập của bạn..."
          multiline
          minRows={1}
          maxRows={5}
          fullWidth
          size="small"
          variant="outlined"
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
          Gửi
        </Button>
      </Stack>
    </Paper>
  );
}
