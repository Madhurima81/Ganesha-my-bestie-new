// lib/config/ZoneThemes.js
// Zone-specific color themes and styling configurations

export const ZONE_THEMES = {
  'symbol-mountain': {
    // Menu Background - Bright Golden Yellow
    menuBg: 'linear-gradient(135deg, rgba(255, 250, 237, 0.95), rgba(255, 243, 200, 0.95))',
    menuBorder: '#F4C430',
    menuBorderWidth: '3px',

    // Text Colors
    textPrimary: '#6B5416',      // Deep golden brown
    textSecondary: '#8B7134',    // Medium golden brown
    textLabel: '#6B5416',

    // Header
    headerBg: 'linear-gradient(135deg, rgba(255, 243, 200, 0.98), rgba(244, 196, 48, 0.98))',
    headerText: '#6B5416',
    headerBorder: '#F4C430',
    headerGlow: '0 0 20px rgba(244, 196, 48, 0.5), 0 4px 0 rgba(255, 255, 255, 0.3)',

    // Accents & Highlights
    accentColor: '#F4C430',      // Saffron gold (bright)
    glowColor: 'rgba(244, 196, 48, 0.3)',
    badgeBg: '#F4C430',
    badgeText: '#6B5416',

    // Blur Effect
    blur: 'blur(8px)',           // Soft matte blur

    // Button States
    buttonBg: '#FFFFFF',
    buttonBorder: 'transparent',
    buttonHoverBg: '#FFFAED',
    buttonHoverBorder: '#F4C430',
    buttonActiveBg: 'linear-gradient(135deg, #F4C430, #E5B026)',
    buttonModalOpeningBg: 'linear-gradient(180deg, #c89b5d 0%, #a9783f 100%)',
    buttonModalClosingBg: 'linear-gradient(180deg, #d2ae77 0%, #b88a56 100%)',

    // Divider
    dividerColor: 'rgba(107, 84, 22, 0.2)',
    dividerStyle: 'solid',       // Stone dots

    // Parent Button
    parentBg: '#FFF3C8',
    parentHoverBg: '#FFEAA5',
    parentBorder: '#F4C430',

    // Help Menu
    helpBg: 'linear-gradient(135deg, #FFFAED 0%, #FFF3C8 100%)',
    helpCardBg: '#FFFFFF',
    helpCardBorder: '#F4C430',
    helpHintIconBg: 'linear-gradient(135deg, #FFFAED, #FFF3C8)',

    // Button shades (for PrimaryBtn CSS vars)
    btnTop: '#FFDA5A',
    btnBase: '#F4C430',
    btnShadow: '#B8920A',
    btnGlow: 'rgba(244, 196, 48, 0.28)',

    // Font
    fontFamily: '"Baloo 2", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    fontFamilyBody: '"Nunito", sans-serif'
  },

  'cave-of-secrets': {
    // Menu Background - Amber Fire-lit
    menuBg: 'linear-gradient(135deg, rgba(255, 245, 236, 0.95), rgba(255, 228, 206, 0.95))',
    menuBorder: '#C85A2E',
    menuBorderWidth: '3px',

    textPrimary: '#6B2F1A',      // Deep rust brown
    textSecondary: '#8B4A35',    // Medium rust
    textLabel: '#6B2F1A',

    headerBg: 'linear-gradient(135deg, rgba(255, 228, 206, 0.98), rgba(200, 90, 46, 0.98))',
    headerText: '#6B2F1A',
    headerBorder: '#C85A2E',
    headerGlow: '0 0 20px rgba(200, 90, 46, 0.5), 0 4px 0 rgba(255, 255, 255, 0.3)',

    accentColor: '#C85A2E',      // Burnt rust/amber
    glowColor: 'rgba(200, 90, 46, 0.3)',
    badgeBg: '#C85A2E',
    badgeText: '#FFFFFF',

    blur: 'blur(8px)',           // Soft blur

    buttonBg: '#FFFFFF',
    buttonBorder: 'transparent',
    buttonHoverBg: '#FFF5EC',
    buttonHoverBorder: '#C85A2E',
    buttonActiveBg: 'linear-gradient(135deg, #C85A2E, #B44C20)',
    buttonModalOpeningBg: 'linear-gradient(180deg, #8d7ae6 0%, #6f5fd1 100%)',
    buttonModalClosingBg: 'linear-gradient(180deg, #9c8be9 0%, #8375d9 100%)',

    dividerColor: 'rgba(107, 47, 26, 0.2)',
    dividerStyle: 'solid',       // Carved line

    parentBg: '#FFE4CE',
    parentHoverBg: '#FFD4AE',
    parentBorder: '#C85A2E',

    helpBg: 'linear-gradient(135deg, #FFF5EC 0%, #FFE4CE 100%)',
    helpCardBg: '#FFFFFF',
    helpCardBorder: '#C85A2E',
    helpHintIconBg: 'linear-gradient(135deg, #FFF5EC, #FFE4CE)',

    // Button shades (for PrimaryBtn CSS vars)
    btnTop: '#E07045',
    btnBase: '#C85A2E',
    btnShadow: '#8B2E0A',
    btnGlow: 'rgba(200, 90, 46, 0.28)',

    fontFamily: '"Baloo 2", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    fontFamilyBody: '"Nunito", sans-serif'
  },

  'festival-square': {
    // Menu Background - Marigold/Saffron
    menuBg: 'linear-gradient(135deg, rgba(255, 248, 237, 0.95), rgba(255, 232, 206, 0.95))',
    menuBorder: '#E67E22',
    menuBorderWidth: '3px',

    textPrimary: '#8B4513',      // Deep warm brown
    textSecondary: '#A0522D',    // Sienna
    textLabel: '#8B4513',

    headerBg: 'linear-gradient(135deg, rgba(255, 232, 206, 0.98), rgba(230, 126, 34, 0.98))',
    headerText: '#8B4513',
    headerBorder: '#E67E22',
    headerGlow: '0 0 20px rgba(230, 126, 34, 0.5), 0 4px 0 rgba(255, 255, 255, 0.3)',

    accentColor: '#E67E22',      // Marigold orange
    glowColor: 'rgba(230, 126, 34, 0.3)',
    badgeBg: '#E67E22',
    badgeText: '#FFFFFF',

    blur: 'blur(8px)',           // Soft blur

    buttonBg: '#FFFFFF',
    buttonBorder: 'transparent',
    buttonHoverBg: '#FFF8ED',
    buttonHoverBorder: '#E67E22',
    buttonActiveBg: 'linear-gradient(135deg, #E67E22, #D97016)',
    buttonModalOpeningBg: 'linear-gradient(180deg, #f2b85d 0%, #e08b4f 100%)',
    buttonModalClosingBg: 'linear-gradient(180deg, #f4c57b 0%, #e7a06e 100%)',

    dividerColor: 'rgba(139, 69, 19, 0.2)',
    dividerStyle: 'solid',       // Garland dots

    parentBg: '#FFE8CE',
    parentHoverBg: '#FFD9B4',
    parentBorder: '#E67E22',

    helpBg: 'linear-gradient(135deg, #FFF8ED 0%, #FFE8CE 100%)',
    helpCardBg: '#FFFFFF',
    helpCardBorder: '#E67E22',
    helpHintIconBg: 'linear-gradient(135deg, #FFF8ED, #FFE8CE)',

    // Button shades (for PrimaryBtn CSS vars)
    btnTop: '#F4962A',
    btnBase: '#E67E22',
    btnShadow: '#A84E00',
    btnGlow: 'rgba(230, 126, 34, 0.28)',

    fontFamily: '"Baloo 2", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    fontFamilyBody: '"Nunito", sans-serif'
  },

  'shloka-river': {
    // Menu Background - Soft Aqua Sage
    menuBg: 'linear-gradient(135deg, rgba(240, 248, 247, 0.95), rgba(212, 232, 227, 0.95))',
    menuBorder: '#4A9B87',
    menuBorderWidth: '3px',

    textPrimary: '#1B4D3E',      // Deep forest teal
    textSecondary: '#2D6B5A',    // Medium sage
    textLabel: '#1B4D3E',

    headerBg: 'linear-gradient(135deg, rgba(212, 232, 227, 0.98), rgba(74, 155, 135, 0.98))',
    headerText: '#1B4D3E',
    headerBorder: '#4A9B87',
    headerGlow: '0 0 20px rgba(74, 155, 135, 0.5), 0 4px 0 rgba(255, 255, 255, 0.3)',

    accentColor: '#4A9B87',      // Sage-water blend
    glowColor: 'rgba(74, 155, 135, 0.3)',
    badgeBg: '#4A9B87',
    badgeText: '#FFFFFF',

    blur: 'blur(8px)',           // Soft watery blur

    buttonBg: '#FFFFFF',
    buttonBorder: 'transparent',
    buttonHoverBg: '#F0F8F7',
    buttonHoverBorder: '#4A9B87',
    buttonActiveBg: 'linear-gradient(135deg, #4A9B87, #3A8170)',
    buttonModalOpeningBg: 'linear-gradient(180deg, #63c7bb 0%, #4da89d 100%)',
    buttonModalClosingBg: 'linear-gradient(180deg, #7bcfc5 0%, #65b8ae 100%)',

    dividerColor: 'rgba(27, 77, 62, 0.2)',
    dividerStyle: 'solid',       // Wave/ripple dots

    parentBg: '#D4E8E3',
    parentHoverBg: '#BEDDD7',
    parentBorder: '#4A9B87',

    helpBg: 'linear-gradient(135deg, #F0F8F7 0%, #D4E8E3 100%)',
    helpCardBg: '#FFFFFF',
    helpCardBorder: '#4A9B87',
    helpHintIconBg: 'linear-gradient(135deg, #F0F8F7, #D4E8E3)',

    // Button shades (for PrimaryBtn CSS vars)
    btnTop: '#5FBEA8',
    btnBase: '#4A9B87',
    btnShadow: '#1A6B5A',
    btnGlow: 'rgba(74, 155, 135, 0.28)',

    fontFamily: '"Baloo 2", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    fontFamilyBody: '"Nunito", sans-serif'
  },

  'about-me-hut': {
    // Menu Background - Warm Clay Home
    menuBg: 'linear-gradient(135deg, rgba(255, 249, 240, 0.95), rgba(255, 235, 214, 0.95))',
    menuBorder: '#D89566',
    menuBorderWidth: '3px',

    textPrimary: '#7D4520',      // Deep warm brown
    textSecondary: '#A06542',    // Medium clay brown
    textLabel: '#7D4520',

    headerBg: 'linear-gradient(135deg, rgba(255, 235, 214, 0.98), rgba(216, 149, 102, 0.98))',
    headerText: '#7D4520',
    headerBorder: '#D89566',
    headerGlow: '0 0 20px rgba(216, 149, 102, 0.5), 0 4px 0 rgba(255, 255, 255, 0.3)',

    accentColor: '#D89566',      // Warm clay/ochre
    glowColor: 'rgba(216, 149, 102, 0.3)',
    badgeBg: '#D89566',
    badgeText: '#FFFFFF',

    blur: 'blur(8px)',

    buttonBg: '#FFFFFF',
    buttonBorder: 'transparent',
    buttonHoverBg: '#FFF9F0',
    buttonHoverBorder: '#D89566',
    buttonActiveBg: 'linear-gradient(135deg, #D89566, #C98556)',
    buttonModalOpeningBg: 'linear-gradient(180deg, #d99a65 0%, #c9824c 100%)',
    buttonModalClosingBg: 'linear-gradient(180deg, #e3ad82 0%, #d79a6d 100%)',

    dividerColor: 'rgba(125, 69, 32, 0.2)',
    dividerStyle: 'solid',

    parentBg: '#FFEBD6',
    parentHoverBg: '#FFE0C2',
    parentBorder: '#D89566',

    helpBg: 'linear-gradient(135deg, #FFF9F0 0%, #FFEBD6 100%)',
    helpCardBg: '#FFFFFF',
    helpCardBorder: '#D89566',
    helpHintIconBg: 'linear-gradient(135deg, #FFF9F0, #FFEBD6)',

    // Button shades (for PrimaryBtn CSS vars)
    btnTop: '#E8AA7A',
    btnBase: '#D89566',
    btnShadow: '#9A5A20',
    btnGlow: 'rgba(216, 149, 102, 0.28)',

    fontFamily: '"Baloo 2", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    fontFamilyBody: '"Nunito", sans-serif'
  }
};

// Helper function to get theme for current zone
export const getZoneTheme = (zoneId) => {
  return ZONE_THEMES[zoneId] || ZONE_THEMES['symbol-mountain']; // Default fallback
};

// Helper to map a zone theme to ProfilePillBtn CSS variables
export const getProfilePillBtnStyle = (zoneId, overrides = {}) => {
  const theme = getZoneTheme(zoneId);

  return {
    '--profile-btn-top': overrides.top || theme.btnTop,
    '--profile-btn-base': overrides.base || theme.btnBase || theme.accentColor,
    '--profile-btn-shadow': overrides.shadow || theme.btnShadow,
    '--profile-btn-glow': overrides.glow || theme.btnGlow || theme.glowColor,
  };
};

// Helper to apply theme as CSS variables
export const applyThemeVariables = (zoneId) => {
  const theme = getZoneTheme(zoneId);
  const root = document.documentElement;
  
  Object.entries(theme).forEach(([key, value]) => {
    // Convert camelCase to kebab-case for CSS variables
    const cssVar = `--zone-${key.replace(/([A-Z])/g, '-$1').toLowerCase()}`;
    root.style.setProperty(cssVar, value);
  });
};
