/**
 * Web fallback for react-native-maps
 * This provides mock components for web builds to prevent import errors
 */

import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

// Mock all the internal components that might be imported
const MockComponent = ({ children, style, ...props }) => {
  return React.createElement(View, { style, ...props }, children);
};

// Mock native commands and components
const mockNativeCommands = {};
const mockNativeComponent = MockComponent;

// Mock MapView component
const MapView = ({ children, style, ...props }) => {
  return (
    <View style={[styles.mapContainer, style]} {...props}>
      <Text style={styles.mapText}>Map View (Web Fallback)</Text>
      {children}
    </View>
  );
};

// Mock Marker component
const Marker = ({ children, ...props }) => {
  return (
    <View style={styles.marker} {...props}>
      <Text style={styles.markerText}>📍</Text>
      {children}
    </View>
  );
};

// Mock Callout component
const Callout = ({ children, ...props }) => {
  return (
    <View style={styles.callout} {...props}>
      {children}
    </View>
  );
};

// Mock Circle component
const Circle = (props) => {
  return <View style={styles.circle} {...props} />;
};

// Mock Polygon component
const Polygon = (props) => {
  return <View style={styles.polygon} {...props} />;
};

// Mock Polyline component
const Polyline = (props) => {
  return <View style={styles.polyline} {...props} />;
};

const styles = StyleSheet.create({
  mapContainer: {
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 200,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  mapText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '500',
  },
  marker: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  markerText: {
    fontSize: 20,
  },
  callout: {
    backgroundColor: 'white',
    padding: 8,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  circle: {
    position: 'absolute',
    borderRadius: 50,
    backgroundColor: 'rgba(0, 0, 255, 0.3)',
  },
  polygon: {
    position: 'absolute',
    backgroundColor: 'rgba(255, 0, 0, 0.3)',
  },
  polyline: {
    position: 'absolute',
    backgroundColor: 'rgba(0, 255, 0, 0.3)',
    height: 2,
  },
});

// Export all components
export default MapView;
export {
    Callout,
    Circle, MapView,
    Marker, Polygon,
    Polyline
};

// Export constants that might be used
export const PROVIDER_GOOGLE = 'google';
export const PROVIDER_DEFAULT = 'default';

// Export all internal components and modules that might be imported
export const MapMarkerNativeComponent = mockNativeComponent;
export const MapPolylineNativeComponent = mockNativeComponent;
export const MapPolygonNativeComponent = mockNativeComponent;
export const MapCircleNativeComponent = mockNativeComponent;
export const MapCalloutNativeComponent = mockNativeComponent;
export const MapUrlTileNativeComponent = mockNativeComponent;
export const MapWMSTileNativeComponent = mockNativeComponent;
export const MapLocalTileNativeComponent = mockNativeComponent;
export const MapOverlayNativeComponent = mockNativeComponent;
export const MapHeatmapNativeComponent = mockNativeComponent;
export const MapGradientPolylineNativeComponent = mockNativeComponent;

// Note: Commands export is reserved by React Native codegen, so we skip it

// Additional exports for compatibility
export const AnimatedRegion = MockComponent;
export const Geojson = MockComponent;

