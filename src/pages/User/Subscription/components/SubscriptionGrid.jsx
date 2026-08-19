import { Box, Grid } from "@mui/material";
import SubscriptionCard from "./SubscriptionCard.jsx";

export default function SubscriptionGrid({ subscription }) {
  return (
    <Box>
      <Grid container spacing={3}>
        {subscription.plans.map((plan) => (
          <Grid size={{ xs: 12, md: 6, lg: 4 }} key={plan.id}>
            <SubscriptionCard
              plan={plan}
              buttonState={subscription.getButtonState(plan)}
              onPurchase={subscription.purchasePlan}
              loading={subscription.processing}
              selectedPaymentMethod={subscription.selectedPaymentMethod}
              onPaymentMethodChange={subscription.setSelectedPaymentMethod}
            />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
