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

export default function AdminUserDetailDialog({
  user,
  onClose,
  onChangeStatus,
  onChangeRole,
}) {
  if (!user) return null;
  return (
    <Dialog open onClose={onClose} fullWidth maxWidth="sm">
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
                ? new Date(user.lastLogin).toLocaleString("vi-VN")
                : "Chưa có dữ liệu"
            }
          />
          <DetailRow
            label="Ngày tạo"
            value={new Date(user.createdAt).toLocaleString("vi-VN")}
          />
          <DetailRow
            label="Cập nhật gần nhất"
            value={new Date(user.updatedAt).toLocaleString("vi-VN")}
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
