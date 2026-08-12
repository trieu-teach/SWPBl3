import { Box, Chip, Stack, TextField } from "@mui/material";

export default function DocumentTagInput({
  value,
  tags,
  onChange,
  onAdd,
  onRemove,
}) {
  return (
    <Box>
      <TextField
        fullWidth
        label="Thẻ (tối đa 10)"
        value={value}
        disabled={tags.length >= 10}
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            event.preventDefault();
            onAdd();
          }
        }}
        onBlur={onAdd}
        helperText="Nhập một thẻ rồi nhấn Enter"
      />
      {tags.length > 0 && (
        <Stack direction="row" gap={1} flexWrap="wrap" sx={{ mt: 1.5 }}>
          {tags.map((tag) => (
            <Chip key={tag} label={tag} onDelete={() => onRemove(tag)} />
          ))}
        </Stack>
      )}
    </Box>
  );
}
