import {
  Alert,
  Box,
  Button,
  CircularProgress,
  LinearProgress,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import { CloudUploadOutlined } from "@mui/icons-material";
import VisibilitySelector from "./VisibilitySelector.jsx";

export default function UploadSummary({ upload }) {
  return (
    <Paper
      variant="outlined"
      sx={{
        p: 3,
        borderRadius: 3,
        alignSelf: "start",
        position: { lg: "sticky" },
        top: { lg: 96 },
      }}
    >
      <VisibilitySelector
        value={upload.visibility}
        onChange={(value) => upload.updateField("visibility", value)}
      />
      {upload.submitting && (
        <Box sx={{ mt: 3 }}>
          <Stack direction="row" justifyContent="space-between">
            <Typography variant="body2">Đang tải lên...</Typography>
            <Typography variant="body2" fontWeight={700}>
              {upload.progress}%
            </Typography>
          </Stack>
          <LinearProgress
            variant="determinate"
            value={upload.progress}
            sx={{ mt: 1 }}
          />
        </Box>
      )}
      {upload.submitError && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {upload.submitError}
        </Alert>
      )}
      <Button
        fullWidth
        size="large"
        type="submit"
        variant="contained"
        disabled={upload.submitting || upload.loadingOptions}
        startIcon={
          upload.submitting ? (
            <CircularProgress size={18} color="inherit" />
          ) : (
            <CloudUploadOutlined />
          )
        }
        sx={{ mt: 3 }}
      >
        Tải lên và xử lý
      </Button>
      <Typography
        variant="caption"
        color="text.secondary"
        sx={{ display: "block", textAlign: "center", mt: 1.5 }}
      >
        Tệp được lưu riêng tư và truyền qua kết nối an toàn.
      </Typography>
    </Paper>
  );
}
