import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Box, Drawer } from "@mui/material";
import { useAuth } from "../../features/auth/AuthProvider.jsx";
import AppHeader from "./AppHeader.jsx";
import AppSidebar from "./AppSidebar.jsx";
import useSidebarSubscription from "./hooks/useSidebarSubscription.js";
import {
  COLLAPSED_DRAWER_WIDTH,
  DRAWER_WIDTH,
  getRoleConfig,
} from "./navigation.js";

function getInitialCollapsedState() {
  try {
    return localStorage.getItem("app_sidebar_collapsed") === "true";
  } catch {
    return false;
  }
}

export default function AppShell({ children, role = "USER" }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(
    getInitialCollapsedState,
  );
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const normalizedRole = role || "USER";
  const { navigation } = getRoleConfig(normalizedRole);
  const subscription = useSidebarSubscription({
    enabled: normalizedRole === "USER",
    pathname: location.pathname,
    userId: user?.id,
  });

  async function handleLogout() {
    await logout();
    navigate("/login", { replace: true });
  }

  function toggleSidebar() {
    setSidebarCollapsed((current) => {
      const next = !current;

      try {
        localStorage.setItem("app_sidebar_collapsed", String(next));
      } catch {
        // The sidebar can still work when browser storage is unavailable.
      }

      return next;
    });
  }

  const sidebarProps = {
    role: normalizedRole,
    navigation,
    pathname: location.pathname,
    user,
    subscription,
    onNavigate: () => setMobileOpen(false),
    onLogout: handleLogout,
  };
  const desktopSidebarWidth = sidebarCollapsed
    ? COLLAPSED_DRAWER_WIDTH
    : DRAWER_WIDTH;

  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      <Box
        component="aside"
        sx={{
          display: { xs: "none", md: "block" },
          position: "fixed",
          inset: "0 auto 0 0",
          zIndex: 1200,
          width: desktopSidebarWidth,
          flexShrink: 0,
          transition: "width 0.22s ease",
        }}
      >
        <AppSidebar
          {...sidebarProps}
          collapsed={sidebarCollapsed}
          onToggle={toggleSidebar}
        />
      </Box>

      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: "block", md: "none" },
          "& .MuiDrawer-paper": { width: DRAWER_WIDTH },
        }}
      >
        <AppSidebar {...sidebarProps} />
      </Drawer>

      <Box
        component="main"
        sx={{
          flex: 1,
          ml: { md: `${desktopSidebarWidth}px` },
          display: "flex",
          flexDirection: "column",
          minHeight: "100vh",
          backgroundColor: "background.default",
          transition: "margin-left 0.22s ease",
        }}
      >
        <AppHeader
          navigation={navigation}
          pathname={location.pathname}
          onOpenMobile={() => setMobileOpen(true)}
        />

        <Box
          sx={{
            flex: 1,
            p: { xs: 2, sm: 3, lg: 4 },
            width: "100%",
            maxWidth: 1600,
            mx: "auto",
          }}
        >
          {children}
        </Box>
      </Box>
    </Box>
  );
}
