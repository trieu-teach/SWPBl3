import { useRef, useState } from "react";
import { Box, Button, Paper, Stack, Typography } from "@mui/material";
import {
  CloudUploadOutlined,
  DeleteOutlined,
  DescriptionOutlined,
} from "@mui/icons-material";
import { formatFileSize } from "../utils/upload-validation.js";

export default function FileDropzone({ file, error, onSelect, onRemove }) {
  const inputRef = useRef(null);
  const [dragging, setDragging] = useState(false);

  function removeFile(event) {
    event.stopPropagation();
    onRemove();
    if (inputRef.current) inputRef.current.value = "";
  }

  return (
    <Paper variant="outlined" sx={{ p: { xs: 2, sm: 3 }, borderRadius: 3 }}>
      <Typography variant="h6" sx={{ fontWeight: 750, mb: 2 }}>
        1. Chọn tệp
      </Typography>
      <Box
        onClick={() => !file && inputRef.current?.click()}
        onDragEnter={(event) => {
          event.preventDefault();
          setDragging(true);
        }}
        onDragOver={(event) => event.preventDefault()}
        onDragLeave={() => setDragging(false)}
        onDrop={(event) => {
          event.preventDefault();
          setDragging(false);
          onSelect(event.dataTransfer.files[0]);
        }}
        sx={{
          border: "2px dashed",
          borderColor: error
            ? "error.main"
            : dragging
              ? "primary.main"
              : "divider",
          bgcolor: dragging ? "action.hover" : "transparent",
          borderRadius: 3,
          p: { xs: 3, sm: 5 },
          textAlign: "center",
          cursor: file ? "default" : "pointer",
        }}
      >
        <input
          ref={inputRef}
          hidden
          type="file"
          accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
          onChange={(event) => onSelect(event.target.files[0])}
        />
        {file ? (
          <Stack
            direction="row"
            alignItems="center"
            spacing={2}
            textAlign="left"
          >
            <DescriptionOutlined color="primary" sx={{ fontSize: 42 }} />
            <Box sx={{ minWidth: 0, flex: 1 }}>
              <Typography noWrap sx={{ fontWeight: 700 }}>
                {file.name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {formatFileSize(file.size)}
              </Typography>
            </Box>
            <Button
              color="error"
              startIcon={<DeleteOutlined />}
              onClick={removeFile}
            >
              Xóa
            </Button>
          </Stack>
        ) : (
          <>
            <CloudUploadOutlined color="primary" sx={{ fontSize: 52, mb: 1 }} />
            <Typography sx={{ fontWeight: 700 }}>
              Kéo thả tệp hoặc bấm để chọn
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mt: 0.75 }}
            >
              PDF, Word, Excel, PowerPoint · Tối đa 80 MB
            </Typography>
          </>
        )}
      </Box>
      {error && (
        <Typography color="error" variant="body2" sx={{ mt: 1 }}>
          {error}
        </Typography>
      )}
    </Paper>
  );
}
