import { colors, spacing, typography } from '../../../components/design-system/tokens';
import SyncManager from '../../../components/ui/SyncManager';
import { useConnectivity } from '../../../contexts/ConnectivityContext';
import { getUnresolvedConflicts } from '../../../lib/conflictResolution';
import {
    clearCache,
    getCacheStats,
    setCacheStorageLimit
} from '../../../lib/storage';
import { getPendingSyncOperations } from '../../../lib/syncManager';
import { Ionicons } from '@expo/vector-icons';
import { Stack } from 'expo-router';
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

export default function OfflineSettingsScreen() {
  const [isLoading, setIsLoading] = useState(true);
  const [cacheStats, setCacheStats] = useState(null);
  const [pendingOperations, setPendingOperations] = useState(0);
  const [conflicts, setConflicts] = useState(0);
  const [storageLimitMB, setStorageLimitMB] = useState(50);
  const { isConnected, isOfflineModeEnabled, setIsOfflineModeEnabled } = useConnectivity();

  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        
        // Get cache stats
        const stats = await getCacheStats();
        setCacheStats(stats);
        
        // Get pending operations count
        const operations = await getPendingSyncOperations();
        setPendingOperations(operations.length);
        
        // Get conflicts count
        const unresolvedConflicts = await getUnresolvedConflicts();
        setConflicts(unresolvedConflicts.length);
        
        setIsLoading(false);
      } catch (error) {
        console.error('Error loading offline settings data:', error);
        setIsLoading(false);
      }
    };
    
    loadData();
  }, []);

  // Handle clearing cache
  const handleClearCache = async () => {
    Alert.alert(
      'Clear Cache',
      'Are you sure you want to clear all cached data? This will remove all offline data that has not been synced.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            try {
              setIsLoading(true);
              await clearCache();
              const stats = await getCacheStats();
              setCacheStats(stats);
              setIsLoading(false);
              Alert.alert('Success', 'Cache cleared successfully');
            } catch (error) {
              console.error('Error clearing cache:', error);
              setIsLoading(false);
              Alert.alert('Error', 'Failed to clear cache');
            }
          },
        },
      ]
    );
  };

  // Handle storage limit change
  const handleStorageLimitChange = async (value) => {
    try {
      setStorageLimitMB(value);
      await setCacheStorageLimit(value * 1024 * 1024); // Convert MB to bytes
    } catch (error) {
      console.error('Error setting storage limit:', error);
    }
  };

  // Format bytes to human-readable size
  const formatBytes = (bytes, decimals = 2) => {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Offline Settings' }} />
      
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <ScrollView style={styles.scrollView}>
          {/* Offline Mode Toggle */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Offline Mode</Text>
            </View>
            
            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingTitle}>Enable Offline Mode</Text>
                <Text style={styles.settingDescription}>
                  When enabled, the app will work without an internet connection using cached data
                </Text>
              </View>
              <Switch
                value={isOfflineModeEnabled}
                onValueChange={setIsOfflineModeEnabled}
                trackColor={{ false: colors.gray[300], true: colors.primary }}
              />
            </View>
            
            <View style={styles.statusContainer}>
              <View style={styles.statusIndicator}>
                <View
                  style={[
                    styles.statusDot,
                    { backgroundColor: isConnected ? colors.success : colors.error }
                  ]}
                />
                <Text style={styles.statusText}>
                  {isConnected ? 'Connected' : 'Offline'}
                </Text>
              </View>
            </View>
          </View>
          
          {/* Sync Status */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Sync Status</Text>
            </View>
            
            <View style={styles.syncStatus}>
              <View style={styles.syncItem}>
                <Text style={styles.syncLabel}>Pending Operations</Text>
                <Text style={styles.syncValue}>{pendingOperations}</Text>
              </View>
              
              <View style={styles.syncItem}>
                <Text style={styles.syncLabel}>Conflicts</Text>
                <Text style={styles.syncValue}>{conflicts}</Text>
              </View>
            </View>
            
            <SyncManager />
          </View>
          
          {/* Cache Management */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Cache Management</Text>
            </View>
            
            {cacheStats && (
              <View style={styles.cacheStats}>
                <View style={styles.cacheItem}>
                  <Text style={styles.cacheLabel}>Used Space</Text>
                  <Text style={styles.cacheValue}>
                    {formatBytes(cacheStats.totalSize)}
                  </Text>
                </View>
                
                <View style={styles.cacheItem}>
                  <Text style={styles.cacheLabel}>Items</Text>
                  <Text style={styles.cacheValue}>{cacheStats.itemCount}</Text>
                </View>
              </View>
            )}
            
            <TouchableOpacity
              style={styles.button}
              onPress={handleClearCache}
            >
              <Ionicons name="trash-outline" size={20} color={colors.white} />
              <Text style={styles.buttonText}>Clear Cache</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  section: {
    marginBottom: spacing.lg,
    padding: spacing.md,
    backgroundColor: colors.card,
    borderRadius: 12,
    marginHorizontal: spacing.md,
  },
  sectionHeader: {
    marginBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingBottom: spacing.sm,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.text,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  settingInfo: {
    flex: 1,
    marginRight: spacing.md,
  },
  settingTitle: {
    ...typography.subtitle,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  settingDescription: {
    ...typography.body,
    color: colors.textSecondary,
  },
  statusContainer: {
    marginTop: spacing.sm,
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: spacing.sm,
  },
  statusText: {
    ...typography.body,
    color: colors.textSecondary,
  },
  syncStatus: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: spacing.md,
  },
  syncItem: {
    alignItems: 'center',
  },
  syncLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  syncValue: {
    ...typography.h2,
    color: colors.text,
  },
  cacheStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: spacing.md,
  },
  cacheItem: {
    alignItems: 'center',
  },
  cacheLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  cacheValue: {
    ...typography.h3,
    color: colors.text,
  },
  button: {
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.md,
    borderRadius: 8,
  },
  buttonText: {
    ...typography.button,
    color: colors.white,
    marginLeft: spacing.sm,
  },
});
