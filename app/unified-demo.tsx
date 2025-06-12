/**
 * Elite Locker - Unified Data Demo Screen
 * 
 * This screen demonstrates the unified data flow between
 * exercise library, workout tracker, and social feed.
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useUnifiedDataStore } from '../stores/UnifiedDataStore';
import { ConnectedExerciseLibrary } from '../components/connected/ConnectedExerciseLibrary';
import { ConnectedWorkoutTracker } from '../components/connected/ConnectedWorkoutTracker';
import { ConnectedSocialFeed } from '../components/connected/ConnectedSocialFeed';
import SyncStatusIndicator from '../components/SyncStatusIndicator';

type TabType = 'library' | 'workout' | 'feed';

export default function UnifiedDemoScreen() {
  // Store state
  const {
    exercises,
    activeWorkout,
    socialPosts,
    loadExercises,
    loadSocialFeed,
    forceSync,
    clearErrors,
  } = useUnifiedDataStore();

  // Local state
  const [activeTab, setActiveTab] = useState<TabType>('library');
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize data on mount
  useEffect(() => {
    const initializeData = async () => {
      try {
        await Promise.all([
          loadExercises(),
          loadSocialFeed(),
        ]);
        setIsInitialized(true);
      } catch (error: any) {
        Alert.alert('Initialization Error', error.message);
      }
    };

    if (!isInitialized) {
      initializeData();
    }
  }, []);

  // Handle tab change
  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    clearErrors();
  };

  // Handle workout completion
  const handleWorkoutComplete = (workoutId: string) => {
    Alert.alert(
      'Workout Complete! 🎉',
      'Your workout has been saved and is ready to share with the community.',
      [
        { text: 'View Feed', onPress: () => setActiveTab('feed') },
        { text: 'OK', style: 'default' },
      ]
    );
  };

  // Handle workout press from feed
  const handleWorkoutPress = (workoutId: string) => {
    Alert.alert(
      'View Workout Details',
      'This would open the detailed workout view with all exercises and sets.',
      [
        { text: 'Start Similar Workout', onPress: () => setActiveTab('workout') },
        { text: 'OK', style: 'default' },
      ]
    );
  };

  // Render tab content
  const renderTabContent = () => {
    switch (activeTab) {
      case 'library':
        return (
          <ConnectedExerciseLibrary
            mode="browse"
            showAddToWorkout={!!activeWorkout}
            showUsageStats={true}
          />
        );
      
      case 'workout':
        return (
          <ConnectedWorkoutTracker
            onWorkoutComplete={handleWorkoutComplete}
          />
        );
      
      case 'feed':
        return (
          <ConnectedSocialFeed
            onWorkoutPress={handleWorkoutPress}
            showCreatePost={true}
          />
        );
      
      default:
        return null;
    }
  };

  // Get tab badge count
  const getTabBadge = (tab: TabType) => {
    switch (tab) {
      case 'library':
        return exercises.length;
      case 'workout':
        return activeWorkout ? 1 : 0;
      case 'feed':
        return socialPosts.length;
      default:
        return 0;
    }
  };

  // Get tab icon
  const getTabIcon = (tab: TabType, isActive: boolean) => {
    const iconMap = {
      library: isActive ? 'library' : 'library-outline',
      workout: isActive ? 'barbell' : 'barbell-outline',
      feed: isActive ? 'people' : 'people-outline',
    };
    return iconMap[tab];
  };

  if (!isInitialized) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Ionicons name="sync" size={48} color="#007AFF" />
          <Text style={styles.loadingText}>Initializing Elite Locker...</Text>
          <Text style={styles.loadingSubtext}>
            Setting up unified data connections
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Elite Locker</Text>
        <Text style={styles.headerSubtitle}>Unified Fitness Experience</Text>
        
        <TouchableOpacity
          style={styles.syncButton}
          onPress={forceSync}
        >
          <Ionicons name="sync" size={20} color="#007AFF" />
          <Text style={styles.syncButtonText}>Sync</Text>
        </TouchableOpacity>
      </View>

      {/* Sync Status */}
      <SyncStatusIndicator position="top" showDetails={false} />

      {/* Data Overview */}
      <View style={styles.dataOverview}>
        <View style={styles.dataItem}>
          <Text style={styles.dataValue}>{exercises.length}</Text>
          <Text style={styles.dataLabel}>Exercises</Text>
        </View>
        <View style={styles.dataItem}>
          <Text style={styles.dataValue}>{activeWorkout ? '1' : '0'}</Text>
          <Text style={styles.dataLabel}>Active Workout</Text>
        </View>
        <View style={styles.dataItem}>
          <Text style={styles.dataValue}>{socialPosts.length}</Text>
          <Text style={styles.dataLabel}>Feed Posts</Text>
        </View>
      </View>

      {/* Tab Navigation */}
      <View style={styles.tabNavigation}>
        {(['library', 'workout', 'feed'] as TabType[]).map((tab) => {
          const isActive = activeTab === tab;
          const badge = getTabBadge(tab);
          
          return (
            <TouchableOpacity
              key={tab}
              style={[styles.tabButton, isActive && styles.activeTabButton]}
              onPress={() => handleTabChange(tab)}
            >
              <View style={styles.tabIconContainer}>
                <Ionicons
                  name={getTabIcon(tab, isActive) as any}
                  size={24}
                  color={isActive ? '#007AFF' : '#8E8E93'}
                />
                {badge > 0 && (
                  <View style={styles.tabBadge}>
                    <Text style={styles.tabBadgeText}>
                      {badge > 99 ? '99+' : badge.toString()}
                    </Text>
                  </View>
                )}
              </View>
              <Text style={[styles.tabLabel, isActive && styles.activeTabLabel]}>
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Tab Content */}
      <View style={styles.tabContent}>
        {renderTabContent()}
      </View>

      {/* Connection Status */}
      <View style={styles.connectionStatus}>
        <View style={styles.connectionItem}>
          <View style={[styles.connectionDot, { backgroundColor: '#34C759' }]} />
          <Text style={styles.connectionText}>Library ↔ Workout</Text>
        </View>
        <View style={styles.connectionItem}>
          <View style={[styles.connectionDot, { backgroundColor: '#34C759' }]} />
          <Text style={styles.connectionText}>Workout ↔ Feed</Text>
        </View>
        <View style={styles.connectionItem}>
          <View style={[styles.connectionDot, { backgroundColor: '#34C759' }]} />
          <Text style={styles.connectionText}>Real-time Sync</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  loadingText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '600',
    marginTop: 20,
    marginBottom: 8,
  },
  loadingSubtext: {
    color: '#8E8E93',
    fontSize: 16,
    textAlign: 'center',
  },
  header: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#1C1C1E',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '700',
  },
  headerSubtitle: {
    color: '#8E8E93',
    fontSize: 14,
    position: 'absolute',
    bottom: 20,
    left: 20,
  },
  syncButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1C1C1E',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  syncButtonText: {
    color: '#007AFF',
    fontSize: 14,
    fontWeight: '500',
  },
  dataOverview: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 16,
    backgroundColor: '#1C1C1E',
    marginHorizontal: 16,
    marginTop: 60, // Space for sync indicator
    borderRadius: 12,
  },
  dataItem: {
    alignItems: 'center',
  },
  dataValue: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 4,
  },
  dataLabel: {
    color: '#8E8E93',
    fontSize: 12,
  },
  tabNavigation: {
    flexDirection: 'row',
    backgroundColor: '#1C1C1E',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    padding: 4,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 8,
  },
  activeTabButton: {
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
  },
  tabIconContainer: {
    position: 'relative',
    marginBottom: 4,
  },
  tabBadge: {
    position: 'absolute',
    top: -6,
    right: -6,
    backgroundColor: '#FF3B30',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  tabBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
  },
  tabLabel: {
    color: '#8E8E93',
    fontSize: 12,
    fontWeight: '500',
  },
  activeTabLabel: {
    color: '#007AFF',
  },
  tabContent: {
    flex: 1,
    marginTop: 16,
  },
  connectionStatus: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 12,
    backgroundColor: '#1C1C1E',
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 8,
  },
  connectionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  connectionDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  connectionText: {
    color: '#8E8E93',
    fontSize: 10,
    fontWeight: '500',
  },
});
