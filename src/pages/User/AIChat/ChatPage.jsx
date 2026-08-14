import { useMemo, useState } from "react";
import { Box, Paper } from "@mui/material";
import UserLayout from "../Layout/UserLayout.jsx";
import ChatHeader from "./components/ChatHeader.jsx";
import ChatInput from "./components/ChatInput.jsx";
import ChatMessageList from "./components/ChatMessageList.jsx";
import { mockChatMessages } from "./mocks/chat.mock.js";

export default function ChatPage() {
  const [draft, setDraft] = useState("");
  const messages = useMemo(() => mockChatMessages, []);

  function handleSend() {
    setDraft("");
  }

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
        <ChatMessageList messages={messages} />
        <Box sx={{ flexShrink: 0 }}>
          <ChatInput value={draft} onChange={setDraft} onSend={handleSend} />
        </Box>
      </Paper>
    </UserLayout>
  );
}
