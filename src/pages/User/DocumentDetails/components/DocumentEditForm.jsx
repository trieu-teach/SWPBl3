import {
  Box,
  Button,
  FormControl,
  FormLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { SaveOutlined } from "@mui/icons-material";

export default function DocumentEditForm({ details }) {
  return (
    <Paper
      component="form"
      onSubmit={details.save}
      variant="outlined"
      sx={{ p: { xs: 2, md: 3 }, borderRadius: 3 }}
    >
      <Typography variant="h6" fontWeight={750} sx={{ mb: 2 }}>
        Thông tin tài liệu
      </Typography>
      <Stack spacing={2.5}>
        <TextField
          required
          label="Tiêu đề"
          value={details.form.title}
          onChange={(event) => details.updateField("title", event.target.value)}
          inputProps={{ maxLength: 200 }}
        />
        <TextField
          label="Mô tả"
          multiline
          minRows={4}
          value={details.form.description}
          onChange={(event) =>
            details.updateField("description", event.target.value)
          }
          inputProps={{ maxLength: 2000 }}
        />
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
            gap: 2,
          }}
        >
          <FormControl required>
            <FormLabel sx={{ mb: 0.75 }}>Môn học</FormLabel>
            <Select
              value={details.form.subjectId}
              onChange={(event) =>
                details.updateField("subjectId", event.target.value)
              }
            >
              {details.subjects.map((item) => (
                <MenuItem key={item.id} value={item.id}>
                  {item.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl required disabled={!details.form.subjectId}>
            <FormLabel sx={{ mb: 0.75 }}>Danh mục</FormLabel>
            <Select
              value={details.form.categoryId}
              onChange={(event) =>
                details.updateField("categoryId", event.target.value)
              }
            >
              {details.categories.map((item) => (
                <MenuItem key={item.id} value={item.id}>
                  {item.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
        <Button
          type="submit"
          variant="contained"
          startIcon={<SaveOutlined />}
          disabled={details.saving}
          sx={{ alignSelf: "flex-start" }}
        >
          {details.saving ? "Đang lưu..." : "Lưu thay đổi"}
        </Button>
      </Stack>
    </Paper>
  );
}
