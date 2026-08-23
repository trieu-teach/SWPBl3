import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  FormControl,
  InputLabel,
  MenuItem,
  Pagination,
  Paper,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import RateReviewOutlined from "@mui/icons-material/RateReviewOutlined";
import { useAuth } from "../../../features/auth/AuthProvider.jsx";
import {
  DOCUMENT_APPEAL_STATUS_OPTIONS,
  formatModerationDate,
  getDocumentAppealStatusPresentation,
} from "../../../lib/moderation.js";
import AdminLayout from "../../Admin/Layout/AdminLayout.jsx";
import ModeratorLayout from "../Layout/ModeratorLayout.jsx";
import AppealDecisionDialog from "./components/AppealDecisionDialog.jsx";
import useModeratorAppeals from "./hooks/useModeratorAppeals.js";

export default function ModeratorAppeals() {
  const { user } = useAuth();
  const appeals = useModeratorAppeals();
  const Layout = user?.role === "ADMIN" ? AdminLayout : ModeratorLayout;

  return (
    <Layout>
      <Stack
        direction={{ xs: "column", sm: "row" }}
        sx={{
          justifyContent: "space-between",
          alignItems: { xs: "stretch", sm: "center" },
          gap: 2,
          mb: 3,
        }}
      >
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography variant="h4" fontWeight={800}>
            Khiếu nại kiểm duyệt
          </Typography>
          <Typography color="text.secondary" sx={{ mt: 0.5 }}>
            Xem xét khiếu nại từ chủ tài liệu và ghi nhận quyết định cuối cùng.
          </Typography>
        </Box>
        <FormControl size="small" sx={{ width: { xs: "100%", sm: 220 } }}>
          <InputLabel id="document-appeal-status-label">Trạng thái</InputLabel>
          <Select
            labelId="document-appeal-status-label"
            label="Trạng thái"
            value={appeals.status}
            onChange={(event) => appeals.updateStatus(event.target.value)}
          >
            {DOCUMENT_APPEAL_STATUS_OPTIONS.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Stack>

      {appeals.error && (
        <Alert
          severity="error"
          action={
            <Button color="inherit" onClick={appeals.loadAppeals}>
              Thử lại
            </Button>
          }
          sx={{ mb: 2 }}
        >
          {appeals.error}
        </Alert>
      )}

      <Paper variant="outlined" sx={{ borderRadius: 3, overflow: "hidden" }}>
        {appeals.loading ? (
          <Stack sx={{ alignItems: "center", gap: 1.5, py: 8 }}>
            <CircularProgress size={30} />
            <Typography color="text.secondary">Đang tải khiếu nại...</Typography>
          </Stack>
        ) : appeals.appeals.length === 0 ? (
          <Stack
            sx={{ alignItems: "center", gap: 1, py: 8, px: 2, textAlign: "center" }}
          >
            <RateReviewOutlined color="disabled" sx={{ fontSize: 46 }} />
            <Typography fontWeight={750}>
              Không có khiếu nại ở trạng thái này
            </Typography>
            <Typography color="text.secondary">
              Hàng chờ sẽ cập nhật khi có khiếu nại mới từ chủ tài liệu.
            </Typography>
          </Stack>
        ) : (
          <TableContainer>
            <Table sx={{ minWidth: 860 }}>
              <TableHead>
                <TableRow>
                  <TableCell>Tài liệu</TableCell>
                  <TableCell>Lý do</TableCell>
                  <TableCell>Người gửi</TableCell>
                  <TableCell>Thời điểm</TableCell>
                  <TableCell>Trạng thái</TableCell>
                  <TableCell align="right">Thao tác</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {appeals.appeals.map((appeal) => {
                  const presentation = getDocumentAppealStatusPresentation(
                    appeal.status,
                  );
                  return (
                    <TableRow hover key={appeal.id}>
                      <TableCell>
                        <Typography variant="body2" fontWeight={700}>
                          {appeal.documentId}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Nguồn: {appeal.source || "—"}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ maxWidth: 280 }}>
                        <Typography noWrap title={appeal.reason}>
                          {appeal.reason || "—"}
                        </Typography>
                      </TableCell>
                      <TableCell>{appeal.userId || "—"}</TableCell>
                      <TableCell>{formatModerationDate(appeal.createdAt)}</TableCell>
                      <TableCell>
                        <Chip
                          size="small"
                          label={presentation.label}
                          color={presentation.color}
                        />
                      </TableCell>
                      <TableCell align="right">
                        <Button size="small" onClick={() => appeals.openAppeal(appeal)}>
                          Xem xét
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      {!appeals.loading && appeals.meta.totalPages > 1 && (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
          <Pagination
            page={appeals.page}
            count={appeals.meta.totalPages}
            color="primary"
            onChange={(_event, value) => appeals.setPage(value)}
          />
        </Box>
      )}

      <AppealDecisionDialog appeals={appeals} />
    </Layout>
  );
}
