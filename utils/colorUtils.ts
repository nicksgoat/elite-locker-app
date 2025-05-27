/**
 * Elite Locker - Color Utilities
 * 
 * Provides safe color fallbacks for the theme system
 */

// Elite Locker color palette based on dark iOS design with chrome/silver accents
const colors = {
  // Dark theme colors
  dark: {
    background: {
      primary: '#000000',    // Black background
      secondary: '#1C1C1E',  // Slightly lighter black
      tertiary: '#2C2C2E',   // Dark gray
      elevated: '#1C1C1E',   // Elevated surfaces
    },
    surface: {
      primary: 'rgba(255, 255, 255, 0.1)',     // Glass surfaces
      secondary: 'rgba(255, 255, 255, 0.05)',  // Subtle surfaces
      elevated: 'rgba(255, 255, 255, 0.15)',   // More prominent surfaces
    },
    text: {
      primary: '#FFFFFF',     // White text
      secondary: '#8E8E93',   // Gray text
      tertiary: '#6D6D70',    // Darker gray
      inverse: '#000000',     // Black text on light backgrounds
      link: '#0A84FF',        // Blue links
      error: '#FF3B30',       // Red error text
      success: '#30D158',     // Green success text
      warning: '#FF9500',     // Orange warning text
    },
    accent: {
      primary: '#D3D3D3',     // Chrome/silver primary accent
      secondary: '#B8B8B8',   // Darker silver
      tertiary: '#9E9E9E',    // Even darker silver
    },
    brand: {
      primary: '#0A84FF',     // Primary brand blue
      secondary: '#5856D6',   // Secondary brand purple
    },
    icon: {
      primary: '#FFFFFF',     // White icons
      secondary: '#8E8E93',   // Gray icons
      tertiary: '#6D6D70',    // Darker gray icons
    },
    status: {
      success: '#30D158',     // Green
      error: '#FF3B30',       // Red
      warning: '#FF9500',     // Orange
      info: '#0A84FF',        // Blue
    },
    border: {
      primary: 'rgba(255, 255, 255, 0.1)',
      secondary: 'rgba(255, 255, 255, 0.05)',
      accent: '#D3D3D3',
    }
  },
  
  // Light theme colors (for consistency, though app is primarily dark)
  light: {
    background: {
      primary: '#FFFFFF',
      secondary: '#F2F2F7',
      tertiary: '#FFFFFF',
      elevated: '#FFFFFF',
    },
    surface: {
      primary: 'rgba(0, 0, 0, 0.05)',
      secondary: 'rgba(0, 0, 0, 0.03)',
      elevated: 'rgba(0, 0, 0, 0.08)',
    },
    text: {
      primary: '#000000',
      secondary: '#3C3C43',
      tertiary: '#8E8E93',
      inverse: '#FFFFFF',
      link: '#0A84FF',
      error: '#FF3B30',
      success: '#30D158',
      warning: '#FF9500',
    },
    accent: {
      primary: '#D3D3D3',
      secondary: '#B8B8B8',
      tertiary: '#9E9E9E',
    },
    brand: {
      primary: '#0A84FF',     // Primary brand blue
      secondary: '#5856D6',   // Secondary brand purple
    },
    icon: {
      primary: '#000000',     // Black icons
      secondary: '#3C3C43',   // Gray icons
      tertiary: '#8E8E93',    // Light gray icons
    },
    status: {
      success: '#30D158',     // Green
      error: '#FF3B30',       // Red
      warning: '#FF9500',     // Orange
      info: '#0A84FF',        // Blue
    },
    border: {
      primary: 'rgba(0, 0, 0, 0.1)',
      secondary: 'rgba(0, 0, 0, 0.05)',
      accent: '#D3D3D3',
    }
  },
  
  // Common colors used across themes
  common: {
    transparent: 'transparent',
    blur: {
      light: 'rgba(255, 255, 255, 0.8)',
      dark: 'rgba(0, 0, 0, 0.8)',
    }
  },
  
  // Brand palette
  palette: {
    black: '#000000',
    white: '#FFFFFF',
    chrome: '#D3D3D3',
    silver: '#B8B8B8',
    blue: '#0A84FF',
    red: '#FF3B30',
    green: '#30D158',
    orange: '#FF9500',
    purple: '#5856D6',
    yellow: '#FFD60A',
  }
};

/**
 * Get safe colors with fallbacks
 * 
 * Provides a safe color object that always returns valid colors
 * even if some color definitions are missing.
 */
export const getSafeColors = () => {
  try {
    return colors;
  } catch (error) {
    console.warn('Error loading colors, using fallbacks:', error);
    
    // Minimal fallback colors
    return {
      dark: {
        background: { primary: '#000000' },
        text: { primary: '#FFFFFF', secondary: '#8E8E93' },
        accent: { primary: '#D3D3D3' },
      },
      light: {
        background: { primary: '#FFFFFF' },
        text: { primary: '#000000', secondary: '#3C3C43' },
        accent: { primary: '#D3D3D3' },
      },
      common: { transparent: 'transparent' },
      palette: { black: '#000000', white: '#FFFFFF', chrome: '#D3D3D3' }
    };
  }
};

export default colors; 