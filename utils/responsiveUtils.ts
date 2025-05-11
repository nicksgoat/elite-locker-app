/**
 * Elite Locker - Responsive Utilities
 *
 * This file contains utility functions for responsive design.
 */

import { Dimensions, ScaledSize } from 'react-native';

// Get screen dimensions
const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// Device size breakpoints
export const breakpoints = {
  small: 375, // iPhone SE, iPhone 8
  medium: 414, // iPhone 11 Pro Max, 12/13/14 Pro Max
  large: 768, // iPad Mini, iPad
  xlarge: 1024, // iPad Pro
};

/**
 * Determine if the device is a tablet
 */
export const isTablet = (): boolean => {
  const { width, height } = Dimensions.get('window');
  const aspectRatio = height / width;

  // iPad typically has aspect ratio less than 1.6
  return aspectRatio < 1.6 && Math.max(width, height) >= 768;
};

/**
 * Get responsive horizontal padding based on screen width
 *
 * @param minPadding Minimum padding value (default: 16)
 * @param maxPadding Maximum padding value (default: 32)
 * @param scaleFactor Scale factor for calculating padding (default: 0.06 - 6% of screen width)
 * @returns Calculated padding value
 */
export const getResponsiveHorizontalPadding = (
  minPadding: number = 16,
  maxPadding: number = 32,
  scaleFactor: number = 0.06
): number => {
  // For larger devices, use proportional padding
  if (screenWidth >= breakpoints.medium) {
    // For iPhone Pro Max models and larger, use more generous padding
    if (screenWidth >= 428) { // iPhone 13/14 Pro Max width
      return Math.max(20, Math.min(maxPadding, screenWidth * scaleFactor));
    }
    return Math.max(minPadding, Math.min(28, screenWidth * 0.055));
  }

  // For smaller devices, use fixed padding
  return minPadding;
};

/**
 * Get responsive spacing value based on screen size
 *
 * @param smallValue Value for small screens (default: 8)
 * @param mediumValue Value for medium screens (default: 12)
 * @param largeValue Value for large screens (default: 16)
 * @returns Appropriate spacing value for current screen size
 */
export const getResponsiveSpacing = (
  smallValue: number = 8,
  mediumValue: number = 12,
  largeValue: number = 16
): number => {
  if (screenWidth >= breakpoints.large || isTablet()) {
    return largeValue;
  } else if (screenWidth >= breakpoints.medium) {
    return mediumValue;
  }
  return smallValue;
};

/**
 * Calculate responsive font size based on screen width
 *
 * @param size Base font size
 * @param scaleFactor Scale factor (default: 0.1 - scales by 10% for larger screens)
 * @returns Calculated font size
 */
export const getResponsiveFontSize = (
  size: number,
  scaleFactor: number = 0.1
): number => {
  // For larger devices, scale the font size
  if (screenWidth >= breakpoints.medium) {
    const scaledSize = size * (1 + scaleFactor);
    return Math.min(scaledSize, size * 1.3); // Cap at 30% larger
  }

  return size;
};

/**
 * Calculate responsive dimensions for UI elements
 *
 * @param size Base size
 * @param minSize Minimum size (default: size)
 * @param maxSize Maximum size (default: size * 1.5)
 * @returns Calculated size
 */
export const getResponsiveSize = (
  size: number,
  minSize: number = size,
  maxSize: number = size * 1.5
): number => {
  // For larger devices, scale the size
  if (screenWidth >= breakpoints.medium) {
    const scaleFactor = screenWidth / breakpoints.medium;
    const scaledSize = size * scaleFactor;
    return Math.max(minSize, Math.min(maxSize, scaledSize));
  }

  return size;
};

/**
 * Listen for dimension changes and execute callback
 *
 * @param callback Function to execute when dimensions change
 * @returns Function to remove the event listener
 */
export const addDimensionListener = (
  callback: (dimensions: ScaledSize) => void
): (() => void) => {
  const subscription = Dimensions.addEventListener('change', ({ window }) => {
    callback(window);
  });

  return () => subscription.remove();
};

export default {
  breakpoints,
  isTablet,
  getResponsiveHorizontalPadding,
  getResponsiveSpacing,
  getResponsiveFontSize,
  getResponsiveSize,
  addDimensionListener,
};
