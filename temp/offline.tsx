import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Stack } from 'expo-router';
import { useConnectivity } from '@/contexts/ConnectivityContext';
import { getUnresolvedConflicts } from '@/lib/conflictResolution';
import {
  clearCache,
  getCacheStats,
  setCacheStorageLimit
} from '@/lib/storage';
import { getPendingSyncOperations } from '@/lib/syncManager';
import SyncManager from '@/components/ui/SyncManager';
import { colors, typography, spacing } from '@/components/design-system/tokens';

export default function OfflineSettingsScreen() {
  const [isLoading, setIsLoading] = useState(true);
  const [cacheStats, setCacheStats] = useState(null);
  const [pendingOperations, setPendingOperations] = useState(0);
  const [conflicts, setConflicts] = useState(0);
  const [storageLimitMB, setStorageLimitMB] = useState(10);
  
  const {
    isConnected,
    isSupabaseConnected,
    isBackgroundSyncEnabled,
    enableBackgroundSync,
    disableBackgroundSync
  } = useConnectivity();
  
  // Load data
  const loadData = async () => {
    setIsLoading(true);
    
    try {
      // Get cache stats
      const stats = await getCacheStats();
      setCacheStats(stats);
      setStorageLimitMB(Math.round(stats.storageLimit / (1024 * 1024)));
      
      // Get pending operations
      const operations = await getPendingSyncOperations();
      setPendingOperations(operations.length);
      
      // Get conflicts
      const unresolvedConflicts = await getUnresolvedConflicts();
      setConflicts(unresolvedConflicts.length);
    } catch (error) {
      console.error('Error loading offline settings data:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle clear cache
  const handleClearCache = async () => {
    Alert.alert(
      'Clear Cache',
      'Are you sure you want to clear all cached data? This will not affect your saved workouts or programs.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            setIsLoading(true);
            await clearCache();
            await loadData();
          },
        },
      ]
    );
  };
  
  // Handle storage limit change
  const handleStorageLimitChange = async (increase) => {
    const newLimit = increase 
      ? storageLimitMB + 5 
      : Math.max(1, storageLimitMB - 5);
    
    setStorageLimitMB(newLimit);
    await setCacheStorageLimit(newLimit * 1024 * 1024);
    await loadData();
  };
  
  // Handle background sync toggle
  const handleBackgroundSyncToggle = async (enabled) => {
    if (enabled) {
      await enableBackgroundSync();
    } else {
      await disableBackgroundSync();
    }
  };
  
  // Format bytes to human-readable size
  const formatBytes = (bytes) => {
    if (bytes < 1024) {
      return `${bytes} B`;
    } else if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(1)} KB`;
    } else {
      return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    }
  };
  
  // Load data on mount
  useEffect(() => {
    loadData();
  }, []);
  
  return (
    <ScrollView style={styles.container}>
      <Stack.Screen options={{ title: 'Offline Settings' }} />
      
      {/* Sync Manager */}
      <SyncManager expanded onSyncComplete={loadData} />
      
      {/* Connection Status */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Connection Status</Text>
        
        <View style={styles.statusRow}>
          <Ionicons 
            name={isConnected ? 'wifi' : 'wifi-outline'} 
            size={24} 
            color={
              isConnected 
                ? colors.dark.status.success 
                : colors.dark.status.error
            } 
          />
          <Text style={styles.statusText}>
            Network: {isConnected ? 'Connected' : 'Disconnected'}
          </Text>
        </View>
        
        <View style={styles.statusRow}>
          <Ionicons 
            name={isSupabaseConnected ? 'cloud-done' : 'cloud-offline'} 
            size={24} 
            color={
              isSupabaseConnected 
                ? colors.dark.status.success 
                : colors.dark.status.error
            } 
          />
          <Text style={styles.statusText}>
            Backend: {isSupabaseConnected ? 'Connected' : 'Disconnected'}
          </Text>
        </View>
      </View>
      
      {/* Cache Statistics */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Cache Statistics</Text>
        
        {isLoading ? (
          <ActivityIndicator 
            size="small" 
            color={colors.dark.brand.primary} 
          />
        ) : cacheStats ? (
          <>
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>Used Space:</Text>
              <Text style={styles.statValue}>
                {formatBytes(cacheStats.totalSize)} ({cacheStats.usagePercentage.toFixed(1)}%)
              </Text>
            </View>
            
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>Items:</Text>
              <Text style={styles.statValue}>{cacheStats.itemCount}</Text>
            </View>
            
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>Last Cleanup:</Text>
              <Text style={styles.statValue}>
                {cacheStats.lastCleanup.toLocaleString()}
              </Text>
            </View>
            
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>Storage Limit:</Text>
              <View style={styles.limitControls}>
                <TouchableOpacity
                  style={styles.limitButton}
                  onPress={() => handleStorageLimitChange(false)}
                  disabled={storageLimitMB <= 1}
                >
                  <Ionicons name="remove" size={16} color={colors.dark.text.inverse} />
                </TouchableOpacity>
                
                <Text style={styles.statValue}>{storageLimitMB} MB</Text>
                
                <TouchableOpacity
                  style={styles.limitButton}
                  onPress={() => handleStorageLimitChange(true)}
                >
                  <Ionicons name="add" size={16} color={colors.dark.text.inverse} />
                </TouchableOpacity>
              </View>
            </View>
            
            <TouchableOpacity
              style={styles.button}
              onPress={handleClearCache}
            >
              <Text style={styles.buttonText}>Clear Cache</Text>
            </TouchableOpacity>
          </>
        ) : (
          <Text style={styles.errorText}>Error loading cache statistics</Text>
        )}
      </View>
      
      {/* Background Sync */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Background Sync</Text>
        
        <View style={styles.settingRow}>
          <View style={styles.settingTextContainer}>
            <Text style={styles.settingLabel}>Enable Background Sync</Text>
            <Text style={styles.settingDescription}>
              Automatically sync data when the app is in the background
            </Text>
          </View>
          
          <Switch
            value={isBackgroundSyncEnabled}
            onValueChange={handleBackgroundSyncToggle}
            trackColor={{
              false: colors.dark.background.tertiary,
              true: colors.dark.brand.primary,
            }}
            thumbColor={colors.dark.text.inverse}
          />
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.dark.background.primary,
  },
  card: {
    backgroundColor: colors.dark.background.secondary,
    borderRadius: spacing.layout.borderRadius.md,
    padding: spacing.spacing.lg,
    margin: spacing.spacing.md,
  },
  cardTitle: {
    ...typography.textVariants.title3,
    color: colors.dark.text.primary,
    marginBottom: spacing.spacing.md,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.spacing.sm,
  },
  statusText: {
    ...typography.textVariants.body,
    color: colors.dark.text.primary,
    marginLeft: spacing.spacing.md,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.spacing.sm,
  },
  statLabel: {
    ...typography.textVariants.body,
    color: colors.dark.text.secondary,
  },
  statValue: {
    ...typography.textVariants.body,
    color: colors.dark.text.primary,
  },
  limitControls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  limitButton: {
    backgroundColor: colors.dark.brand.primary,
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: spacing.spacing.sm,
  },
  button: {
    backgroundColor: colors.dark.brand.primary,
    paddingVertical: spacing.spacing.sm,
    paddingHorizontal: spacing.spacing.md,
    borderRadius: spacing.layout.borderRadius.sm,
    alignItems: 'center',
    marginTop: spacing.spacing.md,
  },
  buttonText: {
    ...typography.textVariants.button,
    color: colors.dark.text.inverse,
  },
  errorText: {
    ...typography.textVariants.body,
    color: colors.dark.status.error,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  settingTextContainer: {
    flex: 1,
    marginRight: spacing.spacing.md,
  },
  settingLabel: {
    ...typography.textVariants.body,
    color: colors.dark.text.primary,
  },
  settingDescription: {
    ...typography.textVariants.caption1,
    color: colors.dark.text.secondary,
  },
});
