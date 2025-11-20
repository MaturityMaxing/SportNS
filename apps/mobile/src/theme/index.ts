// Theme configuration for SportNS app
// Provides consistent colors, spacing, typography, and shadows

export const Colors = {
  // Primary colors - Soft, modern palette
  primary: '#8B7ED8',      // Soft purple
  primaryDark: '#7A6BC7',  // Slightly darker purple
  primaryLight: '#E8E4F5', // Very light purple for backgrounds
  
  // Discord branding (for auth screens)
  discord: '#5865F2',
  
  // Secondary colors
  secondary: '#7DD3A0',    // Soft green for success states
  secondaryDark: '#6BC18F',
  
  // Accent colors
  accent: '#F5B896',       // Soft peach for highlights
  accentDark: '#E8A67A',
  
  // Status colors - Softer variants
  success: '#7DD3A0',      // Soft green
  warning: '#F5B896',      // Soft peach
  warningLight: '#FEF5ED', // Very light peach
  error: '#EF4444',        // Strong red for destructive actions (sign out, end game)
  info: '#9BC5F0',         // Soft blue
  
  // Available status
  available: '#7DD3A0',    // Soft green
  unavailable: '#C4C4C4',  // Soft gray
  
  // Neutral colors - Softer, warmer whites
  background: '#FAFAFA',
  backgroundSecondary: '#F5F5F5',
  backgroundTertiary: '#F0F0F0',
  
  surface: '#FFFFFF',
  surfaceHover: '#FAFAFA',
  
  // Text colors - Softer blacks
  text: '#2D2D2D',         // Soft black
  textSecondary: '#8B8B8B', // Medium gray
  textTertiary: '#B8B8B8', // Light gray
  textInverse: '#FFFFFF',
  
  // Border colors - Softer borders
  border: '#E8E8E8',
  borderLight: '#F0F0F0',
  borderDark: '#D0D0D0',
  
  // Shadows
  shadow: '#000000',
  
  // Dark mode (for future implementation)
  dark: {
    background: '#1A1A1A',
    backgroundSecondary: '#242424',
    backgroundTertiary: '#2E2E2E',
    surface: '#242424',
    text: '#F5F5F5',
    textSecondary: '#B8B8B8',
    border: '#3A3A3A',
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
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  full: 9999,
} as const;

export const Typography = {
  // Font family
  fontFamily: {
    regular: 'Inter_400Regular',
    medium: 'Inter_500Medium',
    semibold: 'Inter_600SemiBold',
    bold: 'Inter_700Bold',
    // Default fallback
    default: 'Inter_400Regular',
  },
  
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
  
  // Helper function to get font family based on weight
  getFontFamily: (weight: 'regular' | 'medium' | 'semibold' | 'bold' = 'regular') => {
    return Typography.fontFamily[weight];
  },
  
  // Line heights
  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
  },
} as const;

export const Shadows = {
  small: {},
  medium: {},
  large: {},
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

