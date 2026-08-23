import { Box, IconButton, Typography } from "@mui/material";
import MenuRounded from "@mui/icons-material/MenuRounded";
import { useColorMode } from "../../App.jsx";
import NotificationBell from "../../pages/User/Notifications/components/NotificationBell.jsx";
import ColorModeToggle from "../ColorModeToggle/ColorModeToggle.jsx";
import { APP_HEADER_HEIGHT, isActivePath } from "./navigation.js";

export default function AppHeader({ navigation, pathname, onOpenMobile }) {
  const { mode } = useColorMode();
  const pageTitle =
    navigation.find((item) => isActivePath(pathname, item.path))?.label ||
    "DocuMind";

  return (
    <Box
      component="header"
      sx={{
        position: "sticky",
        top: 0,
        zIndex: 1100,
        px: { xs: 2, sm: 3, lg: 4 },
        py: 2,
        minHeight: APP_HEADER_HEIGHT,
        boxSizing: "border-box",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        bgcolor:
          mode === "dark" ? "rgba(11,15,26,.88)" : "rgba(255,255,255,.88)",
        backdropFilter: "blur(16px)",
        borderBottom: "1px solid",
        borderColor: "divider",
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
        <IconButton
          onClick={onOpenMobile}
          sx={{ display: { md: "none" } }}
        >
          <MenuRounded />
        </IconButton>
        <Box>
          <Typography sx={{ fontWeight: 700, fontSize: "1rem" }}>
            {pageTitle}
          </Typography>
          <Typography sx={{ fontSize: "0.68rem", color: "text.secondary" }}>
            {new Date().toLocaleDateString("vi-VN", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </Typography>
        </Box>
      </Box>

      <Box
        sx={{ display: "flex", alignItems: "center", gap: 1, position: "relative" }}
      >
        <ColorModeToggle />
        <NotificationBell />
      </Box>
    </Box>
  );
}
