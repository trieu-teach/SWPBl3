import { useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  Box,
  Chip,
  CircularProgress,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tab,
  Tabs,
  Typography,
} from "@mui/material";
import { DescriptionOutlined, VisibilityOutlined } from "@mui/icons-material";
import { formatFileSize } from "../utils/upload-validation.js";

function getExcelColumnName(index) {
  let value = index + 1;
  let name = "";
  while (value > 0) {
    const remainder = (value - 1) % 26;
    name = String.fromCharCode(65 + remainder) + name;
    value = Math.floor((value - 1) / 26);
  }
  return name;
}

function DocxPreview({ file }) {
  const containerRef = useRef(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    const container = containerRef.current;
    if (!container) return undefined;

    container.replaceChildren();
    setError("");
    file
      .arrayBuffer()
      .then(async (buffer) => {
        const { renderAsync } = await import("docx-preview");
        if (!active) return;
        await renderAsync(buffer, container, undefined, {
          className: "docx-preview-page",
          inWrapper: true,
          breakPages: true,
          ignoreWidth: false,
          ignoreHeight: false,
        });
      })
      .catch(() => active && setError("Không thể đọc nội dung file DOCX này."));

    return () => {
      active = false;
      container.replaceChildren();
    };
  }, [file]);

  return (
    <Box sx={{ position: "relative" }}>
      {error && <Alert severity="error">{error}</Alert>}
      <Box
        ref={containerRef}
        sx={{
          height: { xs: 460, md: 600 },
          overflow: "auto",
          bgcolor: "#e5e7eb",
          py: 2,
          "& .docx-wrapper": { bgcolor: "transparent", p: 0 },
          "& .docx-wrapper > section.docx": {
            mx: "auto",
            mb: 2,
            boxShadow: "0 2px 12px rgba(0,0,0,.16)",
          },
        }}
      />
    </Box>
  );
}

function SpreadsheetPreview({ file }) {
  const [sheets, setSheets] = useState(null);
  const [activeSheet, setActiveSheet] = useState(0);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    setSheets(null);
    setActiveSheet(0);
    setError("");
    Promise.resolve()
      .then(async () => {
        const { default: readXlsxFile } = await import("read-excel-file/browser");
        const workbookSheets = await readXlsxFile(file);
        if (active) {
          setSheets(
            workbookSheets.map(({ sheet, data }) => ({
              name: sheet,
              rows: data.slice(0, 200).map((row) =>
                Array.from(row, (cell) => {
                  if (cell == null) return "";
                  if (cell instanceof Date)
                    return cell.toLocaleDateString("vi-VN");
                  if (typeof cell === "object") return JSON.stringify(cell);
                  return String(cell);
                }),
              ),
            })),
          );
        }
      })
      .catch(() => active && setError("Không thể đọc nội dung bảng tính này."));
    return () => {
      active = false;
    };
  }, [file]);

  if (error) return <Alert severity="error">{error}</Alert>;
  if (!sheets) {
    return (
      <Stack alignItems="center" sx={{ py: 8 }}>
        <CircularProgress size={30} />
      </Stack>
    );
  }

  const selectedSheet = sheets[activeSheet];
  const rows = selectedSheet?.rows || [];
  const columnCount = Math.max(1, ...rows.map((row) => row.length));
  const columns = Array.from({ length: columnCount }, (_, index) =>
    getExcelColumnName(index),
  );

  return (
    <Box>
      <Tabs
        value={activeSheet}
        onChange={(_event, value) => setActiveSheet(value)}
        variant="scrollable"
        scrollButtons="auto"
        sx={{ borderBottom: "1px solid", borderColor: "divider" }}
      >
        {sheets.map((sheet, index) => (
          <Tab key={`${sheet.name}-${index}`} label={sheet.name} />
        ))}
      </Tabs>
      <Typography variant="body2" sx={{ px: 2, py: 1 }}>
        Trang tính: <strong>{selectedSheet?.name}</strong> · {rows.length} dòng
        {rows.length >= 200 ? " (đang hiển thị tối đa 200 dòng)" : ""}
      </Typography>
      <TableContainer
        sx={{
          maxHeight: 560,
          borderTop: "1px solid",
          borderColor: "divider",
          bgcolor: "background.paper",
        }}
      >
        {rows.length ? (
          <Table
            stickyHeader
            size="small"
            sx={{
              width: "max-content",
              minWidth: "100%",
              borderCollapse: "separate",
              "& .MuiTableCell-root": {
                borderRight: "1px solid",
                borderBottom: "1px solid",
                borderColor: "divider",
                px: 1.25,
                py: 0.75,
                minWidth: 120,
                maxWidth: 280,
                whiteSpace: "pre-wrap",
                overflowWrap: "anywhere",
                overflow: "hidden",
                verticalAlign: "top",
              },
              "& tbody td": {
                position: "relative",
                zIndex: 0,
              },
            }}
          >
            <TableHead>
              <TableRow>
                <TableCell
                  sx={{
                    position: "sticky",
                    left: 0,
                    zIndex: 12,
                    minWidth: "52px !important",
                    maxWidth: "52px !important",
                    width: 52,
                    bgcolor: (theme) =>
                      `${theme.palette.mode === "dark" ? "#1e293b" : "#e5e7eb"} !important`,
                    boxShadow: "1px 0 0 0",
                    color: "divider",
                  }}
                />
                {columns.map((column) => (
                  <TableCell
                    key={column}
                    align="center"
                    sx={{
                      bgcolor: "action.selected !important",
                      fontWeight: 700,
                      color: "text.secondary",
                      zIndex: 5,
                    }}
                  >
                    {column}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((row, rowIndex) => (
                <TableRow key={rowIndex}>
                  <TableCell
                    component="th"
                    scope="row"
                    align="center"
                    sx={{
                      position: "sticky",
                      left: 0,
                      zIndex: 10,
                      minWidth: "52px !important",
                      maxWidth: "52px !important",
                      width: 52,
                      bgcolor: (theme) =>
                        theme.palette.mode === "dark" ? "#1e293b" : "#e5e7eb",
                      color: "text.secondary",
                      fontWeight: 700,
                      boxShadow: "1px 0 0 0",
                      borderRightColor: "divider",
                    }}
                  >
                    {rowIndex + 1}
                  </TableCell>
                  {columns.map((_column, cellIndex) => (
                    <TableCell
                      key={cellIndex}
                      sx={{
                        bgcolor:
                          rowIndex === 0 ? "action.hover" : "background.paper",
                        fontWeight: rowIndex === 0 ? 700 : 400,
                      }}
                    >
                      {row[cellIndex] ?? ""}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <Typography color="text.secondary" textAlign="center" sx={{ py: 6 }}>
            Trang tính này không có dữ liệu.
          </Typography>
        )}
      </TableContainer>
    </Box>
  );
}

export default function FilePreview({ file }) {
  const [objectUrl, setObjectUrl] = useState("");
  const extension = useMemo(
    () => file?.name.split(".").pop()?.toLowerCase() || "",
    [file],
  );

  useEffect(() => {
    if (!file || extension !== "pdf") {
      setObjectUrl("");
      return undefined;
    }
    const nextUrl = URL.createObjectURL(file);
    setObjectUrl(nextUrl);
    return () => URL.revokeObjectURL(nextUrl);
  }, [extension, file]);

  if (!file) return null;

  let content;
  if (extension === "pdf" && objectUrl) {
    content = (
      <Box
        component="iframe"
        title={`Xem trước ${file.name}`}
        src={objectUrl}
        sx={{ display: "block", width: "100%", height: { xs: 460, md: 600 }, border: 0 }}
      />
    );
  } else if (extension === "docx") {
    content = <DocxPreview file={file} />;
  } else if (extension === "xlsx") {
    content = <SpreadsheetPreview file={file} />;
  } else {
    content = (
      <Stack alignItems="center" textAlign="center" sx={{ px: 3, py: 6 }}>
        <DescriptionOutlined color="primary" sx={{ fontSize: 56, mb: 1 }} />
        <Typography fontWeight={700}>{file.name}</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          {extension === "doc"
            ? "Định dạng DOC cũ chưa thể xem trực tiếp. Hãy lưu thành DOCX để preview."
            : extension === "xls"
              ? "Định dạng XLS cũ chưa thể xem trực tiếp. Hãy lưu thành XLSX để preview."
              : "PPT/PPTX cần được chuyển đổi ở backend hoặc có URL công khai để preview."}
        </Typography>
      </Stack>
    );
  }

  return (
    <Paper variant="outlined" sx={{ borderRadius: 3, overflow: "hidden" }}>
      <Stack
        direction={{ xs: "column", sm: "row" }}
        alignItems={{ xs: "flex-start", sm: "center" }}
        justifyContent="space-between"
        gap={1}
        sx={{ px: 2.5, py: 2 }}
      >
        <Stack direction="row" alignItems="center" gap={1} minWidth={0}>
          <VisibilityOutlined color="primary" />
          <Box minWidth={0}>
            <Typography fontWeight={750}>Xem trước tài liệu</Typography>
            <Typography variant="body2" color="text.secondary" noWrap>
              {file.name}
            </Typography>
          </Box>
        </Stack>
        <Chip size="small" label={`${extension.toUpperCase()} · ${formatFileSize(file.size)}`} />
      </Stack>
      <Box sx={{ borderTop: "1px solid", borderColor: "divider" }}>{content}</Box>
    </Paper>
  );
}
