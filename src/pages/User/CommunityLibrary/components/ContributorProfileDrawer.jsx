import {
  Alert,
  Avatar,
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  Drawer,
  IconButton,
  Paper,
  Skeleton,
  Stack,
  Typography,
} from "@mui/material";
import {
  CalendarMonthOutlined,
  CloseOutlined,
  DescriptionOutlined,
  PersonOutlineOutlined,
  ScheduleOutlined,
} from "@mui/icons-material";
import { formatDate } from "../../DocumentLibrary/utils/document-formatters.js";

function ProfileLoading() {
  return (
    <Stack spacing={2.5} sx={{ p: 3 }}>
      <Stack direction="row" spacing={2} alignItems="center">
        <Skeleton variant="circular" width={72} height={72} />
        <Box sx={{ flex: 1 }}>
          <Skeleton width="65%" height={32} />
          <Skeleton width="45%" height={22} />
        </Box>
      </Stack>
      <Stack direction="row" spacing={1.5}>
        <Skeleton variant="rounded" height={86} sx={{ flex: 1 }} />
        <Skeleton variant="rounded" height={86} sx={{ flex: 1 }} />
      </Stack>
      <Skeleton variant="rounded" height={42} />
      <Skeleton variant="rounded" height={180} />
    </Stack>
  );
}

function ProfileMetric({ icon, label, value }) {
  return (
    <Paper
      variant="outlined"
      sx={{ flex: 1, minWidth: 0, p: 1.75, borderRadius: 2.5 }}
    >
      <Stack direction="row" spacing={1.25} alignItems="center">
        <Box sx={{ color: "primary.main", display: "grid", placeItems: "center" }}>
          {icon}
        </Box>
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="caption" color="text.secondary">
            {label}
          </Typography>
          <Typography fontWeight={750} noWrap title={value}>
            {value}
          </Typography>
        </Box>
      </Stack>
    </Paper>
  );
}

export default function ContributorProfileDrawer({ contributor, children }) {
  const profile = contributor.profile;

  return (
    <Drawer
      anchor="right"
      open={contributor.isOpen}
      onClose={contributor.closeContributor}
      PaperProps={{
        sx: {
          width: { xs: "100%", sm: 520 },
          maxWidth: "100vw",
          bgcolor: "background.default",
        },
      }}
    >
      <Stack
        direction="row"
        alignItems="center"
        sx={{
          position: "relative",
          minHeight: 72,
          px: 3,
          pr: 8,
          py: 2,
          bgcolor: "background.paper",
        }}
      >
        <Typography variant="h6" fontWeight={800}>
          Người chia sẻ
        </Typography>
        <IconButton
          aria-label="Đóng hồ sơ người chia sẻ"
          onClick={contributor.closeContributor}
          sx={{
            position: "absolute",
            top: "50%",
            right: 16,
            transform: "translateY(-50%)",
          }}
        >
          <CloseOutlined />
        </IconButton>
      </Stack>
      <Divider />

      {contributor.loading ? (
        <ProfileLoading />
      ) : contributor.error ? (
        <Box sx={{ p: 3 }}>
          <Alert
            severity={contributor.error.includes("Không tìm thấy") ? "info" : "error"}
            action={
              <Button color="inherit" size="small" onClick={contributor.reload}>
                Thử lại
              </Button>
            }
          >
            {contributor.error}
          </Alert>
        </Box>
      ) : profile ? (
        <Box sx={{ p: { xs: 2.5, sm: 3 } }}>
          <Stack direction="row" spacing={2} alignItems="center">
            <Avatar
              src={profile.avatarUrl || undefined}
              alt={profile.publicName}
              sx={{ width: 72, height: 72, fontSize: 28, bgcolor: "primary.main" }}
            >
              {profile.publicName?.[0]?.toUpperCase() || <PersonOutlineOutlined />}
            </Avatar>
            <Box sx={{ minWidth: 0 }}>
              <Typography variant="h5" fontWeight={800} noWrap>
                {profile.publicName || "Người chia sẻ"}
              </Typography>
              <Stack direction="row" spacing={0.75} alignItems="center" sx={{ mt: 0.5 }}>
                <CalendarMonthOutlined sx={{ fontSize: 17, color: "text.secondary" }} />
                <Typography variant="body2" color="text.secondary">
                  Thành viên từ {formatDate(profile.memberSince)}
                </Typography>
              </Stack>
            </Box>
          </Stack>

          {contributor.isSelf && (
            <Alert severity="info" sx={{ mt: 2.5 }}>
              Đây là hồ sơ cộng đồng của bạn.
            </Alert>
          )}

          <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} sx={{ mt: 2.5 }}>
            <ProfileMetric
              icon={<DescriptionOutlined />}
              label="Tài liệu công khai"
              value={`${profile.communityDocumentCount || 0} tài liệu`}
            />
            <ProfileMetric
              icon={<ScheduleOutlined />}
              label="Chia sẻ gần nhất"
              value={formatDate(profile.lastPublicShareAt)}
            />
          </Stack>

          {profile.topSubjects?.length > 0 && (
            <Box sx={{ mt: 2.5 }}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Môn thường chia sẻ
              </Typography>
              <Stack direction="row" gap={1} flexWrap="wrap">
                {profile.topSubjects.slice(0, 3).map((subject) => (
                  <Chip key={subject.id} label={subject.name} variant="outlined" />
                ))}
              </Stack>
            </Box>
          )}

          <Divider sx={{ my: 3 }} />
          <Typography variant="h6" fontWeight={800} sx={{ mb: 2 }}>
            Tài liệu đã chia sẻ
          </Typography>

          {contributor.documentsLoading && !children ? (
            <Stack alignItems="center" sx={{ py: 4 }}>
              <CircularProgress size={28} />
            </Stack>
          ) : (
            children
          )}
        </Box>
      ) : null}
    </Drawer>
  );
}
