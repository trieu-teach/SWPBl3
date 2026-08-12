import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  FormControl,
  FormControlLabel,
  FormLabel,
  LinearProgress,
  MenuItem,
  Paper,
  Radio,
  RadioGroup,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import {
  CheckCircleOutlined,
  CloudUploadOutlined,
  DeleteOutlined,
  DescriptionOutlined,
  LockOutlined,
  PublicOutlined,
} from "@mui/icons-material";
import UserLayout from "../Layout/UserLayout.jsx";
import {
  getCategories,
  getSubjects,
  uploadDocument,
} from "../../../api/documents.api.js";

const MAX_FILE_SIZE = 80 * 1024 * 1024;
const ACCEPTED_EXTENSIONS = [
  "pdf",
  "doc",
  "docx",
  "xls",
  "xlsx",
  "ppt",
  "pptx",
];

function validateFile(file) {
  if (!file) return "Vui lòng chọn một tệp.";
  const extension = file.name.split(".").pop()?.toLowerCase();
  if (!ACCEPTED_EXTENSIONS.includes(extension))
    return "Chỉ hỗ trợ PDF, Word, Excel và PowerPoint.";
  if (file.size > MAX_FILE_SIZE)
    return "Dung lượng tệp không được vượt quá 80 MB.";
  return "";
}

function fileSize(bytes) {
  return bytes < 1024 * 1024
    ? `${Math.ceil(bytes / 1024)} KB`
    : `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

export default function UploadDocument() {
  const inputRef = useRef(null);
  const [subjects, setSubjects] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loadingOptions, setLoadingOptions] = useState(true);
  const [optionsError, setOptionsError] = useState("");
  const [dragging, setDragging] = useState(false);
  const [file, setFile] = useState(null);
  const [fileError, setFileError] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [subjectId, setSubjectId] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [visibility, setVisibility] = useState("PRIVATE");
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [submitError, setSubmitError] = useState("");
  const [result, setResult] = useState(null);

  useEffect(() => {
    let active = true;
    getSubjects()
      .then((data) => active && setSubjects(data?.items || data || []))
      .catch(
        () =>
          active &&
          setOptionsError(
            "Không thể tải môn học. Hãy kiểm tra kết nối backend.",
          ),
      )
      .finally(() => active && setLoadingOptions(false));
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;
    setCategoryId("");
    setCategories([]);
    if (subjectId) {
      getCategories(subjectId)
        .then((data) => active && setCategories(data?.items || data || []))
        .catch(() => active && setOptionsError("Không thể tải danh mục."));
    }
    return () => {
      active = false;
    };
  }, [subjectId]);

  function selectFile(nextFile) {
    const error = validateFile(nextFile);
    setFileError(error);
    if (error) return;
    setFile(nextFile);
    if (!title) setTitle(nextFile.name.replace(/\.[^.]+$/, ""));
  }

  function addTag() {
    const next = tagInput.trim();
    if (!next || tags.includes(next) || tags.length >= 10) return;
    setTags((current) => [...current, next]);
    setTagInput("");
  }

  async function submit(event) {
    event.preventDefault();
    const error = validateFile(file);
    if (error) return setFileError(error);
    if (!title.trim() || !subjectId || !categoryId) {
      return setSubmitError("Vui lòng nhập tiêu đề, chọn môn học và danh mục.");
    }
    setSubmitting(true);
    setSubmitError("");
    setProgress(0);
    try {
      const document = await uploadDocument(
        { file, title, description, subjectId, categoryId, visibility, tags },
        setProgress,
      );
      setProgress(100);
      setResult(document);
    } catch (uploadError) {
      setSubmitError(uploadError.message || "Không thể tải tài liệu lên.");
    } finally {
      setSubmitting(false);
    }
  }

  if (result) {
    return (
      <UserLayout>
        <Paper
          variant="outlined"
          sx={{
            maxWidth: 720,
            mx: "auto",
            mt: 5,
            p: { xs: 3, md: 6 },
            borderRadius: 4,
            textAlign: "center",
          }}
        >
          <CheckCircleOutlined
            sx={{ fontSize: 72, color: "success.main", mb: 2 }}
          />
          <Typography variant="h4" sx={{ fontWeight: 800, mb: 1 }}>
            Tải tài liệu thành công
          </Typography>
          <Typography color="text.secondary">
            “{result.title || title}” đã được lưu. Hệ thống đang trích xuất nội
            dung cho tìm kiếm và AI.
          </Typography>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={1.5}
            justifyContent="center"
            sx={{ mt: 4 }}
          >
            <Button component={Link} to="/documents" variant="contained">
              Đến thư viện
            </Button>
            <Button variant="outlined" onClick={() => window.location.reload()}>
              Tải thêm tài liệu
            </Button>
          </Stack>
        </Paper>
      </UserLayout>
    );
  }

  return (
    <UserLayout>
      <Typography variant="h4" sx={{ fontWeight: 800, mb: 0.75 }}>
        Tải tài liệu
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 3 }}>
        Thêm tài liệu vào thư viện để lưu trữ, tìm kiếm và hỏi đáp cùng AI.
      </Typography>
      {optionsError && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          {optionsError}
        </Alert>
      )}

      <Box
        component="form"
        onSubmit={submit}
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", lg: "minmax(0, 1fr) 340px" },
          gap: 3,
        }}
      >
        <Stack spacing={3}>
          <Paper
            variant="outlined"
            sx={{ p: { xs: 2, sm: 3 }, borderRadius: 3 }}
          >
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
                selectFile(event.dataTransfer.files[0]);
              }}
              sx={{
                border: "2px dashed",
                borderColor: fileError
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
                onChange={(event) => selectFile(event.target.files[0])}
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
                      {fileSize(file.size)}
                    </Typography>
                  </Box>
                  <Button
                    color="error"
                    startIcon={<DeleteOutlined />}
                    onClick={(event) => {
                      event.stopPropagation();
                      setFile(null);
                      if (inputRef.current) inputRef.current.value = "";
                    }}
                  >
                    Xóa
                  </Button>
                </Stack>
              ) : (
                <>
                  <CloudUploadOutlined
                    color="primary"
                    sx={{ fontSize: 52, mb: 1 }}
                  />
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
            {fileError && (
              <Typography color="error" variant="body2" sx={{ mt: 1 }}>
                {fileError}
              </Typography>
            )}
          </Paper>

          <Paper
            variant="outlined"
            sx={{ p: { xs: 2, sm: 3 }, borderRadius: 3 }}
          >
            <Typography variant="h6" sx={{ fontWeight: 750, mb: 2 }}>
              2. Thông tin tài liệu
            </Typography>
            <Stack spacing={2.5}>
              <TextField
                label="Tiêu đề"
                required
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                inputProps={{ maxLength: 200 }}
                helperText={`${title.length}/200 ký tự`}
              />
              <TextField
                label="Mô tả"
                multiline
                minRows={3}
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                inputProps={{ maxLength: 2000 }}
                helperText={`${description.length}/2000 ký tự`}
              />
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                  gap: 2,
                }}
              >
                <FormControl required disabled={loadingOptions}>
                  <FormLabel sx={{ mb: 0.75 }}>Môn học</FormLabel>
                  <Select
                    value={subjectId}
                    displayEmpty
                    onChange={(event) => setSubjectId(event.target.value)}
                  >
                    <MenuItem value="" disabled>
                      {loadingOptions ? "Đang tải..." : "Chọn môn học"}
                    </MenuItem>
                    {subjects.map((item) => (
                      <MenuItem key={item.id} value={item.id}>
                        {item.name}
                        {item.code ? ` (${item.code})` : ""}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <FormControl required disabled={!subjectId}>
                  <FormLabel sx={{ mb: 0.75 }}>Danh mục</FormLabel>
                  <Select
                    value={categoryId}
                    displayEmpty
                    onChange={(event) => setCategoryId(event.target.value)}
                  >
                    <MenuItem value="" disabled>
                      {subjectId ? "Chọn danh mục" : "Chọn môn học trước"}
                    </MenuItem>
                    {categories.map((item) => (
                      <MenuItem key={item.id} value={item.id}>
                        {item.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
              <Box>
                <TextField
                  fullWidth
                  label="Thẻ (tối đa 10)"
                  value={tagInput}
                  disabled={tags.length >= 10}
                  onChange={(event) => setTagInput(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      event.preventDefault();
                      addTag();
                    }
                  }}
                  onBlur={addTag}
                  helperText="Nhập một thẻ rồi nhấn Enter"
                />
                {tags.length > 0 && (
                  <Stack
                    direction="row"
                    gap={1}
                    flexWrap="wrap"
                    sx={{ mt: 1.5 }}
                  >
                    {tags.map((tag) => (
                      <Chip
                        key={tag}
                        label={tag}
                        onDelete={() =>
                          setTags((current) =>
                            current.filter((item) => item !== tag),
                          )
                        }
                      />
                    ))}
                  </Stack>
                )}
              </Box>
            </Stack>
          </Paper>
        </Stack>

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
          <Typography variant="h6" sx={{ fontWeight: 750, mb: 2 }}>
            Quyền riêng tư
          </Typography>
          <RadioGroup
            value={visibility}
            onChange={(event) => setVisibility(event.target.value)}
          >
            <Paper
              variant="outlined"
              sx={{
                p: 1.5,
                mb: 1.5,
                borderColor:
                  visibility === "PRIVATE" ? "primary.main" : "divider",
              }}
            >
              <FormControlLabel
                value="PRIVATE"
                control={<Radio />}
                label={
                  <Box>
                    <Stack direction="row" gap={1}>
                      <LockOutlined fontSize="small" />
                      <Typography sx={{ fontWeight: 700 }}>Riêng tư</Typography>
                    </Stack>
                    <Typography variant="body2" color="text.secondary">
                      Chỉ bạn có thể sử dụng tài liệu.
                    </Typography>
                  </Box>
                }
              />
            </Paper>
            <Paper
              variant="outlined"
              sx={{
                p: 1.5,
                borderColor:
                  visibility === "PUBLIC" ? "primary.main" : "divider",
              }}
            >
              <FormControlLabel
                value="PUBLIC"
                control={<Radio />}
                label={
                  <Box>
                    <Stack direction="row" gap={1}>
                      <PublicOutlined fontSize="small" />
                      <Typography sx={{ fontWeight: 700 }}>
                        Công khai
                      </Typography>
                    </Stack>
                    <Typography variant="body2" color="text.secondary">
                      Tài liệu được gửi duyệt trước khi chia sẻ.
                    </Typography>
                  </Box>
                }
              />
            </Paper>
          </RadioGroup>
          {submitting && (
            <Box sx={{ mt: 3 }}>
              <Stack direction="row" justifyContent="space-between">
                <Typography variant="body2">Đang tải lên...</Typography>
                <Typography variant="body2" fontWeight={700}>
                  {progress}%
                </Typography>
              </Stack>
              <LinearProgress
                variant="determinate"
                value={progress}
                sx={{ mt: 1 }}
              />
            </Box>
          )}
          {submitError && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {submitError}
            </Alert>
          )}
          <Button
            fullWidth
            size="large"
            type="submit"
            variant="contained"
            disabled={submitting || loadingOptions}
            startIcon={
              submitting ? (
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
      </Box>
    </UserLayout>
  );
}
