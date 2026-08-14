import { ArrowForward, Close, Menu as MenuIcon } from "@mui/icons-material";
import {
  AppBar,
  Box,
  Button,
  Container,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Toolbar,
  Typography,
} from "@mui/material";
import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import ColorModeToggle from "../ColorModeToggle/ColorModeToggle.jsx";
import Logo from "../Logo/Logo.jsx";
import "./Header.css";

const PUBLIC_NAV_ITEMS = [
  { id: "workflow", label: "Cách hoạt động" },
  { id: "usecases", label: "Tình huống" },
  { id: "features", label: "Tính năng" },
  { id: "pricing", label: "Gói" },
  { id: "faq", label: "Hỏi đáp" },
];

export default function Header({ scrolled = false, activeSection = "" }) {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const isHome = pathname === "/";
  const isLogin = pathname === "/login";

  const goTo = (path) => {
    setMobileOpen(false);
    navigate(path);
  };

  const action = isLogin
    ? { label: "Đăng ký", path: "/register" }
    : { label: "Đăng nhập", path: "/login" };

  return (
    <>
      <AppBar
        position={isHome ? "sticky" : "fixed"}
        elevation={0}
        className={`site-header ${scrolled ? "is-scrolled" : ""}`}
      >
        <Container maxWidth="lg">
          <Toolbar disableGutters className="public-header__toolbar">
            <Link to="/" className="public-header__brand" aria-label="DocuMind">
              <Logo size={36} variant="header" sx={{ color: "text.primary" }} />
            </Link>

            <Box component="nav" className="public-header__nav">
              {PUBLIC_NAV_ITEMS.map((item) => (
                <a
                  key={item.id}
                  href={`/#${item.id}`}
                  className={`public-header__link ${
                    isHome && activeSection === item.id ? "active" : ""
                  }`}
                >
                  {item.label}
                </a>
              ))}
            </Box>

            <Box className="public-header__actions">
              {isHome && (
                <Button
                  color="inherit"
                  className="public-header__login"
                  onClick={() => goTo("/login")}
                >
                  Đăng nhập
                </Button>
              )}

              <Button
                variant="contained"
                disableElevation
                className="public-header__cta"
                endIcon={isHome ? <ArrowForward /> : undefined}
                onClick={() => goTo(isHome ? "/register" : action.path)}
              >
                {isHome ? "Bắt đầu miễn phí" : action.label}
              </Button>

              <IconButton
                className="public-header__menu"
                onClick={() => setMobileOpen(true)}
                aria-label="Mở menu"
              >
                <MenuIcon />
              </IconButton>

              <ColorModeToggle />
            </Box>
          </Toolbar>
        </Container>
      </AppBar>

      <Drawer
        anchor="right"
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        PaperProps={{ sx: { width: 280 } }}
      >
        <Box p={2}>
          <Box className="public-header__drawer-title">
            <Typography fontWeight={700}>Menu</Typography>
            <IconButton
              onClick={() => setMobileOpen(false)}
              aria-label="Đóng menu"
            >
              <Close />
            </IconButton>
          </Box>

          <List>
            {PUBLIC_NAV_ITEMS.map((item) => (
              <ListItem key={item.id} disablePadding>
                <ListItemButton
                  component="a"
                  href={`/#${item.id}`}
                  onClick={() => setMobileOpen(false)}
                >
                  <ListItemText primary={item.label} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>

          <Divider sx={{ my: 2 }} />
          <Box className="public-header__drawer-actions">
            {isHome && (
              <Button
                variant="outlined"
                fullWidth
                onClick={() => goTo("/login")}
              >
                Đăng nhập
              </Button>
            )}
            <Button
              variant="contained"
              fullWidth
              onClick={() => goTo(isHome ? "/register" : action.path)}
            >
              {isHome ? "Bắt đầu miễn phí" : action.label}
            </Button>
          </Box>
        </Box>
      </Drawer>
    </>
  );
}
