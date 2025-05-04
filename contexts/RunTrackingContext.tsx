import React, { createContext, useState, useContext, useEffect, useRef } from 'react';
import * as Location from 'expo-location';
import { Alert, Platform } from 'react-native';
import * as FileSystem from 'expo-file-system';
import * as ViewShot from 'react-native-view-shot';

// Types
export interface RoutePoint {
  latitude: number;
  longitude: number;
  timestamp: number;
  altitude?: number;
  speed?: number;
  accuracy?: number;
}

export interface RunMetrics {
  distance: number; // in meters
  duration: number; // in seconds
  pace: number; // in seconds per km
  calories: number;
  elevation: number; // in meters
  avgSpeed: number; // in km/h
}

export interface RunData {
  id: string;
  name: string;
  date: Date;
  route: RoutePoint[];
  metrics: RunMetrics;
  mapSnapshot?: string; // URI to the saved image of the route
}

interface RunTrackingContextType {
  isTracking: boolean;
  isPaused: boolean;
  isMinimized: boolean;
  currentRun: {
    route: RoutePoint[];
    startTime: Date | null;
    elapsedTime: number;
    currentLocation: RoutePoint | null;
    distance: number;
    pace: number;
    currentSpeed: number;
  };
  pastRuns: RunData[];
  startRun: () => Promise<void>;
  stopRun: () => Promise<RunData>;
  pauseRun: () => void;
  resumeRun: () => void;
  minimizeRun: () => void;
  maximizeRun: () => void;
  captureRouteImage: (ref: React.RefObject<any>) => Promise<string>;
  saveRun: (run: RunData) => void;
  getPastRun: (id: string) => RunData | undefined;
}

const RunTrackingContext = createContext<RunTrackingContextType | undefined>(undefined);

export const useRunTracking = () => {
  const context = useContext(RunTrackingContext);
  if (!context) {
    throw new Error('useRunTracking must be used within a RunTrackingProvider');
  }
  return context;
};

export const RunTrackingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Run tracking state
  const [isTracking, setIsTracking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [pausedTime, setPausedTime] = useState(0);
  const [lastPauseTime, setLastPauseTime] = useState<Date | null>(null);
  const [route, setRoute] = useState<RoutePoint[]>([]);
  const [currentLocation, setCurrentLocation] = useState<RoutePoint | null>(null);
  const [distance, setDistance] = useState(0);
  const [pace, setPace] = useState(0);
  const [currentSpeed, setCurrentSpeed] = useState(0);
  const [pastRuns, setPastRuns] = useState<RunData[]>([]);

  // Location tracking
  const locationSubscription = useRef<Location.LocationSubscription | null>(null);
  const timerInterval = useRef<ReturnType<typeof setInterval> | null>(null);

  // Get distance between two coordinates in meters using Haversine formula
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371e3; // Earth radius in meters
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;

    return distance;
  };

  // Calculate the total distance of the route
  const calculateTotalDistance = (routePoints: RoutePoint[]): number => {
    let totalDistance = 0;
    for (let i = 1; i < routePoints.length; i++) {
      const prevPoint = routePoints[i - 1];
      const currentPoint = routePoints[i];
      
      totalDistance += calculateDistance(
        prevPoint.latitude,
        prevPoint.longitude,
        currentPoint.latitude,
        currentPoint.longitude
      );
    }
    return totalDistance;
  };

  // Calculate calories burned based on distance (very simplified)
  const calculateCalories = (distanceInMeters: number): number => {
    // Rough estimate: ~62 calories per km for a 70kg person
    return Math.round((distanceInMeters / 1000) * 62);
  };

  // Calculate elevation gain from altitude data
  const calculateElevation = (routePoints: RoutePoint[]): number => {
    let totalElevation = 0;
    for (let i = 1; i < routePoints.length; i++) {
      const prev = routePoints[i - 1].altitude || 0;
      const current = routePoints[i].altitude || 0;
      const diff = current - prev;
      if (diff > 0) totalElevation += diff;
    }
    return totalElevation;
  };

  // Timer for elapsed time during run
  useEffect(() => {
    if (isTracking && !isPaused) {
      timerInterval.current = setInterval(() => {
        setElapsedTime(prev => prev + 1);
      }, 1000);
    } else if (timerInterval.current) {
      clearInterval(timerInterval.current);
      timerInterval.current = null;
    }

    return () => {
      if (timerInterval.current) {
        clearInterval(timerInterval.current);
        timerInterval.current = null;
      }
    };
  }, [isTracking, isPaused]);

  // Update pace based on distance and time
  useEffect(() => {
    if (isTracking && distance > 0 && elapsedTime > 0) {
      // Pace in seconds per km
      const paceValue = elapsedTime / (distance / 1000);
      setPace(paceValue);
    }
  }, [distance, elapsedTime, isTracking]);

  // Start tracking a run
  const startRun = async (): Promise<void> => {
    try {
      // Request permissions
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Permission to access location was denied');
        return;
      }

      // Get initial location
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.BestForNavigation,
      });

      const initialPoint: RoutePoint = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        timestamp: new Date().getTime(),
        altitude: location.coords.altitude ?? 0,
        speed: location.coords.speed ?? 0,
        accuracy: location.coords.accuracy ?? 0,
      };

      // Reset state
      setRoute([initialPoint]);
      setCurrentLocation(initialPoint);
      setStartTime(new Date());
      setElapsedTime(0);
      setPausedTime(0);
      setDistance(0);
      setPace(0);
      setCurrentSpeed(0);
      setIsTracking(true);
      setIsPaused(false);

      // Start location tracking
      locationSubscription.current = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.BestForNavigation,
          timeInterval: 1000,
          distanceInterval: 5, // Minimum 5 meters between updates
        },
        (location) => {
          if (isPaused) return;

          const newPoint: RoutePoint = {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            timestamp: new Date().getTime(),
            altitude: location.coords.altitude ?? 0,
            speed: location.coords.speed ?? 0,
            accuracy: location.coords.accuracy ?? 0,
          };

          // Add to route
          setRoute(prevRoute => {
            if (prevRoute.length > 1) {
              const lastPoint = prevRoute[prevRoute.length - 1];
              const newDistance = calculateDistance(
                lastPoint.latitude,
                lastPoint.longitude,
                newPoint.latitude,
                newPoint.longitude
              );

              // Only add to distance if accuracy is good
              if (location.coords.accuracy && location.coords.accuracy < 20) {
                setDistance(prev => prev + newDistance);
              }
            }
            return [...prevRoute, newPoint];
          });
          
          setCurrentLocation(newPoint);

          // Update current speed (convert from m/s to km/h)
          setCurrentSpeed((location.coords.speed ?? 0) * 3.6);
        }
      );
    } catch (error) {
      console.error('Error starting run:', error);
      Alert.alert('Error', 'Could not start tracking your run. Please try again.');
    }
  };

  // Stop tracking a run
  const stopRun = async (): Promise<RunData> => {
    if (!isTracking) {
      throw new Error('No active run to stop');
    }

    try {
      // Stop location tracking
      if (locationSubscription.current) {
        await locationSubscription.current.remove();
        locationSubscription.current = null;
      }

      // Clear timer
      if (timerInterval.current) {
        clearInterval(timerInterval.current);
        timerInterval.current = null;
      }

      // Calculate final metrics
      const runId = `run_${new Date().getTime()}`;
      const avgSpeed = distance > 0 && elapsedTime > 0 ? (distance / elapsedTime) * 3.6 : 0;
      const elevation = calculateElevation(route);
      const calories = calculateCalories(distance);

      const runData: RunData = {
        id: runId,
        name: `Run ${new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`,
        date: startTime || new Date(),
        route: [...route],
        metrics: {
          distance,
          duration: elapsedTime,
          pace: distance > 0 ? elapsedTime / (distance / 1000) : 0,
          calories,
          elevation,
          avgSpeed,
        },
      };

      // Save run
      setPastRuns(prev => [...prev, runData]);

      // Reset state
      setIsTracking(false);
      setIsPaused(false);
      setStartTime(null);
      setElapsedTime(0);
      setPausedTime(0);
      setDistance(0);
      setRoute([]);
      setCurrentLocation(null);

      return runData;
    } catch (error) {
      console.error('Error stopping run:', error);
      throw new Error('Failed to stop run tracking');
    }
  };

  // Pause tracking run
  const pauseRun = () => {
    if (isTracking && !isPaused) {
      setIsPaused(true);
      setLastPauseTime(new Date());
    }
  };

  // Resume tracking run
  const resumeRun = () => {
    if (isTracking && isPaused) {
      setIsPaused(false);
      if (lastPauseTime) {
        const pauseDuration = Math.floor((new Date().getTime() - lastPauseTime.getTime()) / 1000);
        setPausedTime(prev => prev + pauseDuration);
      }
    }
  };

  // Capture a screenshot of the route
  const captureRouteImage = async (ref: React.RefObject<any>): Promise<string> => {
    try {
      if (!ref.current) {
        throw new Error('View reference is not available');
      }

      // Capture the view with a more reliable approach (use data URI instead of tmp file)
      const uri = await ViewShot.captureRef(ref, {
        format: 'jpg',
        quality: 0.8,
        result: 'data-uri',
      });

      // Create a unique filename in the app's cache directory (which is always writable)
      const filename = `${FileSystem.cacheDirectory}route_${Date.now()}.jpg`;
      
      // Write the data URI to the file
      await FileSystem.writeAsStringAsync(filename, uri.split(',')[1], {
        encoding: FileSystem.EncodingType.Base64,
      });

      return filename;
    } catch (error) {
      console.error('Error capturing route image:', error);
      // Return a placeholder image path instead of throwing
      return '';
    }
  };

  // Save a run to the list of past runs
  const saveRun = (run: RunData) => {
    setPastRuns(prev => {
      const existingIndex = prev.findIndex(r => r.id === run.id);
      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex] = run;
        return updated;
      } else {
        return [...prev, run];
      }
    });
  };

  // Get a specific past run by ID
  const getPastRun = (id: string): RunData | undefined => {
    return pastRuns.find(run => run.id === id);
  };

  // Format time for display
  const formatTime = (seconds: number): string => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    
    if (hrs > 0) {
      return `${hrs}:${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
    } else {
      return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    }
  };

  // Add functions to minimize and maximize the run tracker
  const minimizeRun = () => {
    setIsMinimized(true);
  };

  const maximizeRun = () => {
    setIsMinimized(false);
  };

  return (
    <RunTrackingContext.Provider
      value={{
        isTracking,
        isPaused,
        isMinimized,
        currentRun: {
          route,
          startTime,
          elapsedTime,
          currentLocation,
          distance,
          pace,
          currentSpeed,
        },
        pastRuns,
        startRun,
        stopRun,
        pauseRun,
        resumeRun,
        minimizeRun,
        maximizeRun,
        captureRouteImage,
        saveRun,
        getPastRun,
      }}
    >
      {children}
    </RunTrackingContext.Provider>
  );
};

export default RunTrackingContext; 