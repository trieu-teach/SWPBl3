import { Box, Stack } from "@mui/material";
import ChatMessage from "./ChatMessage.jsx";
import ChatEmptyState from "./ChatEmptyState.jsx";

export default function ChatMessageList({ messages }) {
  if (!messages.length) {
    return (
      <Box sx={{ flex: 1, minHeight: 0, overflowY: "auto", p: { xs: 2, sm: 3 } }}>
        <ChatEmptyState />
      </Box>
    );
  }

  return (
    <Box sx={{ flex: 1, minHeight: 0, overflowY: "auto", p: { xs: 2, sm: 3 } }}>
      <Stack spacing={2.5}>
        {messages.map((message) => (
          <ChatMessage key={message.id} message={message} />
        ))}
      </Stack>
    </Box>
  );
}
