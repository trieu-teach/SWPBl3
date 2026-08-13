import { useState, useCallback } from "react";
import { Tooltip } from "@mui/material";
import { LightMode, DarkMode } from "@mui/icons-material";
import { useColorMode } from "../../App.jsx";
import "./ColorModeToggle.css";

export default function ColorModeToggle() {
  const { mode, toggle } = useColorMode();
  const [bumpKey, setBumpKey] = useState(0);

  const handleClick = useCallback(
    (e) => {
      e.preventDefault();
      e.stopPropagation();
      toggle();
      setBumpKey((k) => k + 1);
    },
    [toggle]
  );

  const isDark = mode === "dark";
  const label = isDark ? "Chuyển sang nền sáng" : "Chuyển sang nền tối";

  return (
    <Tooltip title={label}>
      <button
        type="button"
        onClick={handleClick}
        aria-label={label}
        aria-pressed={isDark}
        key={bumpKey}
        className="theme-toggle-btn"
      >
        <span className="theme-toggle-icon" aria-hidden>
          {isDark ? <LightMode /> : <DarkMode />}
        </span>
      </button>
    </Tooltip>
  );
}
