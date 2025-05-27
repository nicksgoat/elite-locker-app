/**
 * Platform-specific wrapper for react-native-maps
 * This conditionally imports the real module on native platforms
 * and provides a web fallback for web builds
 */

import { Platform } from 'react-native';

// Type definitions for the components we use
export interface MapViewProps {
  style?: any;
  provider?: string;
  region?: {
    latitude: number;
    longitude: number;
    latitudeDelta: number;
    longitudeDelta: number;
  };
  customMapStyle?: any[];
  children?: React.ReactNode;
}

export interface MarkerProps {
  coordinate: {
    latitude: number;
    longitude: number;
  };
  title?: string;
  children?: React.ReactNode;
}

export interface PolylineProps {
  coordinates: Array<{
    latitude: number;
    longitude: number;
  }>;
  strokeColor?: string;
  strokeWidth?: number;
}

// Platform-specific imports
let MapView: React.ComponentType<MapViewProps>;
let Marker: React.ComponentType<MarkerProps>;
let Polyline: React.ComponentType<PolylineProps>;
let PROVIDER_GOOGLE: string;
let PROVIDER_DEFAULT: string;

if (Platform.OS === 'web') {
  // Web fallback - import our mock components
  try {
    const webMaps = require('../mocks/react-native-maps.web.js');
    MapView = webMaps.default;
    Marker = webMaps.Marker;
    Polyline = webMaps.Polyline;
    PROVIDER_GOOGLE = webMaps.PROVIDER_GOOGLE;
    PROVIDER_DEFAULT = webMaps.PROVIDER_DEFAULT;
  } catch (error) {
    console.warn('Failed to load web maps fallback:', error);
    // Fallback to basic components if mock fails
    const React = require('react');
    const { View, Text } = require('react-native');

    MapView = ({ children, style, ...props }) =>
      React.createElement(View, { style: [{ backgroundColor: '#e0e0e0', minHeight: 200 }, style], ...props },
        React.createElement(Text, { style: { textAlign: 'center', padding: 20 } }, 'Map View (Web)'),
        children
      );
    Marker = ({ children, ...props }) => React.createElement(View, props, children);
    Polyline = (props) => React.createElement(View, props);
    PROVIDER_GOOGLE = 'google';
    PROVIDER_DEFAULT = 'default';
  }
} else {
  // Native platforms - import the real react-native-maps
  try {
    const nativeMaps = require('react-native-maps');
    MapView = nativeMaps.default;
    Marker = nativeMaps.Marker;
    Polyline = nativeMaps.Polyline;
    PROVIDER_GOOGLE = nativeMaps.PROVIDER_GOOGLE;
    PROVIDER_DEFAULT = nativeMaps.PROVIDER_DEFAULT;
  } catch (error) {
    console.warn('Failed to load react-native-maps:', error);
    // Fallback if native maps fails
    const React = require('react');
    const { View, Text } = require('react-native');

    MapView = ({ children, style, ...props }) =>
      React.createElement(View, { style: [{ backgroundColor: '#e0e0e0', minHeight: 200 }, style], ...props },
        React.createElement(Text, { style: { textAlign: 'center', padding: 20 } }, 'Map View (Fallback)'),
        children
      );
    Marker = ({ children, ...props }) => React.createElement(View, props, children);
    Polyline = (props) => React.createElement(View, props);
    PROVIDER_GOOGLE = 'google';
    PROVIDER_DEFAULT = 'default';
  }
}

// Export all components and constants
export default MapView;
export {
    MapView,
    Marker,
    Polyline, PROVIDER_DEFAULT, PROVIDER_GOOGLE
};

