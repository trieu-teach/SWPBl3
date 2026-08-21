import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Pagination,
  Typography,
} from "@mui/material";
import UserLayout from "../Layout/UserLayout.jsx";
import PaymentDialog from "./components/PaymentDialog.jsx";
import SubscriptionGrid from "./components/SubscriptionGrid.jsx";
import SubscriptionHeader from "./components/SubscriptionHeader.jsx";
import SubscriptionUsageCard from "./components/SubscriptionUsageCard.jsx";
import useSubscription from "./hooks/useSubscription.js";

export default function Subscription() {
  const subscription = useSubscription();

  return (
    <UserLayout>
      <SubscriptionHeader />
      <SubscriptionUsageCard subscription={subscription.mySubscription} />

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
                onChange={(_event, value) => subscription.setPage(value)}
              />
            </Box>
          )}
        </>
      )}

      <PaymentDialog
        payment={subscription.checkout}
        remainingSeconds={subscription.remainingSeconds}
        cancelling={subscription.cancellingPayment}
        onCancel={subscription.cancelPayment}
        onDismiss={subscription.dismissPayment}
      />
    </UserLayout>
  );
}
