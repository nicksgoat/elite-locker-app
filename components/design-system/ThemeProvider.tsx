/**
 * Elite Locker Design System - Theme Provider
 * 
 * This component provides theme context to the application.
 */

import React, { createContext, useContext, ReactNode } from 'react';
import { useColorScheme } from 'react-native';
import { colors, typography, spacing } from './tokens';

// Theme type
export type ThemeMode = 'light' | 'dark';

// Theme context type
export interface ThemeContextType {
  mode: ThemeMode;
  colors: typeof colors.light & typeof colors.common;
  typography: typeof typography;
  spacing: typeof spacing;
}

// Create theme context
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
  
  // Create theme value
  const themeValue: ThemeContextType = {
    mode,
    colors: { ...(mode === 'light' ? colors.light : colors.dark), ...colors.common },
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
