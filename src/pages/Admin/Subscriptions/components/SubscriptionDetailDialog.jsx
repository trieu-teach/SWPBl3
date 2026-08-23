import {
  Alert,
  Avatar,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogContent,
  Divider,
  IconButton,
  Stack,
  Typography,
} from "@mui/material";
import { CloseOutlined, PaymentsOutlined } from "@mui/icons-material";

const dateTime = new Intl.DateTimeFormat("vi-VN", {
  dateStyle: "short",
  timeStyle: "short",
});

function formatDate(value) {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "—" : dateTime.format(date);
}

function formatMoney(value, currency = "VND") {
  if (value === null || value === undefined) return "—";
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency,
  }).format(value);
}

function DetailItem({ label, value, mono = false }) {
  return (
    <Box minWidth={0}>
      <Typography variant="caption" color="text.secondary">
        {label}
      </Typography>
      <Typography
        fontWeight={600}
        sx={{
          overflowWrap: "anywhere",
          fontFamily: mono ? "monospace" : "inherit",
        }}
      >
        {value ?? "—"}
      </Typography>
    </Box>
  );
}

function Section({ title, children }) {
  return (
    <Box>
      <Typography variant="subtitle1" fontWeight={750} sx={{ mb: 1.5 }}>
        {title}
      </Typography>
      {children}
    </Box>
  );
}

export default function SubscriptionDetailDialog({ admin }) {
  const open = Boolean(admin.detailTarget);
  const detail = admin.billingDetail;
  const subscription = detail?.subscription;
  const order = detail?.focusedOrder || detail?.fundingOrder;

  return (
    <Dialog
      open={open}
      onClose={admin.detailLoading ? undefined : admin.closeDetail}
      fullWidth
      maxWidth="md"
      PaperProps={{
        sx: {
          borderRadius: 3,
          bgcolor: "background.paper",
        },
      }}
    >
      <Box
        sx={{
          px: 3,
          py: 2.5,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderBottom: "1px solid",
          borderColor: "divider",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Box
            sx={{
              width: 42,
              height: 42,
              borderRadius: 2.5,
              bgcolor: "primary.main",
              color: "primary.contrastText",
              display: "grid",
              placeItems: "center",
            }}
          >
            <PaymentsOutlined />
          </Box>
          <Box>
            <Typography variant="h6" fontWeight={800}>
              Chi tiết đăng ký gói
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {admin.detailTarget?.email}
            </Typography>
          </Box>
        </Box>
        <IconButton onClick={admin.closeDetail} disabled={admin.detailLoading}>
          <CloseOutlined />
        </IconButton>
      </Box>

      <DialogContent dividers sx={{ p: 0 }}>
        <Box sx={{ p: 3 }}>
          {admin.detailLoading && (
            <Box sx={{ py: 10, display: "grid", placeItems: "center", gap: 2 }}>
              <CircularProgress />
              <Typography color="text.secondary">
                Đang tải chi tiết...
              </Typography>
            </Box>
          )}

          {!admin.detailLoading && admin.detailError && (
            <Alert
              severity="error"
              action={
                <Button color="inherit" onClick={admin.retryDetail}>
                  Thử lại
                </Button>
              }
            >
              {admin.detailError}
            </Alert>
          )}

          {!admin.detailLoading && detail && (
            <Stack spacing={3}>
              <Section title="Người dùng">
                <Box
                  sx={{
                    p: 2,
                    display: "flex",
                    gap: 2,
                    alignItems: "center",
                    border: "1px solid",
                    borderColor: "divider",
                    borderRadius: 3,
                  }}
                >
                  <Avatar src={detail.user.avatarUrl || undefined}>
                    {detail.user.fullName?.[0] || detail.user.email?.[0]}
                  </Avatar>
                  <Box minWidth={0}>
                    <Typography fontWeight={750}>
                      {detail.user.fullName}
                    </Typography>
                    <Typography color="text.secondary" noWrap>
                      {detail.user.email}
                    </Typography>
                  </Box>
                </Box>
              </Section>

              <Section title="Gói hiện tại">
                {subscription ? (
                  <Box
                    sx={{
                      p: 2.5,
                      borderRadius: 3,
                      bgcolor: "action.hover",
                      border: "1px solid",
                      borderColor: "divider",
                    }}
                  >
                    <Stack
                      direction="row"
                      justifyContent="space-between"
                      mb={2}
                    >
                      <Box>
                        <Typography variant="h6" fontWeight={800}>
                          {subscription.planName}
                        </Typography>
                        <Typography color="text.secondary">
                          {subscription.planCode}
                        </Typography>
                      </Box>
                      <Chip
                        color="success"
                        label={
                          subscription.daysRemaining === null
                            ? "Không hết hạn"
                            : `Còn ${subscription.daysRemaining} ngày`
                        }
                      />
                    </Stack>
                    <Box
                      sx={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr",
                        gap: 2,
                      }}
                    >
                      <DetailItem
                        label="Bắt đầu"
                        value={formatDate(subscription.startsAt)}
                      />
                      <DetailItem
                        label="Hết hạn"
                        value={formatDate(subscription.expiresAt)}
                      />
                      <DetailItem
                        label="Dung lượng"
                        value={`${subscription.storageLimitMb.toLocaleString("vi-VN")} MB`}
                      />
                      <DetailItem
                        label="Lượt AI đã dùng"
                        value={subscription.aiChatsUsed.toLocaleString("vi-VN")}
                      />
                      <DetailItem
                        label="Giới hạn AI"
                        value={
                          subscription.aiChatLimit === null
                            ? "Không giới hạn"
                            : subscription.aiChatLimit.toLocaleString("vi-VN")
                        }
                      />
                    </Box>
                  </Box>
                ) : (
                  <Alert severity="info">
                    Người dùng chưa có gói đang hoạt động.
                  </Alert>
                )}
              </Section>

              {order && (
                <Section title="Chi tiết hóa đơn">
                  <Box
                    sx={{
                      p: 2,
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: 2,
                      border: "1px solid",
                      borderColor: "divider",
                      borderRadius: 3,
                    }}
                  >
                    <DetailItem
                      label="Mã hóa đơn"
                      value={order.invoiceNumber}
                      mono
                    />
                    <DetailItem label="Trạng thái" value={order.status} />
                    <DetailItem
                      label="Số tiền"
                      value={formatMoney(order.amount, order.currency)}
                    />
                    <DetailItem
                      label="Phương thức"
                      value={order.paymentMethod}
                    />
                    <DetailItem
                      label="Ngày thanh toán"
                      value={formatDate(order.paidAt)}
                    />
                    <DetailItem
                      label="Loại giao dịch"
                      value={order.isUpgrade ? "Nâng cấp" : "Mua mới"}
                    />
                    <DetailItem
                      label="Mã giao dịch SePay"
                      value={order.sepayTransactionId}
                      mono
                    />
                    {order.cardLast4 && (
                      <DetailItem
                        label="Thẻ"
                        value={`${order.cardBrand || "Thẻ"} •••• ${order.cardLast4}`}
                      />
                    )}
                  </Box>
                </Section>
              )}

              <Divider />
              <Section title={`Lịch sử thanh toán (${detail.history.length})`}>
                <Stack spacing={1.25}>
                  {detail.history.map((item) => (
                    <Box
                      key={item.invoiceNumber}
                      sx={{
                        p: 2,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: 2,
                        border: "1px solid",
                        borderColor: item.isFocused
                          ? "primary.main"
                          : "divider",
                        borderRadius: 2.5,
                      }}
                    >
                      <Box minWidth={0}>
                        <Typography fontWeight={700}>
                          {item.planCode}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {formatDate(item.paidAt || item.createdAt)} ·{" "}
                          {item.status}
                        </Typography>
                        <Typography
                          variant="caption"
                          sx={{ fontFamily: "monospace" }}
                        >
                          {item.invoiceNumber}
                        </Typography>
                      </Box>
                      <Typography fontWeight={750} whiteSpace="nowrap">
                        {formatMoney(item.amount)}
                      </Typography>
                    </Box>
                  ))}
                  {detail.history.length === 0 && (
                    <Typography color="text.secondary">
                      Chưa có lịch sử thanh toán.
                    </Typography>
                  )}
                </Stack>
              </Section>
            </Stack>
          )}
        </Box>
      </DialogContent>
    </Dialog>
  );
}
