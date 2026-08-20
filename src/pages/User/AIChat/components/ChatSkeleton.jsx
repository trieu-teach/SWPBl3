import { Avatar, Box, Skeleton, Stack } from "@mui/material";

function AssistantSkeleton() {
  return (
    <Stack direction="row" spacing={1.5} sx={{ alignItems: "flex-start" }}>
      <Skeleton variant="circular">
        <Avatar sx={{ width: 32, height: 32 }} />
      </Skeleton>
      <Box sx={{ flex: 1, maxWidth: 700, pt: 0.25 }}>
        <Skeleton width={120} height={18} />
        <Skeleton width="92%" height={20} />
        <Skeleton width="78%" height={20} />
        <Skeleton width="62%" height={20} />
      </Box>
    </Stack>
  );
}

export default function ChatSkeleton() {
  return (
    <Box
      role="status"
      aria-label="Đang tải cuộc hội thoại"
      aria-busy="true"
      sx={{ flex: 1, minHeight: 0, overflow: "hidden", px: { xs: 2, sm: 3 }, py: 3 }}
    >
      <Stack spacing={3} sx={{ width: "100%", maxWidth: 880, mx: "auto" }}>
        <AssistantSkeleton />
        <Stack sx={{ alignItems: "flex-end" }}>
          <Skeleton variant="rounded" width="45%" height={52} sx={{ borderRadius: 2.5 }} />
        </Stack>
        <AssistantSkeleton />
      </Stack>
    </Box>
  );
}
