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
              isCurrentPlan={subscription.mySubscription?.plan === plan.code}
              onPurchase={subscription.purchasePlan}
              loading={subscription.processing}
            />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
