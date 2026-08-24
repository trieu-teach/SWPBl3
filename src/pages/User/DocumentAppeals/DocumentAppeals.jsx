import {
  Alert,
  Box,
  Button,
  Card,
  FormControl,
  InputLabel,
  MenuItem,
  Pagination,
  Select,
  Stack,
  Typography,
} from "@mui/material";
import GavelOutlined from "@mui/icons-material/GavelOutlined";
import RefreshOutlined from "@mui/icons-material/RefreshOutlined";
import UserLayout from "../Layout/UserLayout.jsx";
import DocumentAppealDetailDialog from "./components/DocumentAppealDetailDialog.jsx";
import DocumentAppealsList from "./components/DocumentAppealsList.jsx";
import useDocumentAppeals from "./hooks/useDocumentAppeals.js";
import { USER_APPEAL_FILTERS } from "./utils/user-appeal-status.js";

export default function DocumentAppeals() {
  const appeals = useDocumentAppeals();

  return (
    <UserLayout>
      <Stack direction={{ xs: "column", sm: "row" }} alignItems={{ xs: "flex-start", sm: "center" }} gap={2} sx={{ mb: 3 }}>
        <Box sx={{ width: 52, height: 52, borderRadius: 2.5, display: "grid", placeItems: "center", bgcolor: "primary.main", color: "primary.contrastText" }}>
          <GavelOutlined />
        </Box>
        <Box>
          <Typography variant="h4" fontWeight={800}>Khiếu nại của tôi</Typography>
          <Typography color="text.secondary">Theo dõi kết quả xem xét các tài liệu đã gửi khiếu nại.</Typography>
        </Box>
      </Stack>

      <Card variant="outlined" sx={{ p: 2, mb: 3, borderRadius: 3 }}>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", sm: "240px auto" },
            columnGap: 2,
            rowGap: 1.5,
            justifyContent: { sm: "end" },
          }}
        >
          <FormControl size="small" sx={{ minWidth: 220 }}>
            <InputLabel shrink>Trạng thái</InputLabel>
            <Select
              value={appeals.status}
              label="Trạng thái"
              displayEmpty
              renderValue={(value) =>
                USER_APPEAL_FILTERS.find((option) => option.value === value)?.label ||
                "Tất cả trạng thái"
              }
              onChange={(event) => appeals.changeStatus(event.target.value)}
            >
              {USER_APPEAL_FILTERS.map((option) => (
                <MenuItem key={option.value || "ALL"} value={option.value}>{option.label}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <Button
            variant="outlined"
            startIcon={<RefreshOutlined />}
            onClick={appeals.load}
            sx={{ minHeight: 40, px: 2.5 }}
          >
            Tải lại
          </Button>
        </Box>
      </Card>

      {appeals.error && (
        <Alert severity="error" action={<Button color="inherit" onClick={appeals.load}>Thử lại</Button>} sx={{ mb: 2 }}>
          {appeals.error}
        </Alert>
      )}

      <Typography fontWeight={700} sx={{ mb: 2 }}>
        {appeals.loading ? "Đang tải..." : `${appeals.meta.totalItems || 0} khiếu nại`}
      </Typography>
      <DocumentAppealsList appeals={appeals} />

      {!appeals.loading && appeals.meta.totalPages > 1 && (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
          <Pagination page={appeals.page} count={appeals.meta.totalPages} color="primary" onChange={(_event, value) => appeals.setPage(value)} />
        </Box>
      )}

      <DocumentAppealDetailDialog appeals={appeals} />
    </UserLayout>
  );
}
