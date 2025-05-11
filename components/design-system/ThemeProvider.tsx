/**
 * Elite Locker Design System - Theme Provider
 * 
 * This component provides theme context to the application.
 */

import React, { createContext, useContext, ReactNode } from 'react';
import { useColorScheme } from 'react-native';
import { getSafeColors } from '@/utils/colorUtils';
import { typography, spacing } from './tokens';

// Get colors with fallback support
const colors = getSafeColors();

// Theme type
export type ThemeMode = 'light' | 'dark';

// Theme context type
export interface ThemeContextType {
  mode: ThemeMode;
  colors: any; // Using any to avoid type errors with fallback colors
  typography: typeof typography;
  spacing: typeof spacing;
}

// Create theme context with fallback colors
const ThemeContext = createContext<ThemeContextType>({
  mode: 'dark',
  colors: { ...colors.dark, ...colors.common },
  typography,
  spacing,
});

// Theme provider props
interface ThemeProviderProps {
  children: ReactNode;
  forcedMode?: ThemeMode;
}

/**
 * Theme provider component
 * 
 * Provides theme context to the application based on system color scheme
 * or a forced mode.
 */
export const ThemeProvider: React.FC<ThemeProviderProps> = ({ 
  children, 
  forcedMode 
}) => {
  // Get system color scheme
  const colorScheme = useColorScheme();
  
  // Determine theme mode
  const mode: ThemeMode = forcedMode || (colorScheme === 'light' ? 'light' : 'dark');
  
  // Create theme value with safe colors
  const themeValue: ThemeContextType = {
    mode,
    colors: { ...(mode === 'light' ? colors.light : colors.dark), ...colors.common, palette: colors.palette },
    typography,
    spacing,
  };
  
  return (
    <ThemeContext.Provider value={themeValue}>
      {children}
    </ThemeContext.Provider>
  );
};

/**
 * Hook to use the theme context
 */
export const useTheme = () => useContext(ThemeContext);

export default ThemeProvider;
