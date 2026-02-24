// CompletionScreenThemeAdapter.js
// Applies zone-based CSS variables for Completion Screen

import { getZoneTheme } from "../config/ZoneThemes";

export function applyCompletionScreenTheme(zoneId) {
  const theme = getZoneTheme(zoneId);
  const root = document.documentElement;

  if (!theme) return;

  // Card
  root.style.setProperty("--cs-card-bg", theme.menuBg);
  root.style.setProperty("--cs-card-border", theme.menuBorder);
  root.style.setProperty("--cs-card-text", theme.textPrimary);
  root.style.setProperty("--cs-card-subtext", theme.textSecondary);

  // Title
  root.style.setProperty("--cs-title-color", theme.textPrimary);

  // Accent / glow
  root.style.setProperty("--cs-accent", theme.accentColor);
  root.style.setProperty("--cs-accent-glow", theme.glowColor);

  // Badge glow
  root.style.setProperty("--cs-badge-glow", theme.glowColor);

  // Primary button
  root.style.setProperty("--cs-primary-bg", theme.buttonActiveBg);
  root.style.setProperty("--cs-primary-text", "#ffffff");

  // Secondary buttons
  root.style.setProperty("--cs-secondary-bg", theme.buttonBg);
  root.style.setProperty("--cs-secondary-border", theme.accentColor);
  root.style.setProperty("--cs-secondary-text", theme.textPrimary);

  // Fonts
  root.style.setProperty("--cs-font-title", theme.fontFamily);
  root.style.setProperty("--cs-font-body", theme.fontFamilyBody);
}
