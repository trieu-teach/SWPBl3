import { Link } from "react-router-dom";
import { Box, IconButton, Tooltip, Typography } from "@mui/material";
import ChevronLeftRounded from "@mui/icons-material/ChevronLeftRounded";
import ChevronRightRounded from "@mui/icons-material/ChevronRightRounded";
import Logo from "../Logo/Logo.jsx";
import SidebarAccount from "./SidebarAccount.jsx";
import {
  APP_HEADER_HEIGHT,
  getRoleConfig,
  isActivePath,
} from "./navigation.js";

function NavigationItem({ item, active, accent, collapsed, onNavigate }) {
  const Icon = item.icon;
  const content = (
    <Box
      component={Link}
      to={item.path}
      onClick={onNavigate}
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: collapsed ? "center" : "flex-start",
        gap: collapsed ? 0 : 1.5,
        px: collapsed ? 1 : 2,
        py: 1.25,
        borderRadius: "12px",
        color: active ? accent : "text.primary",
        backgroundColor: active ? `${accent}15` : "transparent",
        fontWeight: active ? 600 : 500,
        textDecoration: "none",
        transition: "all 0.2s ease",
        "&:hover": {
          color: accent,
          backgroundColor: active ? `${accent}20` : "action.hover",
        },
      }}
    >
      <Icon sx={{ fontSize: 20, opacity: active ? 1 : 0.7 }} />
      {!collapsed && (
        <Typography
          sx={{ fontSize: "0.875rem", fontWeight: active ? 600 : 500 }}
        >
          {item.label}
        </Typography>
      )}
    </Box>
  );

  if (!collapsed) return content;

  return (
    <Tooltip title={item.label} placement="right" arrow>
      {content}
    </Tooltip>
  );
}

export default function AppSidebar({
  role,
  navigation,
  pathname,
  user,
  subscription,
  collapsed = false,
  onToggle,
  onNavigate,
  onLogout,
}) {
  const { accent, homePath, workspaceLabel, navigationLabel } =
    getRoleConfig(role);

  return (
    <Box
      sx={{
        position: "relative",
        display: "flex",
        flexDirection: "column",
        height: "100%",
        backgroundColor: "background.paper",
        borderRight: "1px solid",
        borderColor: "divider",
      }}
    >
      <Box
        component={Link}
        to={homePath}
        onClick={onNavigate}
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: collapsed ? "center" : "flex-start",
          gap: collapsed ? 0 : 1.5,
          px: collapsed ? 1 : 2.5,
          height: APP_HEADER_HEIGHT,
          boxSizing: "border-box",
          color: "inherit",
          textDecoration: "none",
          borderBottom: "1px solid",
          borderColor: "divider",
        }}
      >
        <Logo size={44} color={accent} showText={false} />
        {!collapsed && (
          <Box>
            <Typography
              sx={{
                fontSize: "1.1rem",
                fontWeight: 800,
                lineHeight: 1.1,
                letterSpacing: "-0.01em",
              }}
            >
              DocuMind
            </Typography>
            <Typography
              sx={{
                color: "text.secondary",
                fontSize: "0.7rem",
                fontWeight: 500,
              }}
            >
              {workspaceLabel}
            </Typography>
          </Box>
        )}
      </Box>

      {onToggle && (
        <Tooltip title={collapsed ? "Mở rộng sidebar" : "Thu gọn sidebar"}>
          <IconButton
            size="small"
            onClick={onToggle}
            aria-label={collapsed ? "Mở rộng sidebar" : "Thu gọn sidebar"}
            sx={{
              position: "absolute",
              top: 28,
              right: -15,
              zIndex: 2,
              width: 30,
              height: 30,
              bgcolor: "background.paper",
              border: "1px solid",
              borderColor: "divider",
              boxShadow: 2,
              "&:hover": { bgcolor: "action.hover" },
            }}
          >
            {collapsed ? <ChevronRightRounded /> : <ChevronLeftRounded />}
          </IconButton>
        </Tooltip>
      )}

      <Box
        sx={{
          flex: 1,
          px: collapsed ? 1 : 1.5,
          py: 2,
          overflowY: "auto",
        }}
      >
        {!collapsed && (
          <Typography
            sx={{
              px: 2,
              py: 1,
              color: "text.disabled",
              fontSize: "0.65rem",
              fontWeight: 700,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
            }}
          >
            {navigationLabel}
          </Typography>
        )}

        {navigation.map((item) => (
          <NavigationItem
            key={item.path}
            item={item}
            active={isActivePath(pathname, item.path)}
            accent={accent}
            collapsed={collapsed}
            onNavigate={onNavigate}
          />
        ))}
      </Box>

      <Box
        sx={{
          px: collapsed ? 1 : 1.5,
          py: 2,
          borderTop: "1px solid",
          borderColor: "divider",
        }}
      >
        <SidebarAccount
          user={user}
          role={role}
          accent={accent}
          collapsed={collapsed}
          subscription={subscription}
          onNavigate={onNavigate}
          onLogout={onLogout}
        />

        {!collapsed && (
          <Typography
            sx={{
              color: "text.disabled",
              fontSize: "0.65rem",
              textAlign: "center",
            }}
          >
            DocuMind v1.0.0
          </Typography>
        )}
      </Box>
    </Box>
  );
}
