import { Box, Chip, Stack, Typography } from "@mui/material";
import SmartToyOutlined from "@mui/icons-material/SmartToyOutlined";

export default function ChatHeader() {
  return (
    <Stack
      direction={{ xs: "column", sm: "row" }}
      alignItems={{ xs: "flex-start", sm: "center" }}
      justifyContent="space-between"
      gap={2}
      sx={{
        px: { xs: 2, sm: 3 },
        py: 2.5,
        borderBottom: "1px solid",
        borderColor: "divider",
      }}
    >
      <Stack direction="row" spacing={1.5} alignItems="center" sx={{ minWidth: 0 }}>
        <Box
          sx={{
            width: 44,
            height: 44,
            borderRadius: 2,
            display: "grid",
            placeItems: "center",
            color: "primary.main",
            bgcolor: "action.hover",
            flexShrink: 0,
          }}
        >
          <SmartToyOutlined />
        </Box>
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="h5" sx={{ fontWeight: 800, lineHeight: 1.2 }}>
            Hỏi AI
          </Typography>
          <Typography color="text.secondary" sx={{ fontSize: "0.9rem" }}>
            Trợ lý học tập giúp giải thích, tóm tắt và gợi ý cách ôn bài.
          </Typography>
        </Box>
      </Stack>

      <Chip
        label="Mock UI"
        color="primary"
        variant="outlined"
        size="small"
        sx={{ fontWeight: 700 }}
      />
    </Stack>
  );
}
