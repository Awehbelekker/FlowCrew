/**
 * Adventure Coach App - Design System
 * Modern, cohesive design tokens for consistent UI/UX
 */

export const Colors = {
  // FlowCrew Brand Colors - Inspired by the beautiful gradient
  flowcrew: {
    gradientStart: '#7ED321', // Fresh green
    gradientMid: '#00D4AA', // Teal transition
    gradientEnd: '#2196F3', // Ocean blue
    white: '#FFFFFF',
    background: '#F8FAFB', // Light background
  },

  // Primary Brand Colors (updated with FlowCrew inspiration)
  primary: {
    50: '#E8F5E8',
    100: '#C8E6C8',
    200: '#A4D4A4',
    300: '#7ED321', // FlowCrew green
    400: '#6BC91B',
    500: '#5CB815', // Main brand green
    600: '#4FA30F',
    700: '#418B09',
    800: '#337303',
    900: '#1E4A00',
  },

  // Secondary Ocean Colors (updated with FlowCrew blue)
  ocean: {
    50: '#E3F2FD',
    100: '#BBDEFB',
    200: '#90CAF9',
    300: '#64B5F6',
    400: '#42A5F5',
    500: '#2196F3', // FlowCrew blue
    600: '#1E88E5',
    700: '#1976D2',
    800: '#1565C0',
    900: '#0D47A1',
  },

  // Adventure Activity Colors
  surfing: '#00BCD4', // Cyan
  kitesurfing: '#FF5722', // Deep Orange
  windsurfing: '#9C27B0', // Purple
  sailing: '#3F51B5', // Indigo
  paddling: '#4CAF50', // Green

  // Semantic Colors
  success: '#7ED321', // Use FlowCrew green for success
  available: '#7ED321', // Available status
  unavailable: '#757575', // Unavailable status
  warning: '#FF9800',
  error: '#F44336',
  info: '#2196F3',

  // Neutral Colors
  neutral: {
    50: '#FAFAFA',
    100: '#F5F5F5',
    200: '#EEEEEE',
    300: '#E0E0E0',
    400: '#BDBDBD',
    500: '#9E9E9E',
    600: '#757575',
    700: '#616161',
    800: '#424242',
    900: '#212121',
  },

  // Background Colors
  background: {
    primary: '#FFFFFF',
    secondary: '#F8FAFB',
    tertiary: '#F0F8FF',
    card: '#FFFFFF',
    overlay: 'rgba(0, 0, 0, 0.5)',
    gradient: 'linear-gradient(135deg, #7ED321 0%, #00D4AA 50%, #2196F3 100%)',
  },

  // Text Colors
  text: {
    primary: '#212121',
    secondary: '#757575',
    tertiary: '#9E9E9E',
    inverse: '#FFFFFF',
    link: '#2196F3',
  },
};

export const Typography = {
  // Font Families
  fontFamily: {
    primary: 'System', // Uses system font
    heading: 'System',
    mono: 'Courier New',
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
    '5xl': 48,
  },

  // Font Weights
  fontWeight: {
    light: '300',
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800',
  },

  // Line Heights
  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
  },
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  '2xl': 48,
  '3xl': 64,
  '4xl': 96,
};

export const BorderRadius = {
  none: 0,
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  '2xl': 24,
  full: 9999,
};

export const Shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  xl: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
};

export const Animation = {
  duration: {
    fast: 150,
    normal: 300,
    slow: 500,
  },
  easing: {
    easeIn: 'ease-in',
    easeOut: 'ease-out',
    easeInOut: 'ease-in-out',
  },
};

// Component-specific design tokens
export const Components = {
  button: {
    height: {
      sm: 32,
      md: 44,
      lg: 56,
    },
    padding: {
      sm: { paddingHorizontal: 12, paddingVertical: 6 },
      md: { paddingHorizontal: 16, paddingVertical: 12 },
      lg: { paddingHorizontal: 24, paddingVertical: 16 },
    },
  },

  card: {
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    shadow: Shadows.md,
  },

  input: {
    height: 44,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
  },
};

// Utility functions for consistent styling
export const getActivityColor = (activity) => {
  const activityColors = {
    surfing: Colors.surfing,
    kitesurfing: Colors.kitesurfing,
    windsurfing: Colors.windsurfing,
    sailing: Colors.sailing,
    paddling: Colors.paddling,
  };
  return activityColors[activity?.toLowerCase()] || Colors.primary[500];
};

export const getScoreColor = (score) => {
  if (score >= 90) return Colors.success;
  if (score >= 75) return Colors.ocean[500];
  if (score >= 60) return Colors.warning;
  return Colors.error;
};

export const createGradient = (colors) => ({
  background: `linear-gradient(135deg, ${colors.join(', ')})`,
});
