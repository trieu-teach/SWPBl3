import {
  Box,
  FormControlLabel,
  Paper,
  Radio,
  RadioGroup,
  Stack,
  Typography,
} from "@mui/material";
import { LockOutlined, PublicOutlined } from "@mui/icons-material";

const OPTIONS = [
  {
    value: "PRIVATE",
    title: "Riêng tư",
    description: "Chỉ bạn có thể sử dụng tài liệu.",
    icon: LockOutlined,
  },
  {
    value: "PUBLIC",
    title: "Công khai",
    description: "Tài liệu được gửi duyệt trước khi chia sẻ.",
    icon: PublicOutlined,
  },
];

export default function VisibilitySelector({ value, onChange }) {
  return (
    <>
      <Typography variant="h6" sx={{ fontWeight: 750, mb: 2 }}>
        Quyền riêng tư
      </Typography>
      <RadioGroup
        value={value}
        onChange={(event) => onChange(event.target.value)}
      >
        {OPTIONS.map((option, index) => {
          const Icon = option.icon;
          return (
            <Paper
              key={option.value}
              variant="outlined"
              sx={{
                p: 1.5,
                mb: index === 0 ? 1.5 : 0,
                borderColor:
                  value === option.value ? "primary.main" : "divider",
              }}
            >
              <FormControlLabel
                value={option.value}
                control={<Radio />}
                label={
                  <Box>
                    <Stack direction="row" gap={1} alignItems="center">
                      <Icon fontSize="small" />
                      <Typography sx={{ fontWeight: 700 }}>
                        {option.title}
                      </Typography>
                    </Stack>
                    <Typography variant="body2" color="text.secondary">
                      {option.description}
                    </Typography>
                  </Box>
                }
              />
            </Paper>
          );
        })}
      </RadioGroup>
    </>
  );
}
