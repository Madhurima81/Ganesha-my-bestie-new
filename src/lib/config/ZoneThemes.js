// lib/config/ZoneThemes.js
// Zone-specific color themes and styling configurations

export const ZONE_THEMES = {
  'symbol-mountain': {
    // Menu Background
    menuBg: 'linear-gradient(135deg, rgba(245, 235, 220, 0.95), rgba(238, 220, 200, 0.95))',
    menuBorder: '#D4A574',
    menuBorderWidth: '3px',
    
    // Text Colors
    textPrimary: '#5D2E0F',      // Dark brown
    textSecondary: '#8B6F47',    // Muted brown
    textLabel: '#5D2E0F',
    
    // Header
    headerBg: 'linear-gradient(135deg, rgba(255, 215, 0, 0.98), rgba(255, 165, 0, 0.98))',
    headerText: '#5D2E0F',
    headerBorder: '#FFB84D',
    headerGlow: '0 0 20px rgba(255, 184, 77, 0.5), 0 4px 0 rgba(255, 255, 255, 0.3)',
    
    // Accents & Highlights
    accentColor: '#FFB84D',      // Sand glow
    glowColor: 'rgba(255, 184, 77, 0.3)',
    badgeBg: '#FFC107',
    badgeText: '#FFFFFF',
    
    // Blur Effect
    blur: 'blur(8px)',           // Soft matte blur
    
    // Button States
    buttonBg: '#FFFFFF',
    buttonBorder: 'transparent',
    buttonHoverBg: '#FFF9E6',
    buttonHoverBorder: '#FFB84D',
    buttonActiveBg: 'linear-gradient(135deg, #FFD700, #FFA500)',
    
    // Divider
    dividerColor: 'rgba(139, 111, 71, 0.2)',
    dividerStyle: 'solid',       // Stone dots
    
    // Parent Button
    parentBg: '#FFF3E0',
    parentHoverBg: '#FFE0B2',
    parentBorder: '#FF9800',
    
    // Help Menu
    helpBg: 'linear-gradient(135deg, #FFF9E6 0%, #FFE6CC 100%)',
    helpCardBg: '#FFFFFF',
    helpCardBorder: '#FFD700',
    helpHintIconBg: 'linear-gradient(135deg, #FFF9E6, #FFE6CC)',
    
    // Font
    fontFamily: '"Baloo", cursive',
    fontFamilyBody: '"Nunito", sans-serif'
  },
  
  'cave-of-secrets': {
    menuBg: 'linear-gradient(135deg, rgba(101, 67, 33, 0.92), rgba(78, 52, 26, 0.92))',
    menuBorder: '#8B6F47',
    menuBorderWidth: '3px',
    
    textPrimary: '#FFE4C4',      // Warm charcoal (light for dark bg)
    textSecondary: '#D2B48C',    // Soft grey
    textLabel: '#FFE4C4',
    
    headerBg: 'linear-gradient(135deg, rgba(139, 90, 43, 0.98), rgba(101, 67, 33, 0.98))',
    headerText: '#FFE4C4',
    headerBorder: '#D2691E',
    headerGlow: '0 0 20px rgba(255, 140, 0, 0.5), 0 4px 0 rgba(255, 228, 196, 0.3)',
    
    accentColor: '#FF8C00',      // Amber glow
    glowColor: 'rgba(255, 140, 0, 0.4)',
    badgeBg: '#FF8C00',
    badgeText: '#FFFFFF',
    
    blur: 'blur(12px)',          // Heavier blur
    
    buttonBg: 'rgba(255, 228, 196, 0.15)',
    buttonBorder: 'transparent',
    buttonHoverBg: 'rgba(139, 111, 71, 0.3)',
    buttonHoverBorder: '#FF8C00',
    buttonActiveBg: 'linear-gradient(135deg, #FF8C00, #FF6347)',
    
    dividerColor: 'rgba(255, 228, 196, 0.2)',
    dividerStyle: 'solid',       // Carved line
    
    parentBg: 'rgba(139, 69, 19, 0.3)',
    parentHoverBg: 'rgba(160, 82, 45, 0.4)',
    parentBorder: '#D2691E',
    
    helpBg: 'linear-gradient(135deg, rgba(101, 67, 33, 0.98), rgba(78, 52, 26, 0.98))',
    helpCardBg: 'rgba(255, 228, 196, 0.1)',
    helpCardBorder: '#FF8C00',
    helpHintIconBg: 'linear-gradient(135deg, rgba(139, 90, 43, 0.4), rgba(101, 67, 33, 0.4))',
    
    fontFamily: '"Baloo", cursive',
    fontFamilyBody: '"Nunito", sans-serif'
  },
  
  'festival-square': {
    menuBg: 'linear-gradient(135deg, rgba(200, 230, 201, 0.95), rgba(165, 214, 167, 0.95))',
    menuBorder: '#66BB6A',
    menuBorderWidth: '3px',
    
    textPrimary: '#1B5E20',      // Deep green
    textSecondary: '#558B2F',    // Olive
    textLabel: '#1B5E20',
    
    headerBg: 'linear-gradient(135deg, rgba(129, 199, 132, 0.98), rgba(102, 187, 106, 0.98))',
    headerText: '#1B5E20',
    headerBorder: '#66BB6A',
    headerGlow: '0 0 20px rgba(255, 167, 38, 0.5), 0 4px 0 rgba(255, 255, 255, 0.3)',
    
    accentColor: '#FFA726',      // Marigold glow
    glowColor: 'rgba(255, 167, 38, 0.3)',
    badgeBg: '#FFA726',
    badgeText: '#FFFFFF',
    
    blur: 'blur(8px)',           // Soft blur
    
    buttonBg: '#FFFFFF',
    buttonBorder: 'transparent',
    buttonHoverBg: '#E8F5E9',
    buttonHoverBorder: '#66BB6A',
    buttonActiveBg: 'linear-gradient(135deg, #FFA726, #FF6F00)',
    
    dividerColor: 'rgba(27, 94, 32, 0.2)',
    dividerStyle: 'solid',       // Garland dots
    
    parentBg: '#FFF3E0',
    parentHoverBg: '#FFE0B2',
    parentBorder: '#FF9800',
    
    helpBg: 'linear-gradient(135deg, #E8F5E9 0%, #C8E6C9 100%)',
    helpCardBg: '#FFFFFF',
    helpCardBorder: '#66BB6A',
    helpHintIconBg: 'linear-gradient(135deg, #E8F5E9, #C8E6C9)',
    
    fontFamily: '"Baloo", cursive',
    fontFamilyBody: '"Nunito", sans-serif'
  },
  
  'shloka-river': {
    menuBg: 'linear-gradient(135deg, rgba(178, 223, 219, 0.95), rgba(128, 203, 196, 0.95))',
    menuBorder: '#4DB6AC',
    menuBorderWidth: '3px',
    
    textPrimary: '#004D40',      // Deep teal/blue-green
    textSecondary: '#00695C',    // Slate blue
    textLabel: '#004D40',
    
    headerBg: 'linear-gradient(135deg, rgba(128, 203, 196, 0.98), rgba(77, 182, 172, 0.98))',
    headerText: '#004D40',
    headerBorder: '#4DB6AC',
    headerGlow: '0 0 20px rgba(128, 203, 196, 0.6), 0 4px 0 rgba(255, 255, 255, 0.4)',
    
    accentColor: '#80CBC4',      // Pearl/water glow
    glowColor: 'rgba(128, 203, 196, 0.4)',
    badgeBg: '#80CBC4',
    badgeText: '#004D40',
    
    blur: 'blur(6px)',           // Light watery blur
    
    buttonBg: 'rgba(255, 255, 255, 0.8)',
    buttonBorder: 'transparent',
    buttonHoverBg: 'rgba(178, 223, 219, 0.5)',
    buttonHoverBorder: '#4DB6AC',
    buttonActiveBg: 'linear-gradient(135deg, #80CBC4, #4DB6AC)',
    
    dividerColor: 'rgba(0, 77, 64, 0.2)',
    dividerStyle: 'solid',       // Wave/ripple dots
    
    parentBg: '#E0F2F1',
    parentHoverBg: '#B2DFDB',
    parentBorder: '#26A69A',
    
    helpBg: 'linear-gradient(135deg, #E0F7FA 0%, #B2EBF2 100%)',
    helpCardBg: 'rgba(255, 255, 255, 0.9)',
    helpCardBorder: '#4DB6AC',
    helpHintIconBg: 'linear-gradient(135deg, #E0F7FA, #B2EBF2)',
    
    fontFamily: '"Baloo", cursive',
    fontFamilyBody: '"Nunito", sans-serif'
  },
  
  'about-me-hut': {
    menuBg: 'linear-gradient(135deg, rgba(255, 243, 224, 0.95), rgba(255, 224, 178, 0.95))',
    menuBorder: '#FFB74D',
    menuBorderWidth: '3px',
    
    textPrimary: '#BF360C',      // Deep orange-brown
    textSecondary: '#E64A19',
    textLabel: '#BF360C',
    
    headerBg: 'linear-gradient(135deg, rgba(255, 183, 77, 0.98), rgba(255, 152, 0, 0.98))',
    headerText: '#BF360C',
    headerBorder: '#FFB74D',
    headerGlow: '0 0 20px rgba(255, 152, 0, 0.5), 0 4px 0 rgba(255, 255, 255, 0.3)',
    
    accentColor: '#FF9800',
    glowColor: 'rgba(255, 152, 0, 0.3)',
    badgeBg: '#FF9800',
    badgeText: '#FFFFFF',
    
    blur: 'blur(8px)',
    
    buttonBg: '#FFFFFF',
    buttonBorder: 'transparent',
    buttonHoverBg: '#FFF3E0',
    buttonHoverBorder: '#FFB74D',
    buttonActiveBg: 'linear-gradient(135deg, #FFB74D, #FF9800)',
    
    dividerColor: 'rgba(191, 54, 12, 0.2)',
    dividerStyle: 'solid',
    
    parentBg: '#FFCCBC',
    parentHoverBg: '#FFAB91',
    parentBorder: '#FF7043',
    
    helpBg: 'linear-gradient(135deg, #FFF3E0 0%, #FFE0B2 100%)',
    helpCardBg: '#FFFFFF',
    helpCardBorder: '#FFB74D',
    helpHintIconBg: 'linear-gradient(135deg, #FFF3E0, #FFE0B2)',
    
    fontFamily: '"Baloo", cursive',
    fontFamilyBody: '"Nunito", sans-serif'
  }
};

// Helper function to get theme for current zone
export const getZoneTheme = (zoneId) => {
  return ZONE_THEMES[zoneId] || ZONE_THEMES['symbol-mountain']; // Default fallback
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