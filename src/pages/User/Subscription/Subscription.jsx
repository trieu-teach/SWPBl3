import { Alert, Box, Button, Card, CardContent, CircularProgress, Pagination, Snackbar, Typography } from "@mui/material";
import UserLayout from "../Layout/UserLayout.jsx";
import SubscriptionGrid from "./components/SubscriptionGrid.jsx";
import SubscriptionHeader from "./components/SubscriptionHeader.jsx";
import useSubscription from "./hooks/useSubscription.js";

function formatDate(dateString) {
  if (!dateString) return "";
  return new Date(dateString).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function MySubscriptionCard({ subscription }) {
  if (!subscription) return null;

  return (
    <Card sx={{ mb: 4, bgcolor: "primary.main", color: "white" }}>
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 2 }}>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              {subscription.planName || subscription.plan?.name || "Gói của bạn"}
            </Typography>
            <Typography sx={{ opacity: 0.9, fontSize: "0.875rem" }}>
              Hết hạn: {formatDate(subscription.endDate || subscription.expiresAt)}
            </Typography>
            <Typography sx={{ opacity: 0.9, fontSize: "0.875rem" }}>
              Trạng thái: <strong>{subscription.status}</strong>
            </Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}

export default function Subscription() {
  const subscription = useSubscription();

  return (
    <UserLayout>
      <SubscriptionHeader />

      <MySubscriptionCard
        subscription={subscription.mySubscription}
      />

      {subscription.notification && (
        <Alert
          severity={subscription.notification.type}
          onClose={subscription.clearNotification}
          sx={{ mb: 3 }}
        >
          {subscription.notification.message}
        </Alert>
      )}

      {subscription.error && (
        <Alert
          severity="error"
          action={
            <Button color="inherit" onClick={subscription.loadPlans}>
              Thử lại
            </Button>
          }
          sx={{ mb: 3 }}
        >
          {subscription.error}
        </Alert>
      )}

      {subscription.loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          <Typography fontWeight={700} sx={{ mb: 2 }}>
            {subscription.allPlans.length} gói dịch vụ
          </Typography>
          <SubscriptionGrid subscription={subscription} />

          {subscription.totalPages > 1 && (
            <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
              <Pagination
                page={subscription.page}
                count={subscription.totalPages}
                color="primary"
                onChange={(_e, value) => subscription.setPage(value)}
              />
            </Box>
          )}
        </>
      )}
    </UserLayout>
  );
}
