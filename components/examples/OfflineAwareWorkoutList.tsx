/**
 * Elite Locker - Offline Aware Workout List Example
 * 
 * This component demonstrates how to implement offline support in a component
 * that fetches and displays workouts.
 */

import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useConnectivity } from '@/contexts/ConnectivityContext';
import { useSyncManager } from '@/lib/syncManager';
import { workoutService } from '@/services';
import withOfflineFallback from '@/components/hoc/withOfflineFallback';
import { colors, typography, spacing } from '@/components/design-system/tokens';

// Basic workout list component
function WorkoutListBase() {
  const [workouts, setWorkouts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { isConnected, isSupabaseConnected } = useConnectivity();
  const { processPendingSyncOperations } = useSyncManager();
  
  // Function to fetch workouts
  const fetchWorkouts = async () => {
    setIsLoading(true);
    try {
      const data = await workoutService.getWorkoutHistory();
      setWorkouts(data || []);
      setError(null);
    } catch (err: any) {
      setError(err);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Sync pending operations when we're back online
  useEffect(() => {
    if (isConnected && isSupabaseConnected) {
      processPendingSyncOperations().then(result => {
        if (result.success > 0) {
          console.log(`Synced ${result.success} operations`);
          // Refresh the data after syncing
          fetchWorkouts();
        }
      });
    }
  }, [isConnected, isSupabaseConnected]);
  
  // Fetch workouts on mount and when connectivity changes
  useEffect(() => {
    fetchWorkouts();
  }, []);
  
  // Render loading state
  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.dark.brand.primary} />
        <Text style={styles.loadingText}>Loading workouts...</Text>
      </View>
    );
  }
  
  // Render error state
  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Ionicons name="alert-circle" size={48} color={colors.dark.status.error} />
        <Text style={styles.errorText}>Error loading workouts</Text>
        <Text style={styles.errorSubtext}>{error.message}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchWorkouts}>
          <Text style={styles.retryText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }
  
  // Render empty state
  if (workouts.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <Ionicons name="fitness" size={48} color={colors.dark.text.secondary} />
        <Text style={styles.emptyText}>No workouts found</Text>
        <Text style={styles.emptySubtext}>Start tracking your workouts to see them here</Text>
      </View>
    );
  }
  
  // Render workout list
  return (
    <View style={styles.container}>
      <FlatList
        data={workouts}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.workoutItem}>
            <Text style={styles.workoutTitle}>{item.title}</Text>
            <Text style={styles.workoutDate}>{new Date(item.date).toLocaleDateString()}</Text>
            <Text style={styles.workoutDetails}>
              {item.exercises?.length || 0} exercises • {item.duration} min
            </Text>
          </View>
        )}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
}

// Wrap the component with offline fallback
const OfflineAwareWorkoutList = withOfflineFallback(WorkoutListBase, {
  requireSupabase: true,
  fallbackMessage: 'You need to be online to view your workouts',
  fallbackIcon: 'fitness',
});

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.dark.background.primary,
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.spacing.xl,
    backgroundColor: colors.dark.background.primary,
  },
  listContent: {
    padding: spacing.spacing.md,
  },
  workoutItem: {
    backgroundColor: colors.dark.background.secondary,
    borderRadius: spacing.layout.borderRadius.md,
    padding: spacing.spacing.lg,
    marginBottom: spacing.spacing.md,
  },
  workoutTitle: {
    ...typography.textVariants.title3,
    color: colors.dark.text.primary,
    marginBottom: spacing.spacing.xs,
  },
  workoutDate: {
    ...typography.textVariants.caption1,
    color: colors.dark.text.secondary,
    marginBottom: spacing.spacing.xs,
  },
  workoutDetails: {
    ...typography.textVariants.body,
    color: colors.dark.text.secondary,
  },
  loadingText: {
    ...typography.textVariants.body,
    color: colors.dark.text.secondary,
    marginTop: spacing.spacing.md,
  },
  errorText: {
    ...typography.textVariants.title3,
    color: colors.dark.text.primary,
    marginTop: spacing.spacing.md,
  },
  errorSubtext: {
    ...typography.textVariants.body,
    color: colors.dark.text.secondary,
    marginTop: spacing.spacing.xs,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: colors.dark.brand.primary,
    paddingVertical: spacing.spacing.sm,
    paddingHorizontal: spacing.spacing.lg,
    borderRadius: spacing.layout.borderRadius.sm,
    marginTop: spacing.spacing.md,
  },
  retryText: {
    ...typography.textVariants.button,
    color: colors.dark.text.inverse,
  },
  emptyText: {
    ...typography.textVariants.title3,
    color: colors.dark.text.primary,
    marginTop: spacing.spacing.md,
  },
  emptySubtext: {
    ...typography.textVariants.body,
    color: colors.dark.text.secondary,
    marginTop: spacing.spacing.xs,
    textAlign: 'center',
  },
});

export default OfflineAwareWorkoutList;
