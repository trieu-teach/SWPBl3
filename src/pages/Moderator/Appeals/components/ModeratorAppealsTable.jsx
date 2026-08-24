import {
  Avatar,
  Box,
  Button,
  Chip,
  CircularProgress,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import GavelOutlined from "@mui/icons-material/GavelOutlined";
import { getModeratorAppealStatus } from "../utils/moderator-appeal-status.js";

function formatDate(value) {
  return value ? new Date(value).toLocaleString("vi-VN") : "—";
}

function getInitials(value) {
  return (value || "?")
    .trim()
    .split(/\s+/)
    .slice(-2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

export default function ModeratorAppealsTable({ moderation }) {
  return (
    <Paper variant="outlined" sx={{ borderRadius: 3, overflow: "hidden" }}>
      {moderation.loading ? (
        <Box
          sx={{
            minHeight: 240,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 1.5,
            textAlign: "center",
          }}
        >
          <CircularProgress size={30} />
          <Typography color="text.secondary">Đang tải khiếu nại...</Typography>
        </Box>
      ) : moderation.appeals.length === 0 ? (
        <Box
          sx={{
            minHeight: 240,
            px: 2,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 1,
            textAlign: "center",
          }}
        >
          <GavelOutlined color="disabled" sx={{ fontSize: 48 }} />
          <Typography fontWeight={750}>Không có khiếu nại ở trạng thái này</Typography>
          <Typography color="text.secondary">
            Chọn trạng thái khác hoặc thử tải lại danh sách.
          </Typography>
        </Box>
      ) : (
        <TableContainer>
          <Table sx={{ minWidth: 1080 }}>
            <TableHead>
              <TableRow>
                <TableCell>Lý do</TableCell>
                <TableCell>Tài liệu</TableCell>
                <TableCell>Người gửi</TableCell>
                <TableCell>Trạng thái</TableCell>
                <TableCell>Ngày gửi</TableCell>
                <TableCell align="right">Thao tác</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {moderation.appeals.map((appeal) => {
                const status = getModeratorAppealStatus(appeal.status);
                return (
                  <TableRow key={appeal.id} hover>
                    <TableCell sx={{ maxWidth: 300 }}>
                      <Typography fontWeight={700} noWrap>
                        {appeal.reason || "Không có lý do"}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" noWrap>
                        {appeal.description || "Không có mô tả bổ sung"}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ minWidth: 230, maxWidth: 320 }}>
                      <Typography fontWeight={700} noWrap>
                        {appeal.document?.title || "Không xác định"}
                      </Typography>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        noWrap
                        sx={{ display: "block" }}
                      >
                        {appeal.document?.fileName || "Chưa có tên tệp"}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ minWidth: 240 }}>
                      <Stack direction="row" alignItems="center" gap={1.25}>
                        <Avatar
                          src={appeal.user?.avatarUrl || undefined}
                          alt={appeal.user?.fullName || appeal.user?.email || ""}
                          sx={{ width: 36, height: 36, fontSize: 14 }}
                        >
                          {getInitials(
                            appeal.user?.fullName || appeal.user?.email,
                          )}
                        </Avatar>
                        <Box sx={{ minWidth: 0 }}>
                          <Typography fontWeight={700} noWrap>
                            {appeal.user?.fullName || "Không xác định"}
                          </Typography>
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            noWrap
                            sx={{ display: "block" }}
                          >
                            {appeal.user?.email || "Chưa có email"}
                          </Typography>
                        </Box>
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Chip size="small" label={status.label} color={status.color} />
                    </TableCell>
                    <TableCell>{formatDate(appeal.createdAt)}</TableCell>
                    <TableCell align="right">
                      <Button size="small" onClick={() => moderation.openDetail(appeal)}>
                        Xem xét
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Paper>
  );
}
