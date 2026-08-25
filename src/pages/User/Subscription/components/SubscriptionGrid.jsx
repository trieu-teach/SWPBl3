import Box from "@mui/material/Box";
import SubscriptionCard from "./SubscriptionCard.jsx";

/**
 * SubscriptionGrid - Grid hiển thị danh sách các gói dịch vụ
 * Nhận data từ useSubscription hook
 */
export default function SubscriptionGrid({ subscription }) {
  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: {
          xs: "1fr",
          sm: "repeat(2, minmax(0, 1fr))",
          lg: "repeat(3, minmax(0, 1fr))",
        },
        gap: { xs: 3, md: 4 },
        width: "100%",
      }}
    >
      {subscription.plans.map((plan) => (
        <SubscriptionCard
          key={plan.id}
          plan={plan}
          buttonState={subscription.getButtonState(plan)}
          onPurchase={subscription.purchasePlan}
          loading={subscription.processingPlanCode === plan.code}
          processing={subscription.processing}
        />
      ))}
    </Box>
  );
}
