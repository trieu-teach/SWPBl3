import {
  Box,
  FormControl,
  FormLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import DocumentTagInput from "./DocumentTagInput.jsx";

export default function DocumentMetadataForm({ upload }) {
  return (
    <Paper variant="outlined" sx={{ p: { xs: 2, sm: 3 }, borderRadius: 3 }}>
      <Typography variant="h6" sx={{ fontWeight: 750, mb: 2 }}>
        2. Thông tin tài liệu
      </Typography>
      <Stack spacing={2.5}>
        <TextField
          label="Tiêu đề"
          required
          value={upload.title}
          onChange={(event) => upload.updateField("title", event.target.value)}
          inputProps={{ maxLength: 200 }}
          helperText={`${upload.title.length}/200 ký tự`}
        />
        <TextField
          label="Mô tả"
          multiline
          minRows={3}
          value={upload.description}
          onChange={(event) =>
            upload.updateField("description", event.target.value)
          }
          inputProps={{ maxLength: 2000 }}
          helperText={`${upload.description.length}/2000 ký tự`}
        />
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
            gap: 2,
          }}
        >
          <FormControl required disabled={upload.loadingOptions}>
            <FormLabel sx={{ mb: 0.75 }}>Môn học</FormLabel>
            <Select
              value={upload.subjectId}
              displayEmpty
              onChange={(event) =>
                upload.updateField("subjectId", event.target.value)
              }
            >
              <MenuItem value="" disabled>
                {upload.loadingOptions ? "Đang tải..." : "Chọn môn học"}
              </MenuItem>
              {upload.subjects.map((item) => (
                <MenuItem key={item.id} value={item.id}>
                  {item.name}
                  {item.code ? ` (${item.code})` : ""}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl required disabled={!upload.subjectId}>
            <FormLabel sx={{ mb: 0.75 }}>Danh mục</FormLabel>
            <Select
              value={upload.categoryId}
              displayEmpty
              onChange={(event) =>
                upload.updateField("categoryId", event.target.value)
              }
            >
              <MenuItem value="" disabled>
                {upload.subjectId ? "Chọn danh mục" : "Chọn môn học trước"}
              </MenuItem>
              {upload.categories.map((item) => (
                <MenuItem key={item.id} value={item.id}>
                  {item.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
        <DocumentTagInput
          value={upload.tagInput}
          tags={upload.tags}
          onChange={upload.setTagInput}
          onAdd={upload.addTag}
          onRemove={upload.removeTag}
        />
      </Stack>
    </Paper>
  );
}
