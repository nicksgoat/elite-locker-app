/**
 * Elite Locker Design System
 *
 * This file exports all design system components and tokens from a single entry point.
 */

// Export tokens
export * from './tokens';

// Export theme provider
export { ThemeProvider, useTheme } from './ThemeProvider';

// Export primitives
export * from './primitives';

// Export cards
export * from './cards';

// Export feedback components
export * from './feedback';

// Export navigation components
export * from './navigation';

// Export default object with all components
import { ThemeProvider, useTheme } from './ThemeProvider';
import cards from './cards';
import feedback from './feedback';
import navigation from './navigation';
import primitives from './primitives';
import tokens from './tokens';

export default {
  tokens,
  ThemeProvider,
  useTheme,
  ...primitives,
  ...cards,
  ...feedback,
  ...navigation,
};
