/**
 * Color utilities for the Elite Locker app
 * Provides safe access to colors with fallbacks
 */

// Fallback palette for when the design system fails to load
export const fallbackPalette = {
  // Blues
  blue100: '#E6F2FF',
  blue200: '#CCE5FF',
  blue300: '#99CAFF',
  blue400: '#66B0FF',
  blue500: '#0A84FF', // Primary blue
  blue600: '#0066CC',
  blue700: '#004C99',
  blue800: '#003366',
  blue900: '#001933',

  // Greens
  green100: '#E6F9F1',
  green200: '#CCF3E4',
  green300: '#99E7C9',
  green400: '#66DBAE',
  green500: '#30D158', // Success green
  green600: '#26A744',
  green700: '#1D7D33',
  green800: '#135422',
  green900: '#0A2A11',

  // Reds
  red100: '#FFEBEB',
  red200: '#FFD6D6',
  red300: '#FFADAD',
  red400: '#FF8585',
  red500: '#FF3B30', // Error red
  red600: '#CC2F26',
  red700: '#99231D',
  red800: '#661813',
  red900: '#330C0A',

  // Yellows 
  yellow100: '#FFFBE6',
  yellow200: '#FFF7CC',
  yellow300: '#FFEF99',
  yellow400: '#FFE766',
  yellow500: '#FFCC00', // Warning yellow
  yellow600: '#CCA300',
  yellow700: '#997A00',
  yellow800: '#665200',
  yellow900: '#332900',

  // Purples
  purple100: '#F5E6FF',
  purple200: '#EBCCFF',
  purple300: '#D699FF',
  purple400: '#C266FF',
  purple500: '#AF52DE', // Purple
  purple600: '#8C42B1',
  purple700: '#693185',
  purple800: '#462158',
  purple900: '#23102C',
};

/**
 * Safely get a color from the design tokens, with fallback
 * @param {string} colorPath - Path to the color (e.g., 'palette.blue500')
 * @param {string} fallback - Fallback color if the path doesn't exist
 * @returns {string} - The color value
 */
export function getColor(colorPath, fallback = '#FFFFFF') {
  try {
    const { colors } = require('@/components/design-system/tokens');
    
    // Split the path and traverse the colors object
    const parts = colorPath.split('.');
    let value = colors;
    
    for (const part of parts) {
      if (value && value[part] !== undefined) {
        value = value[part];
      } else {
        // If any part of the path is missing, use the fallback
        return getFallbackColor(colorPath, fallback);
      }
    }
    
    return typeof value === 'string' ? value : fallback;
  } catch (error) {
    return getFallbackColor(colorPath, fallback);
  }
}

/**
 * Get a fallback color when the design system isn't available
 * @param {string} colorPath - Path to the color
 * @param {string} defaultFallback - Default fallback if no mapping exists
 * @returns {string} - The fallback color
 */
function getFallbackColor(colorPath, defaultFallback) {
  // Handle palette colors
  if (colorPath.startsWith('palette.')) {
    const palettePath = colorPath.split('.')[1];
    return fallbackPalette[palettePath] || defaultFallback;
  }
  
  // Map some common theme colors to fallbacks
  const colorMap = {
    'dark.brand.primary': fallbackPalette.blue500,
    'dark.text.primary': '#FFFFFF',
    'dark.text.secondary': '#AAAAAA',
    'dark.background.card': 'rgba(30, 30, 30, 0.6)',
    'dark.border.primary': 'rgba(255, 255, 255, 0.1)',
    'light.icon.secondary': '#8E8E93',
  };
  
  return colorMap[colorPath] || defaultFallback;
}

/**
 * Get a safe version of the entire colors object
 * with fallbacks for missing properties
 */
export function getSafeColors() {
  try {
    const { colors } = require('@/components/design-system/tokens');
    
    // If colors exists and has required properties, return it
    if (colors && colors.palette && colors.light && colors.dark) {
      return colors;
    }
    
    // Otherwise return a fallback structure
    return createFallbackColors();
  } catch (error) {
    return createFallbackColors();
  }
}

/**
 * Create a complete fallback colors object
 */
function createFallbackColors() {
  return {
    palette: fallbackPalette,
    light: {
      text: {
        primary: '#000000',
        secondary: '#666666',
        tertiary: '#999999',
        inverse: '#FFFFFF',
      },
      icon: {
        primary: '#666666',
        secondary: '#999999',
        tertiary: '#BBBBBB',
        inverse: '#000000',
        active: fallbackPalette.blue500,
        error: fallbackPalette.red500,
        success: fallbackPalette.green500,
        warning: fallbackPalette.yellow500,
      },
      background: {
        primary: '#FFFFFF',
        secondary: '#F2F2F7',
        tertiary: '#E5E5EA',
        card: '#F2F2F7',
        modal: '#FFFFFF',
        input: '#F2F2F7',
        subtle: '#F9F9F9',
      },
      border: {
        primary: 'rgba(0, 0, 0, 0.1)',
        secondary: 'rgba(0, 0, 0, 0.05)',
        tertiary: 'rgba(0, 0, 0, 0.03)',
        focus: fallbackPalette.blue500,
        error: fallbackPalette.red500,
      },
      brand: {
        primary: fallbackPalette.blue500,
        secondary: fallbackPalette.blue600,
      }
    },
    dark: {
      text: {
        primary: '#FFFFFF',
        secondary: '#AAAAAA',
        tertiary: '#888888',
        inverse: '#000000',
      },
      icon: {
        primary: '#FFFFFF',
        secondary: '#AAAAAA',
        tertiary: '#666666',
        inverse: '#000000',
        active: fallbackPalette.blue500,
        error: fallbackPalette.red500,
        success: fallbackPalette.green500,
        warning: fallbackPalette.yellow500,
      },
      background: {
        primary: '#000000',
        secondary: '#1C1C1E',
        tertiary: '#2C2C2E',
        inverse: '#FFFFFF',
        card: 'rgba(30, 30, 30, 0.6)',
        modal: '#1C1C1E',
        input: '#1C1C1E',
        subtle: 'rgba(30, 30, 30, 0.6)',
      },
      border: {
        primary: 'rgba(255, 255, 255, 0.1)',
        secondary: 'rgba(255, 255, 255, 0.05)',
        tertiary: 'rgba(255, 255, 255, 0.03)',
        focus: fallbackPalette.blue500,
        error: fallbackPalette.red500,
      },
      brand: {
        primary: fallbackPalette.blue500,
        secondary: fallbackPalette.blue400,
      },
      tab: {
        default: '#9BA1A6',
        selected: '#FFFFFF',
      },
    },
    common: {
      transparent: 'transparent',
      blue: fallbackPalette.blue500,
      green: fallbackPalette.green500,
      red: fallbackPalette.red500,
      orange: fallbackPalette.yellow500,
      purple: fallbackPalette.purple500,
    }
  };
} 