import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Platform,
  Alert,
  ScrollView,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import MapView, { Polyline, PROVIDER_GOOGLE, Marker } from 'react-native-maps';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import * as Location from 'expo-location';
import { LinearGradient } from 'expo-linear-gradient';
import { useRunTracking, RoutePoint } from '@/contexts/RunTrackingContext';
import { useWorkout } from '@/contexts/WorkoutContext';
import ViewShot from 'react-native-view-shot';

const { width, height } = Dimensions.get('window');

// MapControls Component for map interactions
const MapControls = ({ 
  onCenterMap, 
  onZoomIn, 
  onZoomOut 
}: { 
  onCenterMap: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
}) => {
  return (
    <View style={styles.mapControls}>
      <TouchableOpacity
        style={styles.mapControlButton}
        onPress={onCenterMap}
      >
        <BlurView intensity={80} style={styles.blurBackground} tint="dark">
          <Ionicons name="navigate" size={22} color="#FFFFFF" />
        </BlurView>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={styles.mapControlButton}
        onPress={onZoomIn}
      >
        <BlurView intensity={80} style={styles.blurBackground} tint="dark">
          <Ionicons name="add" size={22} color="#FFFFFF" />
        </BlurView>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={styles.mapControlButton}
        onPress={onZoomOut}
      >
        <BlurView intensity={80} style={styles.blurBackground} tint="dark">
          <Ionicons name="remove" size={22} color="#FFFFFF" />
        </BlurView>
      </TouchableOpacity>
    </View>
  );
};

export default function RunTrackerScreen() {
  const router = useRouter();
  const mapRef = useRef<MapView>(null);
  const mapViewShotRef = useRef<View>(null);
  const [mapLoaded, setMapLoaded] = useState(true);
  const [shareModalVisible, setShareModalVisible] = useState(false);
  const [routeImageUri, setRouteImageUri] = useState<string | null>(null);
  const [mapRegion, setMapRegion] = useState<any>(null);
  
  const {
    isTracking,
    isPaused,
    currentRun,
    startRun,
    stopRun,
    pauseRun,
    resumeRun,
    captureRouteImage,
    saveRun,
    minimizeRun
  } = useRunTracking();

  const { saveWorkoutSummary } = useWorkout();

  const {
    route,
    elapsedTime,
    currentLocation,
    distance,
    pace,
    currentSpeed,
  } = currentRun;

  // Format seconds into minutes and seconds: MM:SS
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // Format pace as minutes per km: MM:SS /km
  const formatPace = (paceInSecondsPerKm: number): string => {
    if (!paceInSecondsPerKm || !isFinite(paceInSecondsPerKm)) return '--:--';
    const mins = Math.floor(paceInSecondsPerKm / 60);
    const secs = Math.floor(paceInSecondsPerKm % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // Format distance in km with 2 decimal places
  const formatDistance = (distanceInMeters: number): string => {
    return (distanceInMeters / 1000).toFixed(2);
  };

  // Request location permissions when component mounts
  useEffect(() => {
    const requestLocationPermissions = async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert(
            'Permission Denied',
            'You need to grant location permissions to track your runs.',
            [{ text: 'OK', onPress: () => router.back() }]
          );
        }
      } catch (error) {
        console.error('Error requesting location permissions:', error);
      }
    };

    requestLocationPermissions();
  }, []);

  // Center map on current location
  useEffect(() => {
    if (currentLocation && mapRef.current) {
      mapRef.current.animateToRegion({
        latitude: currentLocation.latitude,
        longitude: currentLocation.longitude,
        latitudeDelta: 0.005,
        longitudeDelta: 0.005,
      }, 1000);
    }
  }, [currentLocation]);

  // Handle start run button press
  const handleStartRun = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    try {
      await startRun();
    } catch (error) {
      console.error('Error starting run:', error);
      Alert.alert('Error', 'Could not start tracking your run. Please try again.');
    }
  };

  // Handle stop run button press
  const handleStopRun = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    // Confirm with the user
    Alert.alert(
      'End Run',
      'Are you sure you want to end this run?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'End Run',
          style: 'destructive',
          onPress: async () => {
            try {
              // Fit to route bounds before taking screenshot
              if (mapRef.current && route.length > 1) {
                mapRef.current.fitToCoordinates(
                  route.map(point => ({
                    latitude: point.latitude,
                    longitude: point.longitude,
                  })),
                  {
                    edgePadding: { top: 80, right: 80, bottom: 80, left: 80 },
                    animated: true,
                  }
                );
                
                // Give a moment for the map to animate before taking the screenshot
                await new Promise(resolve => setTimeout(resolve, 500));
              }
              
              // Stop the run first to make sure tracking stops
              const runData = await stopRun();
              
              // Try to take screenshot of the route
              let imageUri = '';
              try {
                if (mapViewShotRef.current) {
                  imageUri = await captureRouteImage(mapViewShotRef);
                  setRouteImageUri(imageUri);
                }
              } catch (screenshotError) {
                console.error('Screenshot capture failed:', screenshotError);
                // Continue with the run data even if screenshot fails
              }
              
              // Save the route image to the run data if we got one
              if (imageUri) {
                runData.mapSnapshot = imageUri;
                saveRun(runData);
              }
              
              // Create a workout summary from run data
              const runSummary = {
                title: runData.name,
                totalVolume: 0, // Not applicable for runs
                totalSets: 0, // Not applicable for runs
                totalExercises: 1, // Count as one exercise
                duration: runData.metrics.duration,
                personalRecords: 0,
                date: runData.date,
                notes: `Completed a ${(runData.metrics.distance / 1000).toFixed(2)}km run`,
                media: imageUri ? [{ type: 'photo' as const, url: imageUri }] : undefined,
              };
              
              // Save the run as a workout summary to use in share screen
              saveWorkoutSummary(runSummary);
              
              // Navigate to the workout detail page with run data
              router.push({
                pathname: `/workout/share`,
                params: {
                  type: 'run',
                  runId: runData.id,
                }
              });
            } catch (error) {
              console.error('Error stopping run:', error);
              Alert.alert('Error', 'Something went wrong when ending your run.');
            }
          },
        },
      ]
    );
  };

  // Handle pause/resume button press
  const handlePauseResumeRun = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (isPaused) {
      resumeRun();
    } else {
      pauseRun();
    }
  };

  // Handle back button press
  const handleBackPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    if (isTracking) {
      Alert.alert(
        'Exit Run Tracker',
        'Your current run will be lost. Are you sure you want to exit?',
        [
          {
            text: 'Cancel',
            style: 'cancel',
          },
          {
            text: 'Exit',
            style: 'destructive',
            onPress: () => router.back(),
          },
        ]
      );
    } else {
      router.back();
    }
  };

  // Map control handlers
  const handleCenterMap = () => {
    if (currentLocation && mapRef.current) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      mapRef.current.animateToRegion({
        latitude: currentLocation.latitude,
        longitude: currentLocation.longitude,
        latitudeDelta: 0.005,
        longitudeDelta: 0.005,
      }, 500);
    }
  };
  
  const handleZoomIn = () => {
    if (mapRef.current && mapRegion) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      const newRegion = {
        ...mapRegion,
        latitudeDelta: mapRegion.latitudeDelta / 1.5,
        longitudeDelta: mapRegion.longitudeDelta / 1.5,
      };
      mapRef.current.animateToRegion(newRegion, 200);
      setMapRegion(newRegion);
    }
  };
  
  const handleZoomOut = () => {
    if (mapRef.current && mapRegion) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      const newRegion = {
        ...mapRegion,
        latitudeDelta: mapRegion.latitudeDelta * 1.5,
        longitudeDelta: mapRegion.longitudeDelta * 1.5,
      };
      mapRef.current.animateToRegion(newRegion, 200);
      setMapRegion(newRegion);
    }
  };
  
  // Handle region change
  const handleRegionChange = (region: any) => {
    setMapRegion(region);
  };

  // Handle minimize button press
  const handleMinimize = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    minimizeRun();
    router.back();
  };

  // Render map or fallback
  const renderMap = () => {
    if (!mapLoaded) {
      return (
        <View style={styles.mapErrorContainer}>
          <Ionicons name="map-outline" size={40} color="#8E8E93" />
          <Text style={styles.mapErrorText}>
            Map cannot be displayed. Please check your connection.
          </Text>
        </View>
      );
    }

    return (
      <View 
        style={[
          styles.mapContainer, 
          { borderRadius: isTracking ? 0 : 20 }
        ]} 
        ref={mapViewShotRef}
      >
        <MapView
          ref={mapRef}
          style={styles.map}
          provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
          showsUserLocation
          followsUserLocation={!isPaused}
          showsCompass={false}
          rotateEnabled={false}
          region={
            currentLocation
              ? {
                  latitude: currentLocation.latitude,
                  longitude: currentLocation.longitude,
                  latitudeDelta: 0.005,
                  longitudeDelta: 0.005,
                }
              : undefined
          }
          onRegionChangeComplete={handleRegionChange}
          customMapStyle={darkMapStyle}
        >
          {/* Display the route as a polyline */}
          {route.length > 1 && (
            <Polyline
              coordinates={route.map(point => ({
                latitude: point.latitude,
                longitude: point.longitude,
              }))}
              strokeWidth={5}
              strokeColor="#0A84FF"
              lineDashPattern={isPaused ? [5, 5] : undefined}
              lineCap="round"
              lineJoin="round"
            />
          )}

          {/* Display start marker */}
          {route.length > 0 && (
            <Marker
              coordinate={{
                latitude: route[0].latitude,
                longitude: route[0].longitude,
              }}
              anchor={{ x: 0.5, y: 0.5 }}
            >
              <View style={styles.startMarker}>
                <Ionicons name="flag" size={18} color="#FFFFFF" />
              </View>
            </Marker>
          )}

          {/* Display current location marker when paused */}
          {isPaused && currentLocation && (
            <Marker
              coordinate={{
                latitude: currentLocation.latitude,
                longitude: currentLocation.longitude,
              }}
              anchor={{ x: 0.5, y: 0.5 }}
            >
              <View style={styles.currentLocationMarker}>
                <Ionicons name="pause" size={18} color="#FFFFFF" />
              </View>
            </Marker>
          )}
        </MapView>

        {/* Map controls */}
        {isTracking && (
          <MapControls
            onCenterMap={handleCenterMap}
            onZoomIn={handleZoomIn}
            onZoomOut={handleZoomOut}
          />
        )}

        {/* Map attribution overlay for screenshots */}
        <View style={styles.mapAttribution}>
          <Text style={styles.mapAttributionText}>Elite Locker Run Tracker</Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={handleBackPress}
          activeOpacity={0.7}
        >
          <BlurView intensity={30} tint="dark" style={styles.blurButton}>
            <Ionicons name="chevron-down" size={24} color="#FFFFFF" />
          </BlurView>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {isTracking ? (isPaused ? 'PAUSED' : 'TRACKING') : 'RUN TRACKER'}
        </Text>
        
        {/* Add minimize button */}
        {isTracking && (
          <TouchableOpacity
            style={styles.minimizeButton}
            onPress={handleMinimize}
            activeOpacity={0.7}
          >
            <BlurView intensity={30} tint="dark" style={styles.blurButton}>
              <Ionicons name="remove" size={24} color="#FFFFFF" />
            </BlurView>
          </TouchableOpacity>
        )}
      </View>

      {/* Map View */}
      {renderMap()}

      {/* Run Stats */}
      <View style={styles.statsContainer}>
        <BlurView intensity={20} tint="dark" style={styles.statsBlurView}>
          <LinearGradient
            colors={['rgba(30,30,30,0.7)', 'rgba(20,20,20,0.85)']}
            style={styles.statsGradient}
          >
            {/* Time */}
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{formatTime(elapsedTime)}</Text>
              <Text style={styles.statLabel}>Time</Text>
            </View>

            {/* Distance */}
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{formatDistance(distance)}</Text>
              <Text style={styles.statLabel}>Distance (km)</Text>
            </View>

            {/* Pace */}
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{formatPace(pace)}</Text>
              <Text style={styles.statLabel}>Pace (min/km)</Text>
            </View>
          </LinearGradient>
        </BlurView>
      </View>

      {/* Action buttons */}
      <View style={styles.actionButtons}>
        {!isTracking ? (
          <TouchableOpacity
            style={styles.startButton}
            onPress={handleStartRun}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['#0A84FF', '#0066CC']}
              style={styles.buttonGradient}
            >
              <Ionicons name="play" size={28} color="#FFFFFF" />
              <Text style={styles.buttonText}>START</Text>
            </LinearGradient>
          </TouchableOpacity>
        ) : (
          <View style={styles.activeButtons}>
            <TouchableOpacity
              style={styles.pauseResumeButton}
              onPress={handlePauseResumeRun}
              activeOpacity={0.8}
            >
              <BlurView intensity={30} tint="dark" style={styles.actionBlurView}>
                <Ionicons
                  name={isPaused ? 'play' : 'pause'}
                  size={28}
                  color="#FFFFFF"
                />
              </BlurView>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.stopButton}
              onPress={handleStopRun}
              activeOpacity={0.8}
            >
              <BlurView intensity={30} tint="dark" style={styles.actionBlurView}>
                <Ionicons name="stop" size={28} color="#FF453A" />
              </BlurView>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight || 0 : 0,
    paddingHorizontal: 20,
    height: 60,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  backButton: {
    position: 'absolute',
    left: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: 'hidden',
  },
  blurButton: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  mapContainer: {
    flex: 1,
    overflow: 'hidden',
    borderRadius: 20,
  },
  map: {
    flex: 1,
  },
  mapErrorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1C1C1E',
  },
  mapErrorText: {
    color: '#8E8E93',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 8,
    maxWidth: '80%',
  },
  statsContainer: {
    position: 'absolute',
    left: 20,
    right: 20,
    bottom: 140,
    borderRadius: 16,
    overflow: 'hidden',
    height: 100,
  },
  statsBlurView: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  statsGradient: {
    flex: 1,
    flexDirection: 'row',
    borderRadius: 16,
  },
  statItem: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
  },
  statValue: {
    fontSize: 26,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 12,
    color: '#8E8E93',
  },
  actionButtons: {
    position: 'absolute',
    bottom: 50,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  startButton: {
    width: 150,
    height: 60,
    borderRadius: 30,
    overflow: 'hidden',
  },
  buttonGradient: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 30,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 8,
  },
  activeButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
  },
  pauseResumeButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    overflow: 'hidden',
    marginHorizontal: 15,
  },
  stopButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    overflow: 'hidden',
    marginHorizontal: 15,
  },
  actionBlurView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 30,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  startMarker: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#34C759',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  currentLocationMarker: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FF9500',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  mapAttribution: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  mapAttributionText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '500',
  },
  mapControls: {
    position: 'absolute',
    right: 16,
    top: 16,
    alignItems: 'center',
  },
  mapControlButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    overflow: 'hidden',
  },
  blurBackground: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  minimizeButton: {
    position: 'absolute',
    right: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: 'hidden',
  },
});

// Dark map style for better visibility
const darkMapStyle = [
  {
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#212121"
      }
    ]
  },
  {
    "elementType": "labels.icon",
    "stylers": [
      {
        "visibility": "off"
      }
    ]
  },
  {
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#757575"
      }
    ]
  },
  {
    "elementType": "labels.text.stroke",
    "stylers": [
      {
        "color": "#212121"
      }
    ]
  },
  {
    "featureType": "administrative",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#757575"
      },
      {
        "visibility": "off"
      }
    ]
  },
  {
    "featureType": "administrative.country",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#9e9e9e"
      }
    ]
  },
  {
    "featureType": "administrative.land_parcel",
    "stylers": [
      {
        "visibility": "off"
      }
    ]
  },
  {
    "featureType": "administrative.locality",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#bdbdbd"
      }
    ]
  },
  {
    "featureType": "administrative.neighborhood",
    "stylers": [
      {
        "visibility": "off"
      }
    ]
  },
  {
    "featureType": "poi",
    "stylers": [
      {
        "visibility": "off"
      }
    ]
  },
  {
    "featureType": "poi",
    "elementType": "labels.text",
    "stylers": [
      {
        "visibility": "off"
      }
    ]
  },
  {
    "featureType": "poi",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#757575"
      }
    ]
  },
  {
    "featureType": "poi.park",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#181818"
      }
    ]
  },
  {
    "featureType": "poi.park",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#616161"
      }
    ]
  },
  {
    "featureType": "poi.park",
    "elementType": "labels.text.stroke",
    "stylers": [
      {
        "color": "#1b1b1b"
      }
    ]
  },
  {
    "featureType": "road",
    "elementType": "geometry.fill",
    "stylers": [
      {
        "color": "#2c2c2c"
      }
    ]
  },
  {
    "featureType": "road",
    "elementType": "labels",
    "stylers": [
      {
        "visibility": "off"
      }
    ]
  },
  {
    "featureType": "road",
    "elementType": "labels.icon",
    "stylers": [
      {
        "visibility": "off"
      }
    ]
  },
  {
    "featureType": "road",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#8a8a8a"
      }
    ]
  },
  {
    "featureType": "road.arterial",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#373737"
      }
    ]
  },
  {
    "featureType": "road.highway",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#3c3c3c"
      }
    ]
  },
  {
    "featureType": "road.highway.controlled_access",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#4e4e4e"
      }
    ]
  },
  {
    "featureType": "road.local",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#616161"
      }
    ]
  },
  {
    "featureType": "transit",
    "stylers": [
      {
        "visibility": "off"
      }
    ]
  },
  {
    "featureType": "transit",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#757575"
      }
    ]
  },
  {
    "featureType": "water",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#000000"
      }
    ]
  },
  {
    "featureType": "water",
    "elementType": "labels.text",
    "stylers": [
      {
        "visibility": "off"
      }
    ]
  },
  {
    "featureType": "water",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#3d3d3d"
      }
    ]
  }
]; 