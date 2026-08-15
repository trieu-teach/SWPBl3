import { CheckCircle, RefreshOutlined } from "@mui/icons-material";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  Divider,
  Skeleton,
  Typography,
} from "@mui/material";

const number = new Intl.NumberFormat("vi-VN", { maximumFractionDigits: 0 });
const currency = new Intl.NumberFormat("vi-VN", {
  style: "currency",
  currency: "VND",
  maximumFractionDigits: 0,
});

export default function PricingSection({
  plans,
  loading,
  error,
  onRetry,
  onLogin,
}) {
  return (
    <Box component="section" className="pricing section-pad" id="pricing">
      <Container maxWidth="lg">
        <Box className="section-head section-head--center">
          <Chip label="BẢNG GIÁ" size="small" className="eyebrow-chip" />
          <Typography variant="h2" className="section-title">
            Chọn gói phù hợp với bạn
          </Typography>
          <Typography className="section-sub">
            Giá và quyền lợi được đồng bộ trực tiếp từ hệ thống.
          </Typography>
        </Box>

        {error && (
          <Alert
            severity="error"
            action={
              <Button
                color="inherit"
                startIcon={<RefreshOutlined />}
                onClick={onRetry}
              >
                Thử lại
              </Button>
            }
            sx={{ mb: 3 }}
          >
            {error}
          </Alert>
        )}

        <Box className="three-grid">
          {loading &&
            Array.from({ length: 2 }).map((_, index) => (
              <Skeleton key={index} variant="rounded" height={430} />
            ))}

          {!loading &&
            plans.map((plan) => (
              <Card
                className={`plan-card ${plan.highlight ? "is-highlight" : ""}`}
                elevation={0}
                key={plan.id}
              >
                <CardContent>
                  {plan.badge && (
                    <Chip
                      label={plan.badge}
                      size="small"
                      className="plan-badge"
                    />
                  )}
                  <Typography className="plan-name" component="div">
                    {plan.name}
                  </Typography>
                  <Box className="plan-price-row">
                    <Typography className="plan-price" component="span">
                      {number.format(plan.price)}
                    </Typography>
                    <Typography className="plan-period" component="span">
                      {plan.period}
                    </Typography>
                  </Box>
                  {plan.originalPrice !== plan.price && (
                    <Typography
                      color="text.secondary"
                      sx={{ textDecoration: "line-through" }}
                    >
                      {currency.format(plan.originalPrice)}
                    </Typography>
                  )}
                  <Divider sx={{ my: 2.5, borderColor: "var(--line)" }} />
                  <Box className="plan-features">
                    {plan.features.map((feature) => (
                      <Box key={feature} className="plan-feat">
                        <CheckCircle
                          sx={{ fontSize: 16, color: "var(--green)" }}
                        />
                        <Typography variant="body2" className="plan-feat-text">
                          {feature}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                  <Button
                    fullWidth
                    variant={plan.highlight ? "contained" : "outlined"}
                    disableElevation={plan.highlight}
                    className={
                      plan.highlight
                        ? "primary-cta plan-cta"
                        : "secondary-cta plan-cta"
                    }
                    onClick={onLogin}
                  >
                    {plan.cta}
                  </Button>
                </CardContent>
              </Card>
            ))}
        </Box>

        {!loading && !error && plans.length === 0 && (
          <Typography color="text.secondary" align="center">
            Hiện chưa có gói trả phí đang được mở bán.
          </Typography>
        )}
      </Container>
    </Box>
  );
}
