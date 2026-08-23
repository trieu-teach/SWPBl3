import { Link } from "react-router-dom";
import { Box, IconButton, Tooltip, Typography } from "@mui/material";
import { alpha } from "@mui/material/styles";
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
  const isAiHighlight = item.highlight === "ai";
  const isSubscriptionHighlight = item.highlight === "subscription";
  const isHighlighted = isAiHighlight || isSubscriptionHighlight;

  const content = (
    <Box
      component={Link}
      to={item.path}
      onClick={onNavigate}
      sx={(theme) => {
        const highlightColor = isSubscriptionHighlight
          ? theme.palette.warning.main
          : accent;

        return {
          display: "flex",
          alignItems: "center",
          justifyContent: collapsed ? "center" : "flex-start",
          gap: collapsed ? 0 : 1.5,
          minHeight:
            isAiHighlight && !collapsed
              ? 104
              : isSubscriptionHighlight && !collapsed
                ? 72
                : 44,
          mt: isSubscriptionHighlight ? 2 : isAiHighlight ? 1 : 0,
          mb: isHighlighted ? 1 : 0,
          px: collapsed ? 1 : isHighlighted ? 2.25 : 2,
          py: isAiHighlight && !collapsed ? 2 : isHighlighted ? 1.4 : 1.25,
          border: "1px solid",
          borderColor: isHighlighted
            ? alpha(highlightColor, active ? 0.7 : 0.3)
            : "transparent",
          borderRadius: "14px",
          color: active || isHighlighted ? highlightColor : "text.primary",
          background: isHighlighted
            ? `linear-gradient(135deg, ${alpha(highlightColor, 0.16)}, ${alpha(
                highlightColor,
                0.06,
              )})`
            : active
              ? alpha(accent, 0.1)
              : "transparent",
          boxShadow:
            active && isHighlighted
              ? `0 8px 22px ${alpha(highlightColor, 0.14)}`
              : "none",
          fontWeight: active || isHighlighted ? 700 : 500,
          textDecoration: "none",
          transition:
            "color 0.2s ease, background-color 0.2s ease, border-color 0.2s ease, transform 0.2s ease, box-shadow 0.2s ease",
          "&:hover": {
            color: highlightColor,
            borderColor: isHighlighted
              ? alpha(highlightColor, 0.65)
              : "transparent",
            backgroundColor: isHighlighted
              ? alpha(highlightColor, 0.14)
              : active
                ? alpha(accent, 0.14)
                : "action.hover",
            transform: isHighlighted ? "translateY(-1px)" : "none",
          },
        };
      }}
    >
      <Box
        sx={(theme) => ({
          display: "grid",
          flexShrink: 0,
          placeItems: "center",
          width: isAiHighlight ? 44 : isHighlighted ? 38 : 20,
          height: isAiHighlight ? 44 : isHighlighted ? 38 : 20,
          borderRadius: isHighlighted ? "12px" : 0,
          bgcolor: isHighlighted
            ? alpha(
                isSubscriptionHighlight
                  ? theme.palette.warning.main
                  : accent,
                0.14,
              )
            : "transparent",
        })}
      >
        <Icon
          sx={{
            fontSize: isAiHighlight ? 26 : isHighlighted ? 22 : 20,
            opacity: active || isHighlighted ? 1 : 0.7,
          }}
        />
      </Box>
      {!collapsed && (
        <Box sx={{ minWidth: 0 }}>
          {item.eyebrow && (
            <Typography
              sx={{
                mb: isAiHighlight ? 0.75 : 0.3,
                fontSize: isAiHighlight ? "0.62rem" : "0.58rem",
                fontWeight: 800,
                lineHeight: 1,
                letterSpacing: "0.08em",
                opacity: 0.8,
              }}
            >
              {item.eyebrow}
            </Typography>
          )}
          <Typography
            sx={{
              fontSize: isAiHighlight ? "1rem" : "0.9rem",
              fontWeight: active || isHighlighted ? 700 : 500,
              lineHeight: 1.25,
            }}
          >
            {item.label}
          </Typography>
        </Box>
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
