import {
  Alert,
  Avatar,
  Box,
  Button,
  CircularProgress,
  Link,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import SmartToyOutlined from "@mui/icons-material/SmartToyOutlined";
import PersonOutlineOutlined from "@mui/icons-material/PersonOutlineOutlined";
import ReplayRounded from "@mui/icons-material/ReplayRounded";
import ReactMarkdown from "react-markdown";
import ChatSources from "./ChatSources.jsx";

const markdownComponents = {
  p: ({ children }) => (
    <Typography component="p" sx={{ m: 0, mb: 1.1, fontSize: "0.95rem", lineHeight: 1.72 }}>
      {children}
    </Typography>
  ),
  strong: ({ children }) => (
    <Box component="strong" sx={{ fontWeight: 750 }}>
      {children}
    </Box>
  ),
  em: ({ children }) => <Box component="em">{children}</Box>,
  h1: ({ children }) => (
    <Typography component="h1" variant="h6" sx={{ mt: 1.5, mb: 0.75, fontWeight: 800 }}>
      {children}
    </Typography>
  ),
  h2: ({ children }) => (
    <Typography component="h2" sx={{ mt: 1.4, mb: 0.65, fontSize: "1.02rem", fontWeight: 800 }}>
      {children}
    </Typography>
  ),
  h3: ({ children }) => (
    <Typography component="h3" sx={{ mt: 1.25, mb: 0.5, fontSize: "0.96rem", fontWeight: 750 }}>
      {children}
    </Typography>
  ),
  ul: ({ children }) => (
    <Box component="ul" sx={{ my: 0.75, pl: 2.75 }}>
      {children}
    </Box>
  ),
  ol: ({ children }) => (
    <Box component="ol" sx={{ my: 0.75, pl: 2.75 }}>
      {children}
    </Box>
  ),
  li: ({ children }) => (
    <Box component="li" sx={{ mb: 0.45, pl: 0.25, fontSize: "0.95rem", lineHeight: 1.68 }}>
      {children}
    </Box>
  ),
  code: ({ children, className }) => (
    <Box
      component="code"
      className={className}
      sx={{
        px: 0.55,
        py: 0.15,
        borderRadius: 0.75,
        bgcolor: "action.selected",
        fontFamily: '"SFMono-Regular", Consolas, "Liberation Mono", monospace',
        fontSize: "0.86em",
        overflowWrap: "anywhere",
      }}
    >
      {children}
    </Box>
  ),
  pre: ({ children }) => (
    <Box
      component="pre"
      sx={{
        m: 0,
        my: 1.25,
        p: 1.5,
        overflowX: "auto",
        borderRadius: 2,
        bgcolor: "action.hover",
        border: "1px solid",
        borderColor: "divider",
        fontSize: "0.84rem",
        lineHeight: 1.6,
        "& code": { p: 0, bgcolor: "transparent", borderRadius: 0, overflowWrap: "normal" },
      }}
    >
      {children}
    </Box>
  ),
  a: ({ children, href }) => (
    <Link href={href} target="_blank" rel="noopener noreferrer" sx={{ overflowWrap: "anywhere" }}>
      {children}
    </Link>
  ),
  blockquote: ({ children }) => (
    <Box
      component="blockquote"
      sx={{ m: 0, my: 1.25, pl: 1.5, borderLeft: "3px solid", borderColor: "divider", color: "text.secondary" }}
    >
      {children}
    </Box>
  ),
};

function MarkdownContent({ content }) {
  return (
    <Box
      sx={{
        minWidth: 0,
        overflowWrap: "anywhere",
        "& > :first-of-type": { mt: 0 },
        "& > :last-child": { mb: 0 },
      }}
    >
      <ReactMarkdown skipHtml components={markdownComponents}>
        {content}
      </ReactMarkdown>
    </Box>
  );
}

function PlainContent({ content }) {
  return (
    <Typography component="div" sx={{ fontSize: "0.95rem", lineHeight: 1.68, whiteSpace: "pre-wrap" }}>
      {content}
    </Typography>
  );
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
      alignItems="flex-start"
      sx={{ width: "100%" }}
    >
      {!isUser && (
        <Avatar
          sx={{
            width: 30,
            height: 30,
            bgcolor: "action.selected",
            color: "primary.main",
          }}
        >
          <SmartToyOutlined sx={{ fontSize: 19 }} />
        </Avatar>
      )}

      <Box
        sx={{
          width: isUser ? "fit-content" : "100%",
          maxWidth: isUser ? { xs: "86%", sm: 680 } : 900,
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
            px: { xs: 1.5, sm: 1.75 },
            py: { xs: 1.15, sm: 1.35 },
            borderRadius: isUser ? "18px 18px 6px 18px" : "18px 18px 18px 6px",
            bgcolor: isUser
              ? "rgba(99, 102, 241, 0.12)"
              : isError
                ? "error.light"
                : "action.hover",
            color: "text.primary",
            border: "1px solid",
            borderColor: isUser
              ? "rgba(99, 102, 241, 0.18)"
              : isError
                ? "error.main"
                : "transparent",
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
                  {isUser ? (
                    <PlainContent content={message.content} />
                  ) : (
                    <MarkdownContent content={message.content} />
                  )}
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
              {isUser ? (
                <PlainContent content={message.content} />
              ) : (
                <MarkdownContent content={message.content} />
              )}
              
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
            fontSize: "0.66rem",
            color: "text.secondary",
            opacity: 0.78,
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
            width: 30,
            height: 30,
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
