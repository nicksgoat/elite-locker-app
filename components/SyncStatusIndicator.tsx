/**
 * Elite Locker - Sync Status Indicator Component
 * 
 * This component shows the real-time synchronization status between
 * the database and UI.
 */

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { useUnifiedSync } from '../contexts/UnifiedSyncContext';
import { getSyncStatistics } from '../utils/realtimeSync';

// Sync status indicator component
export const SyncStatusIndicator: React.FC<{
  position?: 'top' | 'bottom';
  showDetails?: boolean;
  onPress?: () => void;
}> = ({ 
  position = 'top', 
  showDetails = false, 
  onPress 
}) => {
  const { state } = useUnifiedSync();
  const [syncStats, setSyncStats] = useState<any>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const fadeAnim = new Animated.Value(1);

  // Update sync statistics
  useEffect(() => {
    const updateStats = () => {
      const stats = getSyncStatistics();
      setSyncStats(stats);
    };

    updateStats();
    const interval = setInterval(updateStats, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, []);

  // Animate sync indicator
  useEffect(() => {
    if (state.syncStatus.pendingOperations > 0) {
      // Pulse animation when syncing
      Animated.loop(
        Animated.sequence([
          Animated.timing(fadeAnim, {
            toValue: 0.3,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      // Stop animation when sync complete
      fadeAnim.setValue(1);
    }
  }, [state.syncStatus.pendingOperations, fadeAnim]);

  // Get sync status info
  const getSyncStatusInfo = () => {
    const { syncStatus } = state;
    
    if (!syncStatus.isInitialized) {
      return {
        status: 'initializing',
        color: '#FF9500',
        icon: '⚡',
        text: 'Initializing...'
      };
    }
    
    if (syncStatus.pendingOperations > 0) {
      return {
        status: 'syncing',
        color: '#007AFF',
        icon: '🔄',
        text: `Syncing ${syncStatus.pendingOperations} changes...`
      };
    }
    
    if (syncStatus.conflicts > 0) {
      return {
        status: 'conflicts',
        color: '#FF3B30',
        icon: '⚠️',
        text: `${syncStatus.conflicts} conflicts need resolution`
      };
    }
    
    if (!syncStatus.isOnline) {
      return {
        status: 'offline',
        color: '#8E8E93',
        icon: '📴',
        text: 'Offline - changes will sync when online'
      };
    }
    
    if (syncStatus.lastSync) {
      const timeSinceSync = Date.now() - syncStatus.lastSync;
      const minutesAgo = Math.floor(timeSinceSync / 60000);
      
      if (minutesAgo < 1) {
        return {
          status: 'synced',
          color: '#34C759',
          icon: '✅',
          text: 'Synced just now'
        };
      } else if (minutesAgo < 60) {
        return {
          status: 'synced',
          color: '#34C759',
          icon: '✅',
          text: `Synced ${minutesAgo}m ago`
        };
      } else {
        return {
          status: 'stale',
          color: '#FF9500',
          icon: '⏰',
          text: 'Data may be outdated'
        };
      }
    }
    
    return {
      status: 'unknown',
      color: '#8E8E93',
      icon: '❓',
      text: 'Sync status unknown'
    };
  };

  const statusInfo = getSyncStatusInfo();

  const handlePress = () => {
    if (onPress) {
      onPress();
    } else {
      setIsExpanded(!isExpanded);
    }
  };

  if (!showDetails && statusInfo.status === 'synced' && state.syncStatus.pendingOperations === 0) {
    // Hide indicator when everything is synced and no details requested
    return null;
  }

  return (
    <TouchableOpacity
      style={[
        styles.container,
        position === 'bottom' ? styles.bottomPosition : styles.topPosition,
        { backgroundColor: statusInfo.color + '20' }
      ]}
      onPress={handlePress}
      activeOpacity={0.7}
    >
      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        <View style={styles.statusRow}>
          <Text style={styles.icon}>{statusInfo.icon}</Text>
          <Text style={[styles.statusText, { color: statusInfo.color }]}>
            {statusInfo.text}
          </Text>
          {showDetails && (
            <Text style={styles.expandIcon}>
              {isExpanded ? '▼' : '▶'}
            </Text>
          )}
        </View>

        {(isExpanded || showDetails) && syncStats && (
          <View style={styles.detailsContainer}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Listeners:</Text>
              <Text style={styles.detailValue}>{syncStats.listeners}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Subscriptions:</Text>
              <Text style={styles.detailValue}>{syncStats.subscriptions}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Queue Size:</Text>
              <Text style={styles.detailValue}>{syncStats.queueSize}</Text>
            </View>
            {syncStats.unresolvedConflicts > 0 && (
              <View style={styles.detailRow}>
                <Text style={[styles.detailLabel, { color: '#FF3B30' }]}>Conflicts:</Text>
                <Text style={[styles.detailValue, { color: '#FF3B30' }]}>
                  {syncStats.unresolvedConflicts}
                </Text>
              </View>
            )}
          </View>
        )}
      </Animated.View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 16,
    right: 16,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    zIndex: 1000,
  },
  topPosition: {
    top: 60, // Below status bar
  },
  bottomPosition: {
    bottom: 100, // Above tab bar
  },
  content: {
    flex: 1,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    fontSize: 16,
    marginRight: 8,
  },
  statusText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
  },
  expandIcon: {
    fontSize: 12,
    color: '#8E8E93',
    marginLeft: 8,
  },
  detailsContainer: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  detailLabel: {
    fontSize: 12,
    color: '#8E8E93',
  },
  detailValue: {
    fontSize: 12,
    fontWeight: '500',
    color: '#000000',
  },
});

export default SyncStatusIndicator;
