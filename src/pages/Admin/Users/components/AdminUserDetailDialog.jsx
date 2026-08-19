import {
  Avatar,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Stack,
  Typography,
} from "@mui/material";
import { formatFileSize } from "../../utils/admin-formatters.js";

function DetailRow({ label, value }) {
  return (
    <Box>
      <Typography variant="caption" color="text.secondary">
        {label}
      </Typography>
      <Typography sx={{ overflowWrap: "anywhere" }}>{value || "—"}</Typography>
    </Box>
  );
}

function roleLabel(role) {
  if (role === "ADMIN") return "Quản trị viên";
  if (role === "MODERATOR") return "Kiểm duyệt viên";
  return "Người dùng";
}

function formatDate(value, includeTime = false) {
  if (!value) return "—";
  return includeTime
    ? new Date(value).toLocaleString("vi-VN")
    : new Date(value).toLocaleDateString("vi-VN");
}

export default function AdminUserDetailDialog({
  user,
  onClose,
  onChangeStatus,
  onChangeRole,
}) {
  if (!user) return null;
  return (
    <Dialog open onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>Chi tiết người dùng</DialogTitle>
      <DialogContent dividers>
        <Stack direction="row" gap={2} alignItems="center" sx={{ mb: 3 }}>
          <Avatar
            src={user.avatarUrl || undefined}
            sx={{ width: 64, height: 64, bgcolor: "primary.main" }}
          >
            {user.fullName?.[0] || user.email?.[0]}
          </Avatar>
          <Box minWidth={0}>
            <Typography variant="h6" fontWeight={750}>
              {user.fullName}
            </Typography>
            <Typography color="text.secondary" noWrap>
              {user.email}
            </Typography>
            <Stack direction="row" gap={1} sx={{ mt: 1 }}>
              <Chip
                size="small"
                label={roleLabel(user.role)}
                color={
                  user.role === "ADMIN"
                    ? "warning"
                    : user.role === "MODERATOR"
                      ? "info"
                      : "default"
                }
              />
              <Chip
                size="small"
                label={
                  user.status === "ACTIVE"
                    ? "Hoạt động"
                    : user.status === "BLOCKED"
                      ? "Đã khóa"
                      : "Chưa xác minh"
                }
                color={
                  user.status === "ACTIVE"
                    ? "success"
                    : user.status === "BLOCKED"
                      ? "error"
                      : "warning"
                }
              />
            </Stack>
          </Box>
        </Stack>
        <Divider sx={{ mb: 3 }} />
        <Typography fontWeight={750} sx={{ mb: 2 }}>
          Mức sử dụng
        </Typography>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr 1fr", sm: "repeat(4, 1fr)" },
            gap: 2,
            p: 2,
            mb: 3,
            borderRadius: 3,
            bgcolor: "action.hover",
          }}
        >
          <DetailRow
            label="Tài liệu"
            value={`${Number(user.documentCount || 0).toLocaleString("vi-VN")} tệp`}
          />
          <DetailRow
            label="Dung lượng đã dùng"
            value={formatFileSize(user.storageUsedBytes || 0)}
          />
          <DetailRow
            label="Lượt tải"
            value={Number(user.downloadCount || 0).toLocaleString("vi-VN")}
          />
          <DetailRow
            label="Lượt hỏi AI"
            value={
              user.planCode
                ? `${Number(user.aiChatsUsed || 0).toLocaleString("vi-VN")} / ${user.aiChatLimit == null ? "∞" : Number(user.aiChatLimit).toLocaleString("vi-VN")}`
                : "—"
            }
          />
        </Box>

        <Typography fontWeight={750} sx={{ mb: 2 }}>
          Gói hiện tại
        </Typography>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", sm: "repeat(3, 1fr)" },
            gap: 2.5,
            mb: 3,
          }}
        >
          <DetailRow label="Mã gói" value={user.planCode} />
          <DetailRow label="Tên gói" value={user.planName} />
          <DetailRow
            label="Ngày hết hạn"
            value={user.expiresAt ? formatDate(user.expiresAt) : "Không giới hạn"}
          />
        </Box>
        <Divider sx={{ mb: 3 }} />
        <Typography fontWeight={750} sx={{ mb: 2 }}>
          Thông tin tài khoản
        </Typography>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
            gap: 2.5,
          }}
        >
          <DetailRow label="Nhà cung cấp đăng nhập" value={user.authProvider} />
          <DetailRow
            label="Đăng nhập gần nhất"
            value={
              user.lastLogin
                ? formatDate(user.lastLogin, true)
                : "Chưa có dữ liệu"
            }
          />
          <DetailRow
            label="Ngày tạo"
            value={formatDate(user.createdAt, true)}
          />
          <DetailRow
            label="Cập nhật gần nhất"
            value={formatDate(user.updatedAt, true)}
          />
          <Box sx={{ gridColumn: "1 / -1" }}>
            <DetailRow label="Firebase UID" value={user.firebaseUid} />
          </Box>
        </Box>
      </DialogContent>
      <DialogActions>
        {user.role !== "ADMIN" && (
          <Button onClick={() => onChangeRole(user)}>Đổi vai trò</Button>
        )}
        {user.role !== "ADMIN" && user.status !== "INACTIVE" && (
          <Button
            color={user.status === "ACTIVE" ? "error" : "success"}
            onClick={() => onChangeStatus(user)}
          >
            {user.status === "ACTIVE" ? "Khóa tài khoản" : "Mở khóa"}
          </Button>
        )}
        <Button onClick={onClose}>Đóng</Button>
      </DialogActions>
    </Dialog>
  );
}
