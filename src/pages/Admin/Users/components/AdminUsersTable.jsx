import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  Chip,
  CircularProgress,
  IconButton,
  Pagination,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from "@mui/material";
import { BlockOutlined, LockOpenOutlined, RefreshOutlined, VisibilityOutlined } from "@mui/icons-material";

const STATUS = {
  ACTIVE: { label: "Hoạt động", color: "success" },
  BLOCKED: { label: "Đã khóa", color: "error" },
  INACTIVE: { label: "Chưa xác minh", color: "warning" },
};

export default function AdminUsersTable({ adminUsers }) {
  if (adminUsers.error) {
    return <Alert severity="error" action={<Button color="inherit" startIcon={<RefreshOutlined />} onClick={adminUsers.load}>Thử lại</Button>}>{adminUsers.error}</Alert>;
  }

  return (
    <>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
        <Typography color="text.secondary">
          {adminUsers.loading ? "Đang tải..." : `${adminUsers.meta.totalItems || 0} người dùng`}
        </Typography>
        {adminUsers.loading && <CircularProgress size={20} />}
      </Box>
      <Card variant="outlined" sx={{ borderRadius: 3, overflow: "hidden" }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: "action.hover" }}>
                <TableCell>Người dùng</TableCell>
                <TableCell>Vai trò</TableCell>
                <TableCell>Trạng thái</TableCell>
                <TableCell>Ngày tạo</TableCell>
                <TableCell align="right">Thao tác</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {adminUsers.loading && Array.from({ length: 6 }).map((_, index) => (
                <TableRow key={index}><TableCell colSpan={5}><Skeleton height={42} /></TableCell></TableRow>
              ))}
              {!adminUsers.loading && adminUsers.users.length === 0 && (
                <TableRow><TableCell colSpan={5} align="center" sx={{ py: 8 }}><Typography fontWeight={700}>Không tìm thấy người dùng</Typography><Typography color="text.secondary">Hãy thử bộ lọc hoặc từ khóa khác.</Typography></TableCell></TableRow>
              )}
              {!adminUsers.loading && adminUsers.users.map((user) => {
                const status = STATUS[user.status] || STATUS.INACTIVE;
                const canChange = user.role !== "ADMIN" && user.status !== "INACTIVE";
                return (
                  <TableRow key={user.id} hover>
                    <TableCell><Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}><Avatar src={user.avatarUrl || undefined} sx={{ width: 36, height: 36, bgcolor: "primary.main", fontSize: 14 }}>{user.fullName?.[0] || user.email?.[0]}</Avatar><Box minWidth={0}><Typography fontWeight={700} noWrap>{user.fullName}</Typography><Typography variant="body2" color="text.secondary" noWrap>{user.email}</Typography></Box></Box></TableCell>
                    <TableCell><Chip size="small" label={user.role === "ADMIN" ? "Quản trị viên" : "Người dùng"} color={user.role === "ADMIN" ? "warning" : "default"} /></TableCell>
                    <TableCell><Chip size="small" label={status.label} color={status.color} variant="outlined" /></TableCell>
                    <TableCell>{new Date(user.createdAt).toLocaleDateString("vi-VN")}</TableCell>
                    <TableCell align="right">
                      <Tooltip title="Xem chi tiết"><IconButton onClick={() => adminUsers.setSelectedUser(user)}><VisibilityOutlined /></IconButton></Tooltip>
                      {canChange && <Tooltip title={user.status === "ACTIVE" ? "Khóa tài khoản" : "Mở khóa"}><IconButton color={user.status === "ACTIVE" ? "error" : "success"} onClick={() => adminUsers.setStatusTarget(user)}>{user.status === "ACTIVE" ? <BlockOutlined /> : <LockOpenOutlined />}</IconButton></Tooltip>}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>
      {!adminUsers.loading && adminUsers.meta.totalPages > 1 && (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}><Pagination page={adminUsers.page} count={adminUsers.meta.totalPages} color="primary" onChange={(_event, value) => adminUsers.setPage(value)} /></Box>
      )}
    </>
  );
}
