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
      <Box
        sx={{
          maxWidth: 1200,
          mx: "auto",
          px: { xs: 2, md: 3 },
          py: { xs: 3, md: 4 },
        }}
      >
        <SubscriptionHeader />
        <SubscriptionUsageCard subscription={subscription.mySubscription} />

        {subscription.notification && (
          <Alert
            severity={subscription.notification.type}
            onClose={subscription.clearNotification}
            sx={{
              mb: 3,
              borderRadius: "12px",
              "& .MuiAlert-icon": { alignItems: "center" },
            }}
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
            sx={{
              mb: 3,
              borderRadius: "12px",
            }}
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
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1.5,
                mb: 3,
                mt: 4,
              }}
            >
              <Typography
                fontWeight={700}
                sx={{ fontSize: { xs: "1rem", md: "1.1rem" } }}
              >
                {subscription.allPlans.length} gói dịch vụ
              </Typography>
              <Box
                sx={{
                  flex: 1,
                  height: 1,
                  bgcolor: "var(--border-color)",
                }}
              />
            </Box>
            <SubscriptionGrid subscription={subscription} />

            {subscription.totalPages > 1 && (
              <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
                <Pagination
                  page={subscription.page}
                  count={subscription.totalPages}
                  color="primary"
                  onChange={(_event, value) => subscription.setPage(value)}
                  sx={{
                    "& .MuiPaginationItem-root": {
                      borderRadius: "8px",
                    },
                  }}
                />
              </Box>
            )}
          </>
        )}
      </Box>

      <PaymentDialog
        payment={subscription.checkout}
        remainingSeconds={subscription.remainingSeconds}
        cancelling={subscription.cancellingPayment}
        onCancel={subscription.cancelPayment}
        onDismiss={subscription.dismissPayment}
        onCreateNew={subscription.resetPayment}
      />
    </UserLayout>
  );
}
