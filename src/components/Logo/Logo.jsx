import { Box, Typography } from "@mui/material";

const LOGO_COLORS = {
  primary: "#6366f1",
  admin: "#f97316",
};

function LogoMark({ size = 36, color = LOGO_COLORS.primary, sx = {} }) {
  return (
    <Box
      sx={{
        width: size,
        height: size,
        borderRadius: "10px",
        background: `linear-gradient(135deg, ${color} 0%, ${color}cc)`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#fff",
        fontWeight: 800,
        fontSize: size * 0.5,
        fontFamily: '"Plus Jakarta Sans", sans-serif',
        boxShadow: `0 4px 14px ${color}30`,
        flexShrink: 0,
        ...sx,
      }}
    >
      D
    </Box>
  );
}

function LogoText({ variant = "default", color = "inherit" }) {
  const styles = {
    default: {
      name: {
        fontWeight: 800,
        lineHeight: 1.1,
        fontSize: "1.1rem",
        letterSpacing: "-0.01em",
        color,
      },
      tag: {
        color: "text.secondary",
        fontSize: "0.65rem",
        fontWeight: 500,
      },
    },
    header: {
      name: {
        fontWeight: 800,
        lineHeight: 1,
        fontSize: "1rem",
        letterSpacing: "-0.02em",
        color,
      },
      tag: {
        color: "text.secondary",
        fontSize: "0.6rem",
        fontWeight: 500,
        letterSpacing: "0.03em",
      },
    },
    auth: {
      name: {
        fontWeight: 800,
        fontSize: "1.25rem",
        letterSpacing: "-0.02em",
        color,
      },
      tag: {
        color: "text.secondary",
        fontSize: "0.65rem",
        fontWeight: 500,
      },
    },
    authPanel: {
      name: {
        fontWeight: 800,
        fontSize: "1.5rem",
        letterSpacing: "-0.02em",
        color,
      },
      tag: {
        color: "text.secondary",
        fontSize: "0.7rem",
        fontWeight: 500,
        letterSpacing: "0.02em",
      },
    },
  };

  const s = styles[variant] || styles.default;

  return (
    <Box sx={{ display: "flex", flexDirection: "column" }}>
      <Typography sx={s.name}>DocuMind</Typography>
      <Typography sx={s.tag}>AI study workspace</Typography>
    </Box>
  );
}

export default function Logo({
  variant = "default",
  showText = true,
  size,
  color,
  sx = {},
}) {
  const resolvedColor = color || LOGO_COLORS.primary;

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 1.5,
        ...sx,
      }}
    >
      <LogoMark size={size} color={resolvedColor} />
      {showText && (
        <LogoText
          variant={variant}
          color={variant === "authPanel" ? "#fff" : "inherit"}
        />
      )}
    </Box>
  );
}

export { LogoMark, LogoText };
