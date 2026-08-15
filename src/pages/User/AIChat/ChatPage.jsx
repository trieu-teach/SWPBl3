import { useState } from "react";
import { Box, Paper } from "@mui/material";
import UserLayout from "../Layout/UserLayout.jsx";
import ChatHeader from "./components/ChatHeader.jsx";
import ChatContextBar from "./components/ChatContextBar.jsx";
import ChatInput from "./components/ChatInput.jsx";
import ChatMessageList from "./components/ChatMessageList.jsx";
import DocumentPickerDialog from "./components/DocumentPickerDialog.jsx";
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
    selectedDocuments,
    removeDocument,
    applyDocuments,
  } = useChat();

  const [isPickerOpen, setIsPickerOpen] = useState(false);

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
        <ChatHeader
          selectedDocuments={selectedDocuments}
          onOpenPicker={() => setIsPickerOpen(true)}
        />

        <ChatContextBar
          selectedDocuments={selectedDocuments}
          onRemove={removeDocument}
          onOpenPicker={() => setIsPickerOpen(true)}
        />

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

      <DocumentPickerDialog
        open={isPickerOpen}
        onClose={() => setIsPickerOpen(false)}
        selectedDocuments={selectedDocuments}
        onApply={applyDocuments}
      />
    </UserLayout>
  );
}
