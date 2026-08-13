import { RefreshOutlined, SearchOutlined } from "@mui/icons-material";
import {
  Box,
  Button,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
} from "@mui/material";

export default function SubscriptionFilters({ admin }) {
  const paidPlans =
    admin.stats.plans?.filter((plan) => plan.code !== "FREE") || [];

  return (
    <Card variant="outlined" sx={{ borderRadius: 3, mb: 2 }}>
      <CardContent>
        <Box
          component="form"
          onSubmit={admin.submitSearch}
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              md: "minmax(280px, 1fr) 220px auto",
            },
            gap: 1.5,
          }}
        >
          <TextField
            size="small"
            label="Tìm theo tên hoặc email"
            value={admin.searchInput}
            onChange={(event) => admin.setSearchInput(event.target.value)}
          />
          <FormControl size="small">
            <InputLabel>Gói dịch vụ</InputLabel>
            <Select
              value={admin.plan}
              label="Gói dịch vụ"
              onChange={(event) => admin.changePlan(event.target.value)}
            >
              <MenuItem value="">Tất cả gói trả phí</MenuItem>
              {paidPlans.map((plan) => (
                <MenuItem key={plan.code} value={plan.code}>
                  {plan.name} ({plan.code})
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Box sx={{ display: "flex", gap: 1 }}>
            <Button
              type="submit"
              variant="contained"
              startIcon={<SearchOutlined />}
            >
              Tìm kiếm
            </Button>
            <Button
              onClick={admin.resetFilters}
              startIcon={<RefreshOutlined />}
            >
              Đặt lại
            </Button>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}
