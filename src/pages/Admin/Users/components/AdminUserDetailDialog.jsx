import {
  Alert,
  Avatar,
  Box,
  Button,
  Chip,
  CircularProgress,
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

function formatCurrency(value) {
  return `${Number(value || 0).toLocaleString("vi-VN")} đ`;
}

function SummaryGrid({ children }) {
  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: { xs: "1fr 1fr", sm: "repeat(4, 1fr)" },
        gap: 2,
        p: 2,
        borderRadius: 3,
        bgcolor: "action.hover",
      }}
    >
      {children}
    </Box>
  );
}

function RecentItems({ items, renderItem, emptyText }) {
  if (!items?.length) {
    return (
      <Typography color="text.secondary" variant="body2" sx={{ mt: 1.5 }}>
        {emptyText}
      </Typography>
    );
  }
  return (
    <Stack divider={<Divider flexItem />} sx={{ mt: 1.5 }}>
      {items.slice(0, 5).map(renderItem)}
    </Stack>
  );
}

export default function AdminUserDetailDialog({
  user,
  loading,
  error,
  onClose,
  onChangeStatus,
  onChangeRole,
}) {
  if (!user) return null;
  const usage = user.usage || user;
  const subscription = user.subscription || {
    planCode: user.planCode,
    planName: user.planName,
    expiresAt: user.expiresAt,
  };
  return (
    <Dialog open onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>Chi tiết người dùng</DialogTitle>
      <DialogContent dividers>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {loading && (
          <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
            <CircularProgress size={18} />
            <Typography color="text.secondary">Đang tải đầy đủ chi tiết...</Typography>
          </Stack>
        )}
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
        <SummaryGrid>
          <DetailRow
            label="Tài liệu"
            value={`${Number(usage.documentCount || 0).toLocaleString("vi-VN")} tệp`}
          />
          <DetailRow
            label="Dung lượng đã dùng"
            value={formatFileSize(usage.storageUsedBytes || 0)}
          />
          <DetailRow
            label="Lượt tải"
            value={Number(usage.downloadCount || 0).toLocaleString("vi-VN")}
          />
          <DetailRow
            label="Lượt hỏi AI"
            value={
              subscription?.planCode
                ? `${Number(usage.aiChatsUsed || 0).toLocaleString("vi-VN")} / ${usage.aiChatLimit == null ? "∞" : Number(usage.aiChatLimit).toLocaleString("vi-VN")}`
                : "—"
            }
          />
        </SummaryGrid>

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
          <DetailRow label="Mã gói" value={subscription?.planCode} />
          <DetailRow label="Tên gói" value={subscription?.planName} />
          <DetailRow
            label="Ngày hết hạn"
            value={subscription?.expiresAt ? formatDate(subscription.expiresAt) : "Không giới hạn"}
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

        {user.documents && (
          <>
            <Divider sx={{ my: 3 }} />
            <Typography fontWeight={750} sx={{ mb: 2 }}>Tài liệu</Typography>
            <SummaryGrid>
              <DetailRow label="Tổng tài liệu" value={user.documents.total} />
              <DetailRow label="Công khai" value={user.documents.publicCount} />
              <DetailRow label="Riêng tư" value={user.documents.privateCount} />
              <DetailRow label="Chờ duyệt" value={user.documents.pendingCount} />
            </SummaryGrid>
            <RecentItems
              items={user.documents.items}
              emptyText="Người dùng chưa có tài liệu."
              renderItem={(document) => (
                <Stack key={document.id} direction="row" justifyContent="space-between" gap={2} sx={{ py: 1.25 }}>
                  <Box minWidth={0}>
                    <Typography fontWeight={650} noWrap>{document.title}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {formatDate(document.createdAt)} · {document.downloadCount} lượt tải
                    </Typography>
                  </Box>
                  <Chip size="small" label={document.moderationStatus} variant="outlined" />
                </Stack>
              )}
            />
          </>
        )}

        {user.transactions && (
          <>
            <Divider sx={{ my: 3 }} />
            <Typography fontWeight={750} sx={{ mb: 2 }}>Thanh toán</Typography>
            <SummaryGrid>
              <DetailRow label="Tổng chi tiêu" value={formatCurrency(user.transactions.totalSpent)} />
              <DetailRow label="Số giao dịch" value={user.transactions.orderCount} />
            </SummaryGrid>
            <RecentItems
              items={user.transactions.items}
              emptyText="Chưa có giao dịch thanh toán."
              renderItem={(transaction) => (
                <Stack key={transaction.id} direction="row" justifyContent="space-between" gap={2} sx={{ py: 1.25 }}>
                  <Box>
                    <Typography fontWeight={650}>{transaction.planName} ({transaction.planCode})</Typography>
                    <Typography variant="caption" color="text.secondary">{transaction.invoiceNumber}</Typography>
                  </Box>
                  <Box textAlign="right">
                    <Typography>{formatCurrency(transaction.amount)}</Typography>
                    <Typography variant="caption" color="text.secondary">{formatDate(transaction.paidAt || transaction.createdAt)}</Typography>
                  </Box>
                </Stack>
              )}
            />
          </>
        )}

        {user.aiUsage && (
          <>
            <Divider sx={{ my: 3 }} />
            <Typography fontWeight={750} sx={{ mb: 2 }}>Sử dụng AI</Typography>
            <SummaryGrid>
              <DetailRow label="Tổng câu hỏi" value={user.aiUsage.totalQuestions} />
              <DetailRow label="Credit đã dùng" value={user.aiUsage.totalCreditsUsed} />
              <DetailRow label="Phiên trò chuyện" value={user.aiUsage.sessionsCount} />
              <DetailRow label="Tài liệu đã lưu" value={usage.savedDocuments} />
            </SummaryGrid>
          </>
        )}

        {user.reports && (
          <>
            <Divider sx={{ my: 3 }} />
            <Typography fontWeight={750} sx={{ mb: 2 }}>Báo cáo và rủi ro</Typography>
            <SummaryGrid>
              <DetailRow label="Báo cáo đã gửi" value={user.reports.reportCount} />
              <DetailRow label="Lần bị báo cáo" value={user.reports.reportedCount} />
              <DetailRow label="Điểm spam" value={user.reports.spamScore} />
            </SummaryGrid>
          </>
        )}
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
