import { Alert, Box, Button, Card, CardContent, CircularProgress, Pagination, Typography } from "@mui/material";
import UserLayout from "../Layout/UserLayout.jsx";
import SubscriptionGrid from "./components/SubscriptionGrid.jsx";
import SubscriptionHeader from "./components/SubscriptionHeader.jsx";
import useSubscription from "./hooks/useSubscription.js";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import { useNavigate } from "react-router-dom";

function formatDate(dateString) {
  if (!dateString) return "Không giới hạn";
  return new Date(dateString).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function formatStorage(megabytes) {
  if (!megabytes) return "0 MB";
  if (megabytes >= 1024) {
    return `${(megabytes / 1024).toLocaleString("vi-VN")} GB`;
  }
  return `${megabytes.toLocaleString("vi-VN")} MB`;
}

function MySubscriptionCard({ subscription, navigate }) {
  const { mySubscription, loadMySubscription } = subscription;

  if (!mySubscription) return null;

  const isFree = mySubscription.plan === "FREE";
  const isActive = mySubscription.expiresAt && new Date(mySubscription.expiresAt) > new Date();

  return (
    <Card
      sx={{
        mb: 4,
        background: isFree
          ? "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)"
          : "linear-gradient(135deg, #10b981 0%, #059669 100%)",
        color: "white",
        borderRadius: "var(--radius-md)",
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            flexWrap: "wrap",
            gap: 2,
          }}
        >
          <Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
              <CheckCircleIcon sx={{ fontSize: 20 }} />
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                {mySubscription.planName || mySubscription.plan}
              </Typography>
            </Box>
            <Typography sx={{ opacity: 0.9, fontSize: "0.875rem", mb: 0.5 }}>
              Hết hạn: {formatDate(mySubscription.expiresAt)}
            </Typography>
            <Typography sx={{ opacity: 0.9, fontSize: "0.875rem" }}>
              Dung lượng: {formatStorage(mySubscription.storageLimitMb)} | Tải lên:{" "}
              {mySubscription.uploadLimit?.toLocaleString("vi-VN")} lượt | AI:{" "}
              {mySubscription.aiChatLimit === null
                ? "Không giới hạn"
                : `${mySubscription.aiChatsUsed || 0}/${mySubscription.aiChatLimit?.toLocaleString("vi-VN")} câu`}
            </Typography>
          </Box>
          {!isFree && !isActive && (
            <Button
              variant="contained"
              size="small"
              startIcon={<ArrowUpwardIcon />}
              onClick={() => navigate("/subscription")}
              sx={{
                bgcolor: "rgba(255,255,255,0.2)",
                color: "white",
                "&:hover": { bgcolor: "rgba(255,255,255,0.3)" },
                textTransform: "none",
                fontWeight: 600,
              }}
            >
              Gia hạn
            </Button>
          )}
        </Box>
      </CardContent>
    </Card>
  );
}

export default function Subscription() {
  const subscription = useSubscription();
  const navigate = useNavigate();

  return (
    <UserLayout>
      <SubscriptionHeader />

      <MySubscriptionCard subscription={subscription} navigate={navigate} />

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
