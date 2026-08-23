import {
  CloudOutlined,
  EditOutlined,
  HideSourceOutlined,
  SmartToyOutlined,
} from "@mui/icons-material";
import {
  Alert,
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  Chip,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Skeleton,
  Stack,
  Typography,
} from "@mui/material";

const currency = new Intl.NumberFormat("vi-VN", {
  style: "currency",
  currency: "VND",
  maximumFractionDigits: 0,
});

function LimitItem({ icon, label, value }) {
  return (
    <Stack direction="row" spacing={1} alignItems="center">
      {icon}
      <Typography color="text.secondary" sx={{ flex: 1 }}>
        {label}
      </Typography>
      <Typography fontWeight={700}>{value}</Typography>
    </Stack>
  );
}

export default function SubscriptionPlansGrid({ admin }) {
  return (
    <>
      <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 2 }}>
        <FormControl size="small" sx={{ minWidth: 190 }}>
          <InputLabel>Trạng thái</InputLabel>
          <Select
            value={admin.statusFilter}
            label="Trạng thái"
            onChange={(event) => admin.setStatusFilter(event.target.value)}
          >
            <MenuItem value="">Tất cả</MenuItem>
            <MenuItem value="true">Đang hoạt động</MenuItem>
            <MenuItem value="false">Đã ngừng</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {admin.error && (
        <Alert
          severity="error"
          action={
            <Button color="inherit" onClick={admin.loadPlans}>
              Thử lại
            </Button>
          }
          sx={{ mb: 2 }}
        >
          {admin.error}
        </Alert>
      )}

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          gap: 2.5,
        }}
      >
        {admin.loading &&
          Array.from({ length: 3 }).map((_, index) => (
            <Skeleton key={index} variant="rounded" height={390} />
          ))}

        {!admin.loading &&
          admin.plans.map((plan) => (
            <Card
              key={plan.id}
              variant="outlined"
              sx={{ borderRadius: 3, display: "flex", flexDirection: "column" }}
            >
              <CardContent sx={{ flex: 1, p: 3 }}>
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="flex-start"
                >
                  <Box>
                    <Chip label={plan.code} size="small" color="primary" />
                    <Typography variant="h5" fontWeight={800} mt={1.5}>
                      {plan.name}
                    </Typography>
                  </Box>
                  <Chip
                    label={plan.isActive ? "Đang hoạt động" : "Đã ngừng"}
                    color={plan.isActive ? "success" : "default"}
                    variant="outlined"
                  />
                </Stack>

                <Typography variant="h4" fontWeight={800} mt={3}>
                  {currency.format(plan.checkoutPrice ?? plan.price)}
                </Typography>
                {plan.checkoutPrice !== null &&
                  plan.checkoutPrice !== plan.price && (
                    <Typography
                      color="text.secondary"
                      sx={{ textDecoration: "line-through" }}
                    >
                      {currency.format(plan.price)}
                    </Typography>
                  )}
                <Typography color="text.secondary" mb={3}>
                  {plan.durationDays === 0
                    ? "Không giới hạn thời hạn"
                    : `${plan.durationDays} ngày`}
                </Typography>

                <Stack spacing={1.5}>
                  <LimitItem
                    icon={<CloudOutlined fontSize="small" />}
                    label="Dung lượng"
                    value={`${plan.storageLimitMb.toLocaleString("vi-VN")} MB`}
                  />
                  <LimitItem
                    icon={<SmartToyOutlined fontSize="small" />}
                    label="Lượt chat AI"
                    value={
                      plan.aiChatLimit === null
                        ? "Không giới hạn"
                        : plan.aiChatLimit.toLocaleString("vi-VN")
                    }
                  />
                </Stack>
              </CardContent>

              <CardActions
                sx={{ px: 3, py: 2, borderTop: 1, borderColor: "divider" }}
              >
                <Button
                  startIcon={<EditOutlined />}
                  onClick={() => admin.openEdit(plan)}
                >
                  Chỉnh sửa
                </Button>
                {plan.isActive && plan.code !== "FREE" && (
                  <Button
                    color="error"
                    startIcon={<HideSourceOutlined />}
                    onClick={() => admin.setDeactivatingPlan(plan)}
                  >
                    Ngừng gói
                  </Button>
                )}
              </CardActions>
            </Card>
          ))}
      </Box>

      {!admin.loading && !admin.error && admin.plans.length === 0 && (
        <Box sx={{ textAlign: "center", py: 8 }}>
          <Typography variant="h6" fontWeight={700}>
            Không có gói phù hợp
          </Typography>
          <Typography color="text.secondary">
            Hãy đổi bộ lọc hoặc tạo một gói mới.
          </Typography>
        </Box>
      )}
    </>
  );
}
