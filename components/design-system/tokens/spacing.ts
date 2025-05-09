/**
 * Elite Locker Design System - Spacing
 * 
 * This file contains all the spacing values used in the application.
 */

// Base spacing unit (4px)
const baseUnit = 4;

// Spacing scale
export const spacing = {
  none: 0,
  xxs: baseUnit * 0.5, // 2px
  xs: baseUnit,        // 4px
  sm: baseUnit * 2,    // 8px
  md: baseUnit * 3,    // 12px
  lg: baseUnit * 4,    // 16px
  xl: baseUnit * 5,    // 20px
  xxl: baseUnit * 6,   // 24px
  xxxl: baseUnit * 8,  // 32px
  xxxxl: baseUnit * 10, // 40px
  xxxxxl: baseUnit * 12, // 48px
};

// Insets (padding)
export const insets = {
  xs: {
    top: spacing.xs,
    right: spacing.xs,
    bottom: spacing.xs,
    left: spacing.xs,
  },
  sm: {
    top: spacing.sm,
    right: spacing.sm,
    bottom: spacing.sm,
    left: spacing.sm,
  },
  md: {
    top: spacing.md,
    right: spacing.md,
    bottom: spacing.md,
    left: spacing.md,
  },
  lg: {
    top: spacing.lg,
    right: spacing.lg,
    bottom: spacing.lg,
    left: spacing.lg,
  },
  xl: {
    top: spacing.xl,
    right: spacing.xl,
    bottom: spacing.xl,
    left: spacing.xl,
  },
};

// Layout values
export const layout = {
  // Border radius
  borderRadius: {
    none: 0,
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 24,
    full: 9999,
  },
  
  // Border width
  borderWidth: {
    none: 0,
    thin: 0.5,
    regular: 1,
    thick: 2,
  },
  
  // Shadows
  shadow: {
    none: {
      shadowColor: 'transparent',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0,
      shadowRadius: 0,
      elevation: 0,
    },
    sm: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.18,
      shadowRadius: 1.0,
      elevation: 1,
    },
    md: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.23,
      shadowRadius: 2.62,
      elevation: 4,
    },
    lg: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 4.65,
      elevation: 8,
    },
  },
};

export default {
  spacing,
  insets,
  layout,
};
