import { useMemo, useState } from "react";
import {
  Box,
  Button,
  Chip,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import ArrowForwardRounded from "@mui/icons-material/ArrowForwardRounded";
import AutoAwesomeRounded from "@mui/icons-material/AutoAwesomeRounded";
import CheckBoxOutlineBlankRounded from "@mui/icons-material/CheckBoxOutlineBlankRounded";
import CheckBoxRounded from "@mui/icons-material/CheckBoxRounded";
import DescriptionOutlined from "@mui/icons-material/DescriptionOutlined";
import { MAX_LIBRARY_DOCUMENTS } from "../../../../api/chat.constants.js";
import {
  getChatSourceDocumentId,
  getChatSourceSnippetPresentation,
} from "../chatSource.model.js";

const QUICK_PROMPTS = [
  "Tóm tắt chi tiết nội dung các tài liệu đã chọn",
  "So sánh sự khác nhau giữa các tài liệu này",
  "Trích xuất các câu hỏi ôn tập và đáp án trọng tâm",
  "Giải thích cụ thể các bước thực hành trong file",
];

function getSuggestedDocuments(sources) {
  const documentsById = new Map();

  sources.forEach((source) => {
    const id = getChatSourceDocumentId(source);
    if (!id || documentsById.has(id)) return;

    documentsById.set(id, {
      id,
      title:
        typeof source?.title === "string" && source.title.trim()
          ? source.title.trim()
          : "Tài liệu",
      snippet: getChatSourceSnippetPresentation(source?.snippet).text,
    });
  });

  return [...documentsById.values()].slice(0, MAX_LIBRARY_DOCUMENTS);
}

export default function SuggestedSourcesAction({
  sources = [],
  disabled = false,
  onApplyDeepDive,
  onAskDeepDive,
}) {
  const documents = useMemo(() => getSuggestedDocuments(sources), [sources]);
  const [selectedIds, setSelectedIds] = useState(() =>
    documents.map((document) => document.id),
  );

  if (documents.length === 0) return null;

  const selectedDocuments = documents.filter((document) =>
    selectedIds.includes(document.id),
  );
  const allSelected = selectedIds.length === documents.length;

  function toggleDocument(documentId) {
    setSelectedIds((current) =>
      current.includes(documentId)
        ? current.filter((id) => id !== documentId)
        : [...current, documentId],
    );
  }

  function toggleAll() {
    setSelectedIds(allSelected ? [] : documents.map((document) => document.id));
  }

  return (
    <Paper
      variant="outlined"
      sx={{
        width: "100%",
        mt: 0.75,
        p: 1.5,
        borderRadius: 2.5,
        bgcolor: "background.paper",
      }}
    >
      <Stack spacing={1.25}>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          sx={{
            alignItems: { xs: "flex-start", sm: "center" },
            justifyContent: "space-between",
            gap: 0.75,
          }}
        >
          <Stack direction="row" spacing={0.75} sx={{ alignItems: "center" }}>
            <AutoAwesomeRounded sx={{ fontSize: 17, color: "warning.main" }} />
            <Typography variant="caption" sx={{ fontWeight: 800 }}>
              Tài liệu tìm thấy — chọn file để hỏi sâu
            </Typography>
            <Chip label={documents.length} size="small" sx={{ height: 20 }} />
          </Stack>
          <Button
            type="button"
            size="small"
            onClick={toggleAll}
            disabled={disabled}
            sx={{ minWidth: 0, px: 0.5, fontSize: "0.72rem" }}
          >
            {allSelected ? "Bỏ chọn tất cả" : "Chọn tất cả"}
          </Button>
        </Stack>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", sm: "repeat(2, minmax(0, 1fr))" },
            gap: 1,
          }}
        >
          {documents.map((document) => {
            const selected = selectedIds.includes(document.id);

            return (
              <Paper
                key={document.id}
                component="button"
                type="button"
                variant="outlined"
                disabled={disabled}
                aria-pressed={selected}
                onClick={() => toggleDocument(document.id)}
                sx={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 0.75,
                  width: "100%",
                  minWidth: 0,
                  p: 1,
                  borderRadius: 2,
                  borderColor: selected ? "primary.main" : "divider",
                  bgcolor: selected ? "action.selected" : "background.paper",
                  color: "text.primary",
                  textAlign: "left",
                  cursor: disabled ? "default" : "pointer",
                  opacity: selected ? 1 : 0.68,
                  font: "inherit",
                  "&:hover": disabled
                    ? undefined
                    : { borderColor: "primary.main", bgcolor: "action.hover" },
                  "&:focus-visible": {
                    outline: "2px solid",
                    outlineColor: "primary.main",
                    outlineOffset: 2,
                  },
                }}
              >
                {selected ? (
                  <CheckBoxRounded
                    aria-hidden="true"
                    sx={{ mt: 0.1, fontSize: 20, color: "primary.main" }}
                  />
                ) : (
                  <CheckBoxOutlineBlankRounded
                    aria-hidden="true"
                    sx={{ mt: 0.1, fontSize: 20, color: "text.secondary" }}
                  />
                )}
                <Box sx={{ minWidth: 0, flex: 1 }}>
                  <Stack direction="row" spacing={0.5} sx={{ alignItems: "center" }}>
                    <DescriptionOutlined
                      sx={{ fontSize: 15, color: "text.secondary", flexShrink: 0 }}
                    />
                    <Typography
                      variant="caption"
                      title={document.title}
                      sx={{
                        minWidth: 0,
                        fontWeight: 750,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {document.title}
                    </Typography>
                  </Stack>
                  {document.snippet && (
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{
                        display: "-webkit-box",
                        mt: 0.25,
                        overflow: "hidden",
                        WebkitBoxOrient: "vertical",
                        WebkitLineClamp: 1,
                        lineHeight: 1.45,
                      }}
                    >
                      {document.snippet}
                    </Typography>
                  )}
                </Box>
              </Paper>
            );
          })}
        </Box>

        <Stack
          direction={{ xs: "column", sm: "row" }}
          sx={{ alignItems: { xs: "stretch", sm: "center" }, gap: 1 }}
        >
          <Button
            type="button"
            size="small"
            variant="contained"
            disabled={disabled || selectedDocuments.length === 0}
            onClick={() => onApplyDeepDive(selectedDocuments)}
            sx={{ flexShrink: 0 }}
          >
            Hỏi sâu với {selectedDocuments.length} tài liệu
          </Button>
          <Typography variant="caption" color="text.secondary">
            Áp dụng phạm vi rồi tự nhập câu hỏi, hoặc chọn gợi ý nhanh bên dưới.
          </Typography>
        </Stack>

        <Box sx={{ pt: 1, borderTop: "1px solid", borderColor: "divider" }}>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ display: "block", mb: 0.75, fontWeight: 650 }}
          >
            Gợi ý câu hỏi đào sâu nhanh
          </Typography>
          <Stack direction="row" sx={{ flexWrap: "wrap", gap: 0.75 }}>
            {QUICK_PROMPTS.map((prompt) => (
              <Button
                key={prompt}
                type="button"
                size="small"
                variant="outlined"
                endIcon={<ArrowForwardRounded sx={{ fontSize: 14 }} />}
                disabled={disabled || selectedDocuments.length === 0}
                onClick={() => onAskDeepDive(selectedDocuments, prompt)}
                sx={{
                  borderRadius: 4,
                  color: "text.secondary",
                  borderColor: "divider",
                  fontSize: "0.75rem",
                  lineHeight: 1.3,
                  textAlign: "left",
                  whiteSpace: "normal",
                }}
              >
                {prompt}
              </Button>
            ))}
          </Stack>
        </Box>
      </Stack>
    </Paper>
  );
}
