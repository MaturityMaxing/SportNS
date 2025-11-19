// Theme configuration for SportNS app
// Provides consistent colors, spacing, typography, and shadows

export const Colors = {
  // Primary colors
  primary: '#6366F1',      // Indigo for primary actions
  primaryDark: '#4F46E5',  // Darker indigo for pressed states
  primaryLight: '#A5B4FC', // Light indigo for backgrounds
  
  // Discord branding (for auth screens)
  discord: '#5865F2',
  
  // Secondary colors
  secondary: '#10B981',    // Green for success states
  secondaryDark: '#059669',
  
  // Accent colors
  accent: '#F59E0B',       // Amber for highlights
  accentDark: '#D97706',
  
  // Status colors
  success: '#10B981',      // Green
  warning: '#F59E0B',      // Amber
  warningLight: '#FEF3C7', // Light amber for backgrounds
  error: '#EF4444',        // Red
  info: '#3B82F6',         // Blue
  
  // Available status
  available: '#10B981',    // Green
  unavailable: '#6B7280',  // Gray
  
  // Neutral colors - Light mode
  background: '#FFFFFF',
  backgroundSecondary: '#F9FAFB',
  backgroundTertiary: '#F3F4F6',
  
  surface: '#FFFFFF',
  surfaceHover: '#F9FAFB',
  
  // Text colors
  text: '#111827',         // Almost black
  textSecondary: '#6B7280', // Gray
  textTertiary: '#9CA3AF', // Light gray
  textInverse: '#FFFFFF',
  
  // Border colors
  border: '#E5E7EB',
  borderLight: '#F3F4F6',
  borderDark: '#D1D5DB',
  
  // Shadows
  shadow: '#000000',
  
  // Dark mode (for future implementation)
  dark: {
    background: '#111827',
    backgroundSecondary: '#1F2937',
    backgroundTertiary: '#374151',
    surface: '#1F2937',
    text: '#F9FAFB',
    textSecondary: '#D1D5DB',
    border: '#374151',
  },
} as const;

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  xxxl: 64,
} as const;

export const BorderRadius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  full: 9999,
} as const;

export const Typography = {
  // Font sizes
  fontSize: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 20,
    xxl: 24,
    xxxl: 32,
    huge: 40,
  },
  
  // Font weights
  fontWeight: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
  },
  
  // Line heights
  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
  },
} as const;

export const Shadows = {
  small: {
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  medium: {
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  large: {
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
} as const;

export const Layout = {
  // Maximum content width for tablets/larger screens
  maxContentWidth: 600,
  
  // Screen padding
  screenPadding: Spacing.md,
  
  // Common dimensions
  headerHeight: 60,
  tabBarHeight: 60,
  buttonHeight: 48,
  inputHeight: 48,
  avatarSize: {
    small: 32,
    medium: 48,
    large: 64,
    xlarge: 96,
  },
} as const;

// Combined theme object
export const Theme = {
  colors: Colors,
  spacing: Spacing,
  borderRadius: BorderRadius,
  typography: Typography,
  shadows: Shadows,
  layout: Layout,
} as const;

export default Theme;

