/**
 * Elite Locker Design System - Colors
 * 
 * This file contains all the colors used in the application.
 * Colors are organized by semantic meaning and theme (light/dark).
 */

// Base palette
const palette = {
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

  // Oranges
  orange100: '#FFF3E6',
  orange200: '#FFE7CC',
  orange300: '#FFCF99',
  orange400: '#FFB766',
  orange500: '#FF9500', // Warning orange
  orange600: '#CC7700',
  orange700: '#995900',
  orange800: '#663C00',
  orange900: '#331E00',

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

  // Grays
  gray100: '#F2F2F7',
  gray200: '#E5E5EA',
  gray300: '#D1D1D6',
  gray400: '#C7C7CC',
  gray500: '#AEAEB2',
  gray600: '#8E8E93',
  gray700: '#636366',
  gray800: '#48484A',
  gray900: '#3A3A3C',
  gray950: '#2C2C2E',
  gray975: '#1C1C1E',

  // Black and white
  white: '#FFFFFF',
  black: '#000000',
};

// Theme-specific colors
export const colors = {
  light: {
    // Text colors
    text: {
      primary: '#11181C',
      secondary: '#687076',
      tertiary: '#889096',
      inverse: '#FFFFFF',
      link: '#0a7ea4',
      error: palette.red500,
      success: palette.green500,
      warning: palette.orange500,
    },
    // Background colors
    background: {
      primary: '#FFFFFF',
      secondary: palette.gray100,
      tertiary: palette.gray200,
      inverse: '#151718',
      card: palette.white,
      modal: palette.white,
    },
    // Border colors
    border: {
      primary: palette.gray300,
      secondary: palette.gray200,
      tertiary: palette.gray100,
      focus: palette.blue500,
      error: palette.red500,
    },
    // Icon colors
    icon: {
      primary: '#687076',
      secondary: '#9BA1A6',
      tertiary: '#CBD2D9',
      inverse: palette.white,
      active: '#0a7ea4',
      error: palette.red500,
      success: palette.green500,
      warning: palette.orange500,
    },
    // Brand colors
    brand: {
      primary: '#0a7ea4',
      secondary: '#0066CC',
    },
    // Tab colors
    tab: {
      default: '#687076',
      selected: '#0a7ea4',
    },
  },
  dark: {
    // Text colors
    text: {
      primary: '#ECEDEE',
      secondary: '#9BA1A6',
      tertiary: '#889096',
      inverse: '#11181C',
      link: palette.blue500,
      error: palette.red500,
      success: palette.green500,
      warning: palette.orange500,
    },
    // Background colors
    background: {
      primary: '#000000',
      secondary: '#151718',
      tertiary: '#1C1C1E',
      inverse: palette.white,
      card: palette.gray975,
      modal: palette.gray950,
    },
    // Border colors
    border: {
      primary: palette.gray900,
      secondary: palette.gray800,
      tertiary: palette.gray700,
      focus: palette.blue500,
      error: palette.red500,
    },
    // Icon colors
    icon: {
      primary: '#9BA1A6',
      secondary: '#687076',
      tertiary: '#4E5559',
      inverse: palette.black,
      active: palette.blue500,
      error: palette.red500,
      success: palette.green500,
      warning: palette.orange500,
    },
    // Brand colors
    brand: {
      primary: palette.blue500,
      secondary: palette.blue400,
    },
    // Tab colors
    tab: {
      default: '#9BA1A6',
      selected: palette.white,
    },
  },
  // Common colors (same in both themes)
  common: {
    blue: palette.blue500,
    green: palette.green500,
    red: palette.red500,
    orange: palette.orange500,
    purple: palette.purple500,
    transparent: 'transparent',
  },
  // Raw palette
  palette,
};

export default colors;
