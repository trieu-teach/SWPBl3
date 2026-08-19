import {
  Alert,
  Avatar,
  Box,
  Button,
  CircularProgress,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import SmartToyOutlined from "@mui/icons-material/SmartToyOutlined";
import PersonOutlineOutlined from "@mui/icons-material/PersonOutlineOutlined";
import ReplayRounded from "@mui/icons-material/ReplayRounded";
import ChatSources from "./ChatSources.jsx";

function renderContent(content) {
  const blocks = [];

  content.split("\n").forEach((line) => {
    const trimmed = line.trim();

    if (!trimmed) return;

    if (trimmed.startsWith("- ")) {
      const lastBlock = blocks.at(-1);
      if (lastBlock?.type === "list") {
        lastBlock.items.push(trimmed.replace(/^- /, ""));
      } else {
        blocks.push({ type: "list", items: [trimmed.replace(/^- /, "")] });
      }
      return;
    }

    blocks.push({ type: "paragraph", text: trimmed });
  });

  return blocks.map((block, index) => {
    if (block.type === "list") {
      return (
        <Box component="ul" key={`list-${index}`} sx={{ pl: 2.5, my: 0 }}>
          {block.items.map((item) => (
            <Typography
              component="li"
              key={item}
              sx={{ fontSize: "0.95rem", lineHeight: 1.7, mb: 0.5 }}
            >
              {item}
            </Typography>
          ))}
        </Box>
      );
    }

    return (
      <Typography
        key={`${block.text}-${index}`}
        sx={{ fontSize: "0.95rem", lineHeight: 1.75, whiteSpace: "pre-wrap" }}
      >
        {block.text}
      </Typography>
    );
  });
}

export default function ChatMessage({
  message,
  isSending,
  onRetry,
  onSend,
  onSourceSelect,
}) {
  const isUser = message.role === "user";
  const isLoading = message.status === "loading";
  const isError = message.status === "error";
  const isComplete = message.status === "complete";
  const hasSources = !isUser && isComplete && message.sources?.length > 0;

  return (
    <Stack
      direction="row"
      spacing={1.5}
      justifyContent={isUser ? "flex-end" : "flex-start"}
      alignItems="flex-end"
      sx={{ width: "100%" }}
    >
      {!isUser && (
        <Avatar
          sx={{
            width: 34,
            height: 34,
            bgcolor: "primary.main",
            color: "primary.contrastText",
          }}
        >
          <SmartToyOutlined sx={{ fontSize: 19 }} />
        </Avatar>
      )}

      <Box
        sx={{
          maxWidth: { xs: "82%", sm: "72%", lg: "64%" },
          minWidth: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: isUser ? "flex-end" : "flex-start",
          gap: 0.5,
        }}
      >
        <Paper
          elevation={0}
          sx={{
            px: { xs: 1.75, sm: 2 },
            py: 1.5,
            borderRadius: isUser ? "18px 18px 6px 18px" : "18px 18px 18px 6px",
            bgcolor: isUser
              ? "primary.main"
              : isError
                ? "error.light"
                : "background.paper",
            color: isUser ? "primary.contrastText" : "text.primary",
            border: "1px solid",
            borderColor: isUser ? "primary.main" : isError ? "error.main" : "divider",
            overflowWrap: "anywhere",
            width: "100%",
          }}
        >
          {isLoading ? (
            <Stack direction="row" spacing={1.25} alignItems="center">
              <CircularProgress size={18} thickness={5} />
              <Typography sx={{ fontSize: "0.95rem", lineHeight: 1.7 }}>
                {message.content}
              </Typography>
            </Stack>
          ) : isError ? (
            <Stack spacing={1.25}>
              {message.content && message.content !== "Đang suy nghĩ..." && (
                <Box>
                  {renderContent(message.content)}
                  {hasSources && (
                    <ChatSources
                      sources={message.sources}
                      onSourceSelect={onSourceSelect}
                    />
                  )}
                </Box>
              )}
              <Alert
                severity="error"
                variant="standard"
                sx={{
                  p: 0,
                  bgcolor: "transparent",
                  color: "inherit",
                  "& .MuiAlert-icon": { mt: 0.15 },
                }}
              >
                {message.errorDetail || message.content}
              </Alert>
              <Button
                type="button"
                size="small"
                variant="outlined"
                startIcon={<ReplayRounded />}
                onClick={() => onRetry(message.id)}
                disabled={isSending}
                sx={{ alignSelf: "flex-start" }}
              >
                Thử lại
              </Button>
            </Stack>
          ) : (
            <Stack spacing={1.25}>
              {renderContent(message.content)}
              
              {/* If streaming and verifying, show a subtle indicator */}
              {message.status === "streaming" && message.streamPhase === "verifying" && (
                <Stack direction="row" spacing={1} alignItems="center" sx={{ opacity: 0.7 }}>
                  <CircularProgress size={14} thickness={4} />
                  <Typography variant="caption">Đang kiểm tra thông tin...</Typography>
                </Stack>
              )}
              
              {/* Show generating if streaming but no content yet */}
              {message.status === "streaming" && message.streamPhase === "generating" && !message.content && (
                <Stack direction="row" spacing={1} alignItems="center" sx={{ opacity: 0.7 }}>
                  <CircularProgress size={14} thickness={4} />
                  <Typography variant="caption">Đang tạo câu trả lời...</Typography>
                </Stack>
              )}

              {/* Show retrieving if streaming but no content yet */}
              {message.status === "streaming" && message.streamPhase === "retrieving" && !message.content && (
                <Stack direction="row" spacing={1} alignItems="center" sx={{ opacity: 0.7 }}>
                  <CircularProgress size={14} thickness={4} />
                  <Typography variant="caption">Đang tìm kiếm tài liệu...</Typography>
                </Stack>
              )}

              {message.sources?.length > 0 && (
                <ChatSources
                  sources={message.sources}
                  onSourceSelect={onSourceSelect}
                />
              )}

              {message.answerStatus === "FALLBACK_WITH_SOURCES" && (
                <Typography variant="caption" sx={{ fontStyle: "italic", opacity: 0.8, display: "block", mt: 0.5 }}>
                  Câu trả lời được tạo từ các nguồn phù hợp.
                </Typography>
              )}
              {message.answerStatus === "NO_SOURCES" && (
                <Typography variant="caption" sx={{ fontStyle: "italic", opacity: 0.8, display: "block", mt: 0.5 }}>
                  Không tìm thấy nguồn phù hợp trong phạm vi tài liệu hiện tại.
                </Typography>
              )}
            </Stack>
          )}
        </Paper>
        <Typography
          sx={{
            px: 0.5,
            fontSize: "0.72rem",
            color: "text.secondary",
          }}
        >
          {isUser ? "Bạn" : "AI Study Hub"} · {message.createdAt}
        </Typography>

        {/* Suggested Prompts below the paper bubble */}
        {!isUser && isComplete && message.suggestedPrompts?.length > 0 && (
          <Stack direction="row" flexWrap="wrap" gap={1} sx={{ mt: 0.5 }}>
            {message.suggestedPrompts.map((prompt) => (
              <Button
                key={prompt}
                variant="outlined"
                size="small"
                onClick={() => onSend(prompt)}
                disabled={isSending}
                sx={{
                  borderRadius: 4,
                  textTransform: "none",
                  fontSize: "0.8rem",
                  color: "text.secondary",
                  borderColor: "divider",
                  textAlign: "left",
                  lineHeight: 1.3,
                  whiteSpace: "normal",
                  "&:hover": {
                    borderColor: "primary.main",
                    color: "primary.main",
                    bgcolor: "transparent",
                  },
                }}
              >
                {prompt}
              </Button>
            ))}
          </Stack>
        )}
      </Box>

      {isUser && (
        <Avatar
          sx={{
            width: 34,
            height: 34,
            bgcolor: "action.hover",
            color: "text.secondary",
          }}
        >
          <PersonOutlineOutlined sx={{ fontSize: 19 }} />
        </Avatar>
      )}
    </Stack>
  );
}
