import { useState } from "react";
import {
  Alert,
  Avatar,
  Box,
  Button,
  IconButton,
  Link,
  Paper,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import CheckRounded from "@mui/icons-material/CheckRounded";
import ContentCopyRounded from "@mui/icons-material/ContentCopyRounded";
import ReplayRounded from "@mui/icons-material/ReplayRounded";
import SmartToyOutlined from "@mui/icons-material/SmartToyOutlined";
import ReactMarkdown from "react-markdown";
import ChatSources from "./ChatSources.jsx";

const markdownComponents = {
  p: ({ children }) => (
    <Typography
      component="p"
      sx={{ m: 0, mb: 1.15, fontSize: "0.96rem", lineHeight: 1.72 }}
    >
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
    <Typography
      component="h1"
      variant="h6"
      sx={{ mt: 1.5, mb: 0.75, fontWeight: 800 }}
    >
      {children}
    </Typography>
  ),
  h2: ({ children }) => (
    <Typography
      component="h2"
      sx={{ mt: 1.4, mb: 0.65, fontSize: "1.03rem", fontWeight: 800 }}
    >
      {children}
    </Typography>
  ),
  h3: ({ children }) => (
    <Typography
      component="h3"
      sx={{ mt: 1.25, mb: 0.5, fontSize: "0.98rem", fontWeight: 750 }}
    >
      {children}
    </Typography>
  ),
  ul: ({ children }) => (
    <Box component="ul" sx={{ my: 0.8, pl: 2.75 }}>
      {children}
    </Box>
  ),
  ol: ({ children }) => (
    <Box component="ol" sx={{ my: 0.8, pl: 2.75 }}>
      {children}
    </Box>
  ),
  li: ({ children }) => (
    <Box
      component="li"
      sx={{ mb: 0.45, pl: 0.25, fontSize: "0.96rem", lineHeight: 1.68 }}
    >
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
        fontFamily:
          '"SFMono-Regular", Consolas, "Liberation Mono", monospace',
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
        "& code": {
          p: 0,
          bgcolor: "transparent",
          borderRadius: 0,
          overflowWrap: "normal",
        },
      }}
    >
      {children}
    </Box>
  ),
  a: ({ children, href }) => (
    <Link
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      sx={{ overflowWrap: "anywhere" }}
    >
      {children}
    </Link>
  ),
  blockquote: ({ children }) => (
    <Box
      component="blockquote"
      sx={{
        m: 0,
        my: 1.25,
        pl: 1.5,
        borderLeft: "3px solid",
        borderColor: "divider",
        color: "text.secondary",
      }}
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
    <Typography
      component="div"
      sx={{ fontSize: "0.95rem", lineHeight: 1.65, whiteSpace: "pre-wrap" }}
    >
      {content}
    </Typography>
  );
}

function TypingIndicator({ label }) {
  return (
    <Stack
      direction="row"
      spacing={1.1}
      aria-live="polite"
      sx={{ alignItems: "center" }}
    >
      <Stack direction="row" spacing={0.45} aria-hidden="true">
        {[0, 1, 2].map((index) => (
          <Box
            key={index}
            sx={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              bgcolor: "text.secondary",
              animation: "aiTypingPulse 1.2s ease-in-out infinite",
              animationDelay: `${index * 160}ms`,
              "@keyframes aiTypingPulse": {
                "0%, 60%, 100%": { opacity: 0.28, transform: "translateY(0)" },
                "30%": { opacity: 0.9, transform: "translateY(-2px)" },
              },
              "@media (prefers-reduced-motion: reduce)": {
                animation: "none",
                opacity: 0.55,
              },
            }}
          />
        ))}
      </Stack>
      <Typography variant="caption" color="text.secondary">
        {label}
      </Typography>
    </Stack>
  );
}

function getStreamLabel(message) {
  if (message.streamPhase === "verifying") return "Đang kiểm tra thông tin...";
  if (message.streamPhase === "generating") return "Đang tạo câu trả lời...";
  if (message.streamPhase === "retrieving") return "Đang tìm kiếm tài liệu...";
  return "";
}

export default function ChatMessage({
  message,
  isSending,
  onRetry,
  onSend,
  onSourceSelect,
}) {
  const [copied, setCopied] = useState(false);
  const isUser = message.role === "user";
  const isLoading = message.status === "loading";
  const isError = message.status === "error";
  const isComplete = message.status === "complete";
  const streamLabel = getStreamLabel(message);
  const hasSources = !isUser && isComplete && message.sources?.length > 0;

  async function handleCopy() {
    if (!message.content || !navigator.clipboard) return;
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  }

  return (
    <Stack
      direction="row"
      spacing={{ xs: 1, sm: 1.5 }}
      sx={{
        width: "100%",
        justifyContent: isUser ? "flex-end" : "flex-start",
        alignItems: "flex-start",
      }}
    >
      {!isUser && (
        <Avatar
          sx={{
            width: 32,
            height: 32,
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
          maxWidth: isUser ? { xs: "88%", sm: "76%" } : 820,
          minWidth: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: isUser ? "flex-end" : "flex-start",
          gap: 0.55,
        }}
      >
        {!isUser && (
          <Stack direction="row" spacing={0.75} sx={{ alignItems: "center" }}>
            <Typography variant="caption" sx={{ fontWeight: 750, color: "text.primary" }}>
              AI Study Assistant
            </Typography>
            <Typography variant="caption" color="text.disabled">
              {message.createdAt}
            </Typography>
          </Stack>
        )}

        <Paper
          elevation={0}
          sx={{
            width: "100%",
            px: isUser ? { xs: 1.5, sm: 1.75 } : isError ? 1.5 : 0,
            py: isUser ? { xs: 1.1, sm: 1.25 } : isError ? 1.25 : 0.4,
            borderRadius: isUser ? "14px 14px 5px 14px" : isError ? 2.5 : 0,
            bgcolor: isUser
              ? "action.selected"
              : isError
                ? "error.light"
                : "transparent",
            color: "text.primary",
            border: isError ? "1px solid" : isUser ? "1px solid" : 0,
            borderColor: isError ? "error.main" : "divider",
            overflowWrap: "anywhere",
          }}
        >
          {isLoading ? (
            <TypingIndicator label="Đang suy nghĩ..." />
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

              {message.status === "streaming" && streamLabel && (
                <TypingIndicator label={streamLabel} />
              )}

              {message.sources?.length > 0 && (
                <ChatSources
                  sources={message.sources}
                  onSourceSelect={onSourceSelect}
                />
              )}

              {message.answerStatus === "FALLBACK_WITH_SOURCES" && (
                <Typography variant="caption" sx={{ fontStyle: "italic", opacity: 0.8 }}>
                  Câu trả lời được tạo từ các nguồn phù hợp.
                </Typography>
              )}
              {message.answerStatus === "NO_SOURCES" && (
                <Typography variant="caption" sx={{ fontStyle: "italic", opacity: 0.8 }}>
                  Không tìm thấy nguồn phù hợp trong phạm vi tài liệu hiện tại.
                </Typography>
              )}
            </Stack>
          )}
        </Paper>

        {isUser ? (
          <Typography variant="caption" color="text.disabled" sx={{ px: 0.5 }}>
            Bạn · {message.createdAt}
          </Typography>
        ) : (
          isComplete &&
          message.content && (
            <Stack
              direction="row"
              sx={{
                minHeight: 32,
                alignItems: "center",
                opacity: { xs: 1, sm: 0.72 },
                "&:hover": { opacity: 1 },
              }}
            >
              <Tooltip title={copied ? "Đã sao chép" : "Sao chép"}>
                <IconButton
                  size="small"
                  onClick={handleCopy}
                  aria-label={copied ? "Đã sao chép câu trả lời" : "Sao chép câu trả lời"}
                  sx={{ width: 32, height: 32, color: "text.secondary" }}
                >
                  {copied ? <CheckRounded fontSize="small" /> : <ContentCopyRounded sx={{ fontSize: 17 }} />}
                </IconButton>
              </Tooltip>
            </Stack>
          )
        )}

        {!isUser && isComplete && message.suggestedPrompts?.length > 0 && (
          <Stack
            direction="row"
            gap={1}
            sx={{ mt: 0.25, flexWrap: "wrap" }}
          >
            {message.suggestedPrompts.map((prompt) => (
              <Button
                key={prompt}
                variant="outlined"
                size="small"
                onClick={() => onSend(prompt)}
                disabled={isSending}
                sx={{
                  borderRadius: 2,
                  textTransform: "none",
                  fontSize: "0.78rem",
                  color: "text.secondary",
                  borderColor: "divider",
                  textAlign: "left",
                  lineHeight: 1.35,
                  whiteSpace: "normal",
                  "&:hover": {
                    borderColor: "primary.main",
                    color: "primary.main",
                    bgcolor: "action.hover",
                  },
                }}
              >
                {prompt}
              </Button>
            ))}
          </Stack>
        )}
      </Box>
    </Stack>
  );
}
