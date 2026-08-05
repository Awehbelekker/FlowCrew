/**
 * FlowCrew Design System
 * A modern, consistent design system inspired by FlowCrew's UI
 */

// COLORS
export const Colors = {
  // Brand Colors
  brand: {
    green: '#7ED321',
    teal: '#00D4AA',
    blue: '#2196F3',
    gradient: 'linear-gradient(135deg, #7ED321 0%, #00D4AA 50%, #2196F3 100%)',
  },

  // UI Colors
  ui: {
    background: '#FFFFFF',
    card: '#FFFFFF',
    lightBg: '#F8FAFB',
    border: '#F0F0F0',
  },

  // Text Colors
  text: {
    primary: '#1E2A39',
    secondary: '#6D7A8C',
    tertiary: '#A0A9B8',
    inverse: '#FFFFFF',
  },

  // Status Colors
  status: {
    available: '#7ED321',
    unavailable: '#6D7A8C',
    success: '#7ED321',
    warning: '#FFB800',
    error: '#FF5247',
    info: '#2196F3',
  },

  // Activity Colors
  activity: {
    surfing: '#2196F3',
    sailing: '#3F51B5',
    kitesurfing: '#7ED321',
    kayaking: '#00D4AA',
    paddleboarding: '#4CAF50',
  },
};

// TYPOGRAPHY
export const Typography = {
  // Font Family
  fontFamily: {
    base: 'System, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    // If you want to use custom fonts, add them here
  },

  // Font Sizes
  fontSize: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 30,
    '4xl': 36,
  },

  // Font Weights
  fontWeight: {
    regular: '400',
    medium: '500',
    semiBold: '600',
    bold: '700',
  },

  // Line Heights
  lineHeight: {
    tight: 1.1, // For headings
    normal: 1.3, // For most text
    relaxed: 1.5, // For paragraphs
  },

  // Letter Spacing
  letterSpacing: {
    tight: -0.5,
    normal: 0,
    wide: 0.5,
  },
};

// SPACING
export const Spacing = {
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  '3xl': 32,
  '4xl': 40,
  '5xl': 48,
  '6xl': 64,
};

// BORDER RADIUS
export const BorderRadius = {
  none: 0,
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  '2xl': 20,
  '3xl': 24,
  full: 9999,
};

// SHADOWS
export const Shadows = {
  none: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  sm: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  lg: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  xl: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 5,
  },
};

// LAYOUT
export const Layout = {
  screenPadding: Spacing.xl,
  contentMaxWidth: 1200, // For web/tablet
  breakpoints: {
    sm: 640,
    md: 768,
    lg: 1024,
    xl: 1280,
  },
};

// Z-INDEX
export const ZIndex = {
  base: 0,
  above: 1,
  dropdown: 10,
  sticky: 100,
  fixed: 200,
  modal: 300,
  tooltip: 400,
  toast: 500,
};

// ANIMATION DURATIONS
export const Animation = {
  fast: 150,
  normal: 250,
  slow: 400,
  veryFast: 100,
  verySlow: 600,
};

// ENHANCED VISUAL EFFECTS
export const VisualEffects = {
  shadows: {
    card: '0 4px 12px rgba(0,0,0,0.1)',
    button: '0 2px 8px rgba(0,0,0,0.15)',
    elevation: '0 8px 24px rgba(0,0,0,0.12)',
    glow: '0 0 20px rgba(126, 211, 33, 0.3)'
  },
  gradients: {
    primary: 'linear-gradient(135deg, #7ED321 0%, #00D4AA 50%, #2196F3 100%)',
    button: 'linear-gradient(135deg, #34C759 0%, #30D158 100%)',
    card: 'linear-gradient(135deg, #FFFFFF 0%, #F8F9FA 100%)'
  },
  animations: {
    spring: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    smooth: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
    bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)'
  }
};

// ENHANCED SPACING
export const EnhancedSpacing = {
  ...Spacing,
  // Additional precise spacing values
  cardPadding: 16,
  buttonPadding: 12,
  sectionGap: 24,
  componentGap: 8
};

// EXPORT DESIGN SYSTEM
export default {
  Colors,
  Typography,
  Spacing,
  BorderRadius,
  Shadows,
  Layout,
  ZIndex,
  Animation,
};
