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
import ModeratorLayout from "../Layout/ModeratorLayout.jsx";
import ModeratorDocumentPreviewDialog from "../Documents/components/ModeratorDocumentPreviewDialog.jsx";
import ModeratorAppealDecisionDialog from "./components/ModeratorAppealDecisionDialog.jsx";
import ModeratorAppealDetailDialog from "./components/ModeratorAppealDetailDialog.jsx";
import ModeratorAppealsTable from "./components/ModeratorAppealsTable.jsx";
import useModeratorAppeals from "./hooks/useModeratorAppeals.js";
import { MODERATOR_APPEAL_FILTERS } from "./utils/moderator-appeal-status.js";

export default function ModeratorAppeals() {
  const moderation = useModeratorAppeals();

  return (
    <ModeratorLayout>
      <Stack direction={{ xs: "column", sm: "row" }} alignItems={{ xs: "flex-start", sm: "center" }} gap={2} sx={{ mb: 3 }}>
        <Box sx={{ width: 48, height: 48, borderRadius: 2.5, display: "grid", placeItems: "center", bgcolor: "warning.main", color: "warning.contrastText" }}>
          <GavelOutlined />
        </Box>
        <Box>
          <Typography variant="h4" fontWeight={800}>Khiếu nại tài liệu</Typography>
          <Typography color="text.secondary">Xem lại quyết định kiểm duyệt theo yêu cầu của người đăng.</Typography>
        </Box>
      </Stack>

      <Card variant="outlined" sx={{ p: 2, mb: 3, borderRadius: 3 }}>
        <Stack direction={{ xs: "column", sm: "row" }} gap={1.25} justifyContent="flex-end">
          <FormControl size="small" sx={{ minWidth: 220 }}>
            <InputLabel>Trạng thái</InputLabel>
            <Select value={moderation.status} label="Trạng thái" onChange={(event) => moderation.changeStatus(event.target.value)}>
              {MODERATOR_APPEAL_FILTERS.map((option) => (
                <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <Button variant="outlined" startIcon={<RefreshOutlined />} onClick={moderation.load}>Tải lại</Button>
        </Stack>
      </Card>

      {moderation.error && (
        <Alert severity="error" action={<Button color="inherit" onClick={moderation.load}>Thử lại</Button>} sx={{ mb: 2 }}>
          {moderation.error}
        </Alert>
      )}

      <Typography sx={{ mb: 1.5 }}>{moderation.meta.totalItems || 0} khiếu nại</Typography>
      <ModeratorAppealsTable moderation={moderation} />
      {!moderation.loading && moderation.meta.totalPages > 1 && (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
          <Pagination page={moderation.page} count={moderation.meta.totalPages} color="primary" onChange={(_event, value) => moderation.setPage(value)} />
        </Box>
      )}

      <ModeratorAppealDetailDialog moderation={moderation} />
      <ModeratorAppealDecisionDialog moderation={moderation} />
      <ModeratorDocumentPreviewDialog preview={moderation.preview} onClose={() => moderation.setPreview(null)} />
    </ModeratorLayout>
  );
}
