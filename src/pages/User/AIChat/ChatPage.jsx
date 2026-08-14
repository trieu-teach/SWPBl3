import { Box, Paper } from "@mui/material";
import UserLayout from "../Layout/UserLayout.jsx";
import ChatHeader from "./components/ChatHeader.jsx";
import ChatInput from "./components/ChatInput.jsx";
import ChatMessageList from "./components/ChatMessageList.jsx";
import { useChat } from "./hooks/useChat.js";

export default function ChatPage() {
  const {
    messages,
    inputValue,
    setInputValue,
    isSending,
    error,
    sendMessage,
    retryMessage,
  } = useChat();

  return (
    <UserLayout>
      <Paper
        variant="outlined"
        sx={{
          height: {
            xs: "calc(100dvh - 106px)",
            sm: "calc(100dvh - 122px)",
            lg: "calc(100dvh - 138px)",
          },
          minHeight: 0,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          borderRadius: 3,
          bgcolor: "background.default",
        }}
      >
        <ChatHeader />
        <ChatMessageList
          messages={messages}
          isSending={isSending}
          onRetry={retryMessage}
        />
        <Box sx={{ flexShrink: 0 }}>
          <ChatInput
            value={inputValue}
            onChange={setInputValue}
            onSend={sendMessage}
            isSending={isSending}
            error={error}
          />
        </Box>
      </Paper>
    </UserLayout>
  );
}
