// lib/theme/RecorderThemeAdapter.js
// Maps ZoneThemes -> Recorder CSS variables

import { getZoneTheme } from "../config/ZoneThemes";

export function applyRecorderTheme(zoneId) {
  const theme = getZoneTheme(zoneId);
  if (!theme) return;

  const root = document.documentElement;

  const map = {
    "--svr-card-bg": theme.helpCardBg || "#FFF7EA",
    "--svr-border": theme.menuBorder,
    "--svr-primary": theme.accentColor,
    "--svr-primary-dark": theme.textPrimary,
    "--svr-accent": theme.accentColor,
    "--svr-accent-soft": theme.buttonHoverBg,
    "--svr-text": theme.textPrimary,
    "--svr-danger": "#E25C5C"
  };

  Object.entries(map).forEach(([key, val]) => {
    if (val) root.style.setProperty(key, val);
  });
}
