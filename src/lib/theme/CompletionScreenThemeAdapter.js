// CompletionScreenThemeAdapter.js
// Applies zone-based CSS variables for Completion Screen

import { getZoneTheme } from "../config/ZoneThemes";

export function applyCompletionScreenTheme(zoneId) {
  const theme = getZoneTheme(zoneId);
  const root = document.documentElement;

  if (!theme) return;

  // Card (neutral base; zone only accents border/glow)
  root.style.setProperty("--cs-card-bg", "#FFF7EA");
  root.style.setProperty("--cs-card-border", theme.menuBorder);
  root.style.setProperty("--cs-card-text", "#5D2E0F");
  root.style.setProperty("--cs-card-subtext", "#6B574A");

  // Title
  root.style.setProperty("--cs-title-color", "#5D2E0F");

  // Accent / glow
  root.style.setProperty("--cs-accent", theme.accentColor);
  root.style.setProperty("--cs-accent-glow", theme.glowColor);

  // Badge glow
  root.style.setProperty("--cs-badge-glow", theme.glowColor);

  // Primary button: use deeper opening gradient for stronger white-text contrast.
  const primaryBgColor =
    theme.buttonModalOpeningBg || theme.buttonActiveBg;
  root.style.setProperty("--cs-primary-bg", primaryBgColor, "important");
  root.style.setProperty("--cs-primary-text", "#ffffff");

  // Secondary buttons
  root.style.setProperty("--cs-secondary-bg", "#FFF7EA");
  root.style.setProperty("--cs-secondary-border", theme.accentColor);
  root.style.setProperty("--cs-secondary-text", theme.textPrimary);

  // Fonts
  root.style.setProperty("--cs-font-title", theme.fontFamily);
  root.style.setProperty("--cs-font-body", theme.fontFamilyBody);
}
