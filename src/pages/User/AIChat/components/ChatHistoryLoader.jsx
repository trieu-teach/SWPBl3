import { Box, Button, CircularProgress, Typography } from "@mui/material";
import KeyboardArrowUpRounded from "@mui/icons-material/KeyboardArrowUpRounded";

export default function ChatHistoryLoader({
  hasMore,
  isLoading,
  onLoad,
}) {
  if (!hasMore && !isLoading) return null;

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        pb: 2,
        pt: 0.5,
      }}
    >
      {isLoading ? (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, py: 0.75 }}>
          <CircularProgress size={16} thickness={5} />
          <Typography variant="caption" color="text.secondary">
            Đang tải tin nhắn cũ hơn...
          </Typography>
        </Box>
      ) : (
        <Button
          size="small"
          variant="outlined"
          startIcon={<KeyboardArrowUpRounded />}
          onClick={onLoad}
          sx={{
            borderRadius: 5,
            fontSize: "0.78rem",
            px: 2,
            py: 0.5,
            textTransform: "none",
            fontWeight: 600,
          }}
        >
          Tải tin nhắn cũ hơn
        </Button>
      )}
    </Box>
  );
}
