import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import GavelOutlined from "@mui/icons-material/GavelOutlined";
import {
  getAppealSourceLabel,
  getUserAppealStatus,
} from "../utils/user-appeal-status.js";

function formatDate(value) {
  return value ? new Date(value).toLocaleString("vi-VN") : "—";
}

export default function DocumentAppealsList({ appeals }) {
  if (appeals.loading) {
    return (
      <Paper variant="outlined" sx={{ borderRadius: 3 }}>
        <Stack alignItems="center" gap={1.5} sx={{ py: 8 }}>
          <CircularProgress size={30} />
          <Typography color="text.secondary">Đang tải lịch sử...</Typography>
        </Stack>
      </Paper>
    );
  }

  if (appeals.appeals.length === 0) {
    return (
      <Paper variant="outlined" sx={{ borderRadius: 3 }}>
        <Stack alignItems="center" gap={1} sx={{ py: 8, px: 2, textAlign: "center" }}>
          <GavelOutlined color="disabled" sx={{ fontSize: 48 }} />
          <Typography fontWeight={750}>Chưa có khiếu nại</Typography>
          <Typography color="text.secondary">
            Khiếu nại bạn gửi từ trang chi tiết tài liệu sẽ xuất hiện tại đây.
          </Typography>
        </Stack>
      </Paper>
    );
  }

  return (
    <Box sx={{ "& > * + *": { mt: 1.5 } }}>
      {appeals.appeals.map((appeal) => {
        const status = getUserAppealStatus(appeal.status);
        return (
          <Paper
            key={appeal.id}
            variant="outlined"
            sx={{
              p: { xs: 2, sm: 2.5 },
              borderRadius: 3,
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                md: "minmax(260px, 1fr) 200px 180px auto",
              },
              alignItems: { xs: "stretch", md: "center" },
              gap: { xs: 2, md: 3 },
            }}
          >
            <Stack gap={0.75} sx={{ minWidth: 0 }}>
              <Typography variant="caption" color="text.secondary">
                Lý do khiếu nại
              </Typography>
              <Typography fontWeight={750} noWrap>{appeal.reason}</Typography>
              <Typography variant="body2" color="text.secondary" noWrap>
                {appeal.description || "Không có mô tả bổ sung"}
              </Typography>
            </Stack>
            <Box>
              <Typography variant="caption" color="text.secondary">
                Nguồn
              </Typography>
              <Typography>{getAppealSourceLabel(appeal.source)}</Typography>
            </Box>
            <Stack gap={0.75} alignItems={{ xs: "flex-start", md: "flex-start" }}>
              <Chip size="small" label={status.label} color={status.color} />
              <Typography variant="caption" color="text.secondary">
                Gửi {formatDate(appeal.createdAt)}
              </Typography>
            </Stack>
            <Button
              variant="outlined"
              sx={{ justifySelf: { xs: "stretch", md: "end" } }}
              onClick={() => appeals.openDetail(appeal)}
            >
              Xem chi tiết
            </Button>
          </Paper>
        );
      })}
    </Box>
  );
}
