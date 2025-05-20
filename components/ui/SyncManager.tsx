/**
 * Elite Locker - Sync Manager Component
 * 
 * This component provides a UI for managing offline data synchronization.
 * It shows the number of pending operations and allows the user to trigger
 * synchronization manually.
 */

import React, { useEffect, useRef, useState } from 'react';
import { 
  ActivityIndicator, 
  Animated, 
  Easing, 
  StyleSheet, 
  Text, 
  TouchableOpacity, 
  View, 
  Platform,
  ProgressBarAndroid
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useConnectivity } from '@/contexts/ConnectivityContext';
import { useSyncManager } from '@/lib/syncManager';
import { colors, typography, spacing } from '@/components/design-system/tokens';

interface SyncManagerProps {
  onSyncComplete?: () => void;
  expanded?: boolean;
}

const SyncManager: React.FC<SyncManagerProps> = ({ 
  onSyncComplete,
  expanded = false
}) => {
  const [pendingCount, setPendingCount] = useState<number>(0);
  const [conflictCount, setConflictCount] = useState<number>(0);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [isExpanded, setIsExpanded] = useState<boolean>(expanded);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const [syncProgress, setSyncProgress] = useState<{ processed: number; total: number }>({ processed: 0, total: 0 });
  const [syncResult, setSyncResult] = useState<{ success: number; conflicts: number } | null>(null);
  const { isConnected, isSupabaseConnected } = useConnectivity();
  const { 
    getPendingCount, 
    processPendingSyncOperations, 
    resolveAllConflicts,
    getConflictCount
  } = useSyncManager();
  
  const spinValue = useRef(new Animated.Value(0)).current;
  const expandAnimation = useRef(new Animated.Value(expanded ? 1 : 0)).current;
  
  // Start spinning animation
  const startSpinAnimation = () => {
    spinValue.setValue(0);
    Animated.loop(
      Animated.timing(spinValue, {
        toValue: 1,
        duration: 2000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();
  };
  
  // Stop spinning animation
  const stopSpinAnimation = () => {
    spinValue.stopAnimation();
  };
  
  // Toggle expanded state
  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
    Animated.timing(expandAnimation, {
      toValue: isExpanded ? 0 : 1,
      duration: 300,
      easing: Easing.inOut(Easing.ease),
      useNativeDriver: false,
    }).start();
  };
  
  // Check for pending operations and conflicts
  const checkStatus = async () => {
    const pending = await getPendingCount();
    setPendingCount(pending);
    
    const conflicts = await getConflictCount();
    setConflictCount(conflicts);
  };
  
  // Sync pending operations
  const syncPendingOperations = async () => {
    if (!isConnected || !isSupabaseConnected) {
      return;
    }
    
    setIsSyncing(true);
    setSyncResult(null);
    startSpinAnimation();
    
    try {
      const result = await processPendingSyncOperations({
        onProgress: (processed, total) => {
          setSyncProgress({ processed, total });
        },
        resolveConflicts: true
      });
      
      console.log(`Synced ${result.success} operations, ${result.conflicts} conflicts`);
      setSyncResult(result);
      
      // Update the pending count and conflict count
      await checkStatus();
      
      // Update the last sync time
      setLastSyncTime(new Date());
      
      // Call the onSyncComplete callback
      if (onSyncComplete) {
        onSyncComplete();
      }
      
      // If there are conflicts, try to resolve them
      if (result.conflicts > 0) {
        const resolvedCount = await resolveAllConflicts();
        console.log(`Resolved ${resolvedCount} conflicts automatically`);
        await checkStatus();
      }
    } catch (error) {
      console.error('Error syncing pending operations:', error);
    } finally {
      setIsSyncing(false);
      stopSpinAnimation();
    }
  };
  
  // Check for pending operations on mount and when connectivity changes
  useEffect(() => {
    checkStatus();
    
    // Auto-sync when we're back online
    if (isConnected && isSupabaseConnected && pendingCount > 0) {
      syncPendingOperations();
    }
    
    // Set up interval to check status
    const intervalId = setInterval(checkStatus, 30000); // Check every 30 seconds
    
    return () => {
      clearInterval(intervalId);
    };
  }, [isConnected, isSupabaseConnected]);
  
  // Update animation when isSyncing changes
  useEffect(() => {
    if (isSyncing) {
      startSpinAnimation();
    } else {
      stopSpinAnimation();
    }
  }, [isSyncing]);
  
  // If there are no pending operations or conflicts, and we're not syncing, don't render anything
  if (pendingCount === 0 && conflictCount === 0 && !isSyncing && !syncResult) {
    return null;
  }
  
  // Calculate progress percentage
  const progressPercentage = syncProgress.total > 0 
    ? (syncProgress.processed / syncProgress.total) * 100 
    : 0;
  
  // Create spin rotation
  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });
  
  // Create height animation for expanded view
  const expandHeight = expandAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 120], // Adjust based on content
  });
  
  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={styles.header}
        onPress={toggleExpanded}
        activeOpacity={0.7}
      >
        <Animated.View style={{ transform: [{ rotate: isSyncing ? spin : '0deg' }] }}>
          <Ionicons 
            name={isSyncing ? 'sync' : conflictCount > 0 ? 'alert-circle' : 'cloud-upload'} 
            size={24} 
            color={
              conflictCount > 0 
                ? colors.dark.status.warning 
                : colors.dark.text.primary
            } 
          />
        </Animated.View>
        
        <View style={styles.textContainer}>
          <Text style={styles.title}>
            {isSyncing 
              ? `Syncing data... (${syncProgress.processed}/${syncProgress.total})` 
              : conflictCount > 0
                ? `${conflictCount} ${conflictCount === 1 ? 'conflict' : 'conflicts'} detected`
                : `${pendingCount} ${pendingCount === 1 ? 'change' : 'changes'} pending`}
          </Text>
          
          {lastSyncTime && (
            <Text style={styles.subtitle}>
              Last synced: {lastSyncTime.toLocaleTimeString()}
            </Text>
          )}
        </View>
        
        {!isSyncing && isConnected && isSupabaseConnected && (pendingCount > 0 || conflictCount > 0) && (
          <TouchableOpacity 
            style={styles.syncButton}
            onPress={syncPendingOperations}
          >
            <Text style={styles.syncButtonText}>Sync Now</Text>
          </TouchableOpacity>
        )}
        
        {isSyncing && (
          <ActivityIndicator 
            size="small" 
            color={colors.dark.brand.primary} 
          />
        )}
        
        <Ionicons 
          name={isExpanded ? 'chevron-up' : 'chevron-down'} 
          size={16} 
          color={colors.dark.text.secondary} 
          style={styles.expandIcon}
        />
      </TouchableOpacity>
      
      {/* Progress bar for syncing */}
      {isSyncing && (
        <View style={styles.progressContainer}>
          {Platform.OS === 'android' ? (
            <ProgressBarAndroid 
              styleAttr="Horizontal"
              indeterminate={false}
              progress={progressPercentage / 100}
              color={colors.dark.brand.primary}
              style={styles.progressBar}
            />
          ) : (
            <View style={styles.progressBarContainer}>
              <View 
                style={[
                  styles.progressBarFill, 
                  { width: `${progressPercentage}%` }
                ]} 
              />
            </View>
          )}
          <Text style={styles.progressText}>
            {progressPercentage.toFixed(0)}%
          </Text>
        </View>
      )}
      
      {/* Expanded details */}
      {isExpanded && (
        <Animated.View style={[styles.expandedContent, { height: expandHeight }]}>
          {syncResult && (
            <View style={styles.resultContainer}>
              <Text style={styles.resultText}>
                Last sync result:
              </Text>
              <Text style={styles.resultDetail}>
                • {syncResult.success} operations synced successfully
              </Text>
              {syncResult.conflicts > 0 && (
                <Text style={[styles.resultDetail, { color: colors.dark.status.warning }]}>
                  • {syncResult.conflicts} conflicts detected
                </Text>
              )}
            </View>
          )}
          
          {conflictCount > 0 && (
            <View style={styles.conflictContainer}>
              <Text style={styles.conflictText}>
                Conflicts require your attention. Some data may have been changed both locally and on the server.
              </Text>
              <TouchableOpacity 
                style={styles.resolveButton}
                onPress={async () => {
                  const resolvedCount = await resolveAllConflicts();
                  await checkStatus();
                }}
              >
                <Text style={styles.resolveButtonText}>Resolve Automatically</Text>
              </TouchableOpacity>
            </View>
          )}
        </Animated.View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.dark.background.secondary,
    borderRadius: spacing.layout.borderRadius.md,
    margin: spacing.spacing.md,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.spacing.md,
  },
  textContainer: {
    flex: 1,
    marginLeft: spacing.spacing.md,
  },
  title: {
    ...typography.textVariants.body,
    color: colors.dark.text.primary,
  },
  subtitle: {
    ...typography.textVariants.caption1,
    color: colors.dark.text.secondary,
  },
  syncButton: {
    backgroundColor: colors.dark.brand.primary,
    paddingVertical: spacing.spacing.xs,
    paddingHorizontal: spacing.spacing.md,
    borderRadius: spacing.layout.borderRadius.sm,
    marginRight: spacing.spacing.sm,
  },
  syncButtonText: {
    ...typography.textVariants.button,
    color: colors.dark.text.inverse,
  },
  expandIcon: {
    marginLeft: spacing.spacing.xs,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.spacing.md,
    paddingBottom: spacing.spacing.md,
  },
  progressBarContainer: {
    flex: 1,
    height: 4,
    backgroundColor: colors.dark.background.tertiary,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBar: {
    flex: 1,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: colors.dark.brand.primary,
    borderRadius: 2,
  },
  progressText: {
    ...typography.textVariants.caption1,
    color: colors.dark.text.secondary,
    marginLeft: spacing.spacing.sm,
    width: 40,
    textAlign: 'right',
  },
  expandedContent: {
    padding: spacing.spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.dark.background.tertiary,
  },
  resultContainer: {
    marginBottom: spacing.spacing.md,
  },
  resultText: {
    ...typography.textVariants.body,
    color: colors.dark.text.primary,
    marginBottom: spacing.spacing.xs,
  },
  resultDetail: {
    ...typography.textVariants.caption1,
    color: colors.dark.text.secondary,
    marginLeft: spacing.spacing.sm,
  },
  conflictContainer: {
    backgroundColor: colors.dark.background.tertiary,
    padding: spacing.spacing.md,
    borderRadius: spacing.layout.borderRadius.sm,
    marginTop: spacing.spacing.sm,
  },
  conflictText: {
    ...typography.textVariants.caption1,
    color: colors.dark.text.secondary,
    marginBottom: spacing.spacing.sm,
  },
  resolveButton: {
    backgroundColor: colors.dark.brand.secondary,
    paddingVertical: spacing.spacing.xs,
    paddingHorizontal: spacing.spacing.md,
    borderRadius: spacing.layout.borderRadius.sm,
    alignSelf: 'flex-start',
  },
  resolveButtonText: {
    ...typography.textVariants.button,
    color: colors.dark.text.inverse,
  },
});

export default SyncManager;
