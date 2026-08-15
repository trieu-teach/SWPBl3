import { Box, Chip, Stack, Tooltip, Typography } from "@mui/material";
import AddOutlined from "@mui/icons-material/AddOutlined";
import DescriptionOutlined from "@mui/icons-material/DescriptionOutlined";

export default function ChatContextBar({
  selectedDocuments = [],
  onRemove,
  onOpenPicker,
}) {
  if (selectedDocuments.length === 0) return null;

  return (
    <Box
      sx={{
        px: { xs: 2, sm: 3 },
        py: 1.25,
        borderBottom: "1px solid",
        borderColor: "divider",
        bgcolor: "action.hover",
      }}
    >
      <Stack
        direction="row"
        alignItems="center"
        spacing={1}
        sx={{ flexWrap: "wrap", gap: 0.75 }}
      >
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ fontWeight: 600, flexShrink: 0, mr: 0.5 }}
        >
          Ngữ cảnh:
        </Typography>

        {selectedDocuments.map((doc) => (
          <Tooltip key={doc.id} title={doc.title}>
            <Chip
              icon={<DescriptionOutlined sx={{ fontSize: "0.95rem !important" }} />}
              label={doc.title}
              onDelete={() => onRemove(doc.id)}
              size="small"
              variant="outlined"
              sx={{
                maxWidth: { xs: 160, sm: 240 },
                fontWeight: 600,
                fontSize: "0.78rem",
                "& .MuiChip-label": {
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                },
              }}
            />
          </Tooltip>
        ))}

        <Tooltip title="Thêm tài liệu">
          <Chip
            icon={<AddOutlined sx={{ fontSize: "0.95rem !important" }} />}
            label="Thêm"
            onClick={onOpenPicker}
            size="small"
            variant="outlined"
            color="primary"
            clickable
            sx={{ fontWeight: 600, fontSize: "0.78rem" }}
          />
        </Tooltip>
      </Stack>
    </Box>
  );
}
