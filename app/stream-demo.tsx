/**
 * Elite Locker - Stream Chat Demo Screen
 * 
 * This screen demonstrates the Stream Chat integration for
 * social feed and messaging functionality.
 */

import React, { useState } from 'react';
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
import { useStreamChat } from '../contexts/StreamChatContext';
import { StreamSocialFeed } from '../components/stream/StreamSocialFeed';
import { StreamMessaging } from '../components/stream/StreamMessaging';
import {
  getStreamModeInfo,
  setStreamMode,
  isProductionConfigured,
  type StreamMode
} from '../lib/streamModeToggle';

type TabType = 'feed' | 'messaging' | 'info';

export default function StreamDemoScreen() {
  // Stream Chat context
  const {
    client,
    isConnected,
    isLoading,
    error,
    currentUser,
    connectUser,
    disconnectUser,
    clearError,
    refreshConnection,
  } = useStreamChat();

  // Local state
  const [activeTab, setActiveTab] = useState<TabType>('feed');
  const [modeInfo, setModeInfo] = useState<any>(null);
  const [switchingMode, setSwitchingMode] = useState(false);

  // Handle tab change
  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
  };

  // Load mode info on mount
  React.useEffect(() => {
    loadModeInfo();
  }, []);

  // Load mode info
  const loadModeInfo = async () => {
    try {
      const info = await getStreamModeInfo();
      setModeInfo(info);
    } catch (error: any) {
      console.error('Failed to load mode info:', error);
    }
  };

  // Handle mode switch
  const handleModeSwitch = async (newMode: StreamMode) => {
    if (switchingMode) return;

    setSwitchingMode(true);
    try {
      await setStreamMode(newMode);
      await loadModeInfo();

      // Reconnect with new mode
      await disconnectUser();
      if (newMode === 'demo') {
        await connectUser('demo-user-1');
      }

      Alert.alert('Success', `Switched to ${newMode} mode. ${newMode === 'production' ? 'Please authenticate with your real account.' : 'Using demo data.'}`);
    } catch (error: any) {
      Alert.alert('Error', `Failed to switch mode: ${error.message}`);
    } finally {
      setSwitchingMode(false);
    }
  };

  // Handle connect different user
  const handleConnectUser = async (userId: string) => {
    try {
      await disconnectUser();
      await connectUser(userId);
      Alert.alert('Success', `Connected as ${userId}`);
    } catch (error: any) {
      Alert.alert('Error', `Failed to connect: ${error.message}`);
    }
  };

  // Render tab content
  const renderTabContent = () => {
    switch (activeTab) {
      case 'feed':
        return (
          <StreamSocialFeed
            onWorkoutPress={(workoutData) => {
              Alert.alert(
                'Workout Details',
                `${workoutData.name}\n\nSets: ${workoutData.stats?.totalSets || 0}\nVolume: ${workoutData.stats?.totalVolume || 0} lbs`,
                [{ text: 'OK' }]
              );
            }}
            showCreatePost={true}
          />
        );
      
      case 'messaging':
        return (
          <StreamMessaging
            showChannelList={true}
          />
        );
      
      case 'info':
        return (
          <ScrollView style={styles.infoContent} contentContainerStyle={styles.infoContainer}>
            <View style={styles.infoSection}>
              <Text style={styles.infoTitle}>Stream Chat Integration</Text>
              <Text style={styles.infoText}>
                This demo showcases the integration of Stream Chat API for real-time
                social feed and messaging functionality in Elite Locker.
              </Text>
            </View>

            {/* Mode Information */}
            {modeInfo && (
              <View style={styles.infoSection}>
                <Text style={styles.infoSectionTitle}>Current Mode:</Text>
                <View style={styles.modeContainer}>
                  <View style={[
                    styles.modeIndicator,
                    { backgroundColor: modeInfo.currentMode === 'production' ? '#34C759' : '#FF9500' }
                  ]}>
                    <Text style={styles.modeText}>
                      {modeInfo.currentMode.toUpperCase()}
                    </Text>
                  </View>
                  <Text style={styles.modeDescription}>
                    {modeInfo.description}
                  </Text>
                </View>

                <View style={styles.modeFeatures}>
                  <Text style={styles.featuresTitle}>Current Features:</Text>
                  {modeInfo.features.map((feature: string, index: number) => (
                    <Text key={index} style={styles.featureItem}>• {feature}</Text>
                  ))}
                </View>

                {/* Mode Switch Buttons */}
                <View style={styles.modeSwitchContainer}>
                  <TouchableOpacity
                    style={[
                      styles.modeSwitchButton,
                      modeInfo.currentMode === 'demo' && styles.activeModeButton
                    ]}
                    onPress={() => handleModeSwitch('demo')}
                    disabled={switchingMode || modeInfo.currentMode === 'demo'}
                  >
                    <Text style={[
                      styles.modeSwitchText,
                      modeInfo.currentMode === 'demo' && styles.activeModeText
                    ]}>
                      Demo Mode
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.modeSwitchButton,
                      modeInfo.currentMode === 'production' && styles.activeModeButton,
                      !modeInfo.canSwitchToProduction && styles.disabledModeButton
                    ]}
                    onPress={() => handleModeSwitch('production')}
                    disabled={switchingMode || modeInfo.currentMode === 'production' || !modeInfo.canSwitchToProduction}
                  >
                    <Text style={[
                      styles.modeSwitchText,
                      modeInfo.currentMode === 'production' && styles.activeModeText,
                      !modeInfo.canSwitchToProduction && styles.disabledModeText
                    ]}>
                      Production Mode
                    </Text>
                  </TouchableOpacity>
                </View>

                {!modeInfo.canSwitchToProduction && (
                  <Text style={styles.productionWarning}>
                    ⚠️ Production mode requires proper environment configuration.
                    See docs/PRODUCTION_SETUP.md for setup instructions.
                  </Text>
                )}
              </View>
            )}

            <View style={styles.infoSection}>
              <Text style={styles.infoSectionTitle}>Features:</Text>
              <View style={styles.featureList}>
                <Text style={styles.featureItem}>• Real-time social feed</Text>
                <Text style={styles.featureItem}>• Workout sharing with rich cards</Text>
                <Text style={styles.featureItem}>• Direct messaging</Text>
                <Text style={styles.featureItem}>• Group conversations</Text>
                <Text style={styles.featureItem}>• Message threads</Text>
                <Text style={styles.featureItem}>• File attachments</Text>
                <Text style={styles.featureItem}>• User presence indicators</Text>
                <Text style={styles.featureItem}>• Push notifications</Text>
              </View>
            </View>

            <View style={styles.infoSection}>
              <Text style={styles.infoSectionTitle}>Connection Status:</Text>
              <View style={styles.statusContainer}>
                <View style={[styles.statusDot, { backgroundColor: isConnected ? '#34C759' : '#FF3B30' }]} />
                <Text style={styles.statusText}>
                  {isConnected ? 'Connected' : 'Disconnected'}
                </Text>
              </View>
              {currentUser && (
                <Text style={styles.userInfo}>
                  Logged in as: {currentUser.name} ({currentUser.id})
                </Text>
              )}
            </View>

            <View style={styles.infoSection}>
              <Text style={styles.infoSectionTitle}>Demo Users:</Text>
              <View style={styles.demoUsers}>
                {['demo-user-1', 'demo-user-2', 'demo-user-3', 'fitness-coach'].map((userId) => (
                  <TouchableOpacity
                    key={userId}
                    style={[
                      styles.demoUserButton,
                      currentUser?.id === userId && styles.activeDemoUser
                    ]}
                    onPress={() => handleConnectUser(userId)}
                    disabled={isLoading}
                  >
                    <Text style={[
                      styles.demoUserText,
                      currentUser?.id === userId && styles.activeDemoUserText
                    ]}>
                      {userId}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.infoSection}>
              <Text style={styles.infoSectionTitle}>Actions:</Text>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={refreshConnection}
                disabled={isLoading}
              >
                <Ionicons name="refresh" size={20} color="#007AFF" />
                <Text style={styles.actionButtonText}>Refresh Connection</Text>
              </TouchableOpacity>
              
              {error && (
                <TouchableOpacity
                  style={[styles.actionButton, styles.errorButton]}
                  onPress={clearError}
                >
                  <Ionicons name="close-circle" size={20} color="#FF3B30" />
                  <Text style={[styles.actionButtonText, styles.errorButtonText]}>Clear Error</Text>
                </TouchableOpacity>
              )}
            </View>

            {error && (
              <View style={styles.errorSection}>
                <Text style={styles.errorTitle}>Error:</Text>
                <Text style={styles.errorMessage}>{error}</Text>
              </View>
            )}
          </ScrollView>
        );
      
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Stream Chat Demo</Text>
        <View style={styles.connectionIndicator}>
          <View style={[styles.connectionDot, { backgroundColor: isConnected ? '#34C759' : '#FF3B30' }]} />
          <Text style={styles.connectionText}>
            {isLoading ? 'Connecting...' : isConnected ? 'Online' : 'Offline'}
          </Text>
        </View>
      </View>

      {/* Tab Navigation */}
      <View style={styles.tabNavigation}>
        {(['feed', 'messaging', 'info'] as TabType[]).map((tab) => {
          const isActive = activeTab === tab;
          const iconMap = {
            feed: isActive ? 'people' : 'people-outline',
            messaging: isActive ? 'chatbubbles' : 'chatbubbles-outline',
            info: isActive ? 'information-circle' : 'information-circle-outline',
          };
          
          return (
            <TouchableOpacity
              key={tab}
              style={[styles.tabButton, isActive && styles.activeTabButton]}
              onPress={() => handleTabChange(tab)}
            >
              <Ionicons
                name={iconMap[tab] as any}
                size={24}
                color={isActive ? '#007AFF' : '#8E8E93'}
              />
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
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#1C1C1E',
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '700',
  },
  connectionIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  connectionDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  connectionText: {
    color: '#8E8E93',
    fontSize: 14,
    fontWeight: '500',
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
  tabLabel: {
    color: '#8E8E93',
    fontSize: 12,
    fontWeight: '500',
    marginTop: 4,
  },
  activeTabLabel: {
    color: '#007AFF',
  },
  tabContent: {
    flex: 1,
    marginTop: 16,
  },
  infoContent: {
    flex: 1,
  },
  infoContainer: {
    padding: 20,
  },
  infoSection: {
    marginBottom: 24,
  },
  infoTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 12,
  },
  infoSectionTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  infoText: {
    color: '#8E8E93',
    fontSize: 14,
    lineHeight: 20,
  },
  featureList: {
    marginLeft: 8,
  },
  featureItem: {
    color: '#8E8E93',
    fontSize: 14,
    marginBottom: 4,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
  userInfo: {
    color: '#8E8E93',
    fontSize: 12,
  },
  demoUsers: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  demoUserButton: {
    backgroundColor: '#1C1C1E',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  activeDemoUser: {
    backgroundColor: '#007AFF',
  },
  demoUserText: {
    color: '#8E8E93',
    fontSize: 12,
    fontWeight: '500',
  },
  activeDemoUserText: {
    color: '#FFFFFF',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1C1C1E',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 8,
    gap: 8,
  },
  errorButton: {
    backgroundColor: 'rgba(255, 59, 48, 0.1)',
  },
  actionButtonText: {
    color: '#007AFF',
    fontSize: 14,
    fontWeight: '500',
  },
  errorButtonText: {
    color: '#FF3B30',
  },
  errorSection: {
    backgroundColor: 'rgba(255, 59, 48, 0.1)',
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 59, 48, 0.3)',
  },
  errorTitle: {
    color: '#FF3B30',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  errorMessage: {
    color: '#FF3B30',
    fontSize: 14,
  },
  modeContainer: {
    backgroundColor: '#1C1C1E',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  modeIndicator: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginBottom: 8,
  },
  modeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  modeDescription: {
    color: '#8E8E93',
    fontSize: 14,
    lineHeight: 20,
  },
  modeFeatures: {
    marginBottom: 16,
  },
  featuresTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  modeSwitchContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  modeSwitchButton: {
    flex: 1,
    backgroundColor: '#1C1C1E',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  activeModeButton: {
    backgroundColor: '#007AFF',
  },
  disabledModeButton: {
    backgroundColor: '#2C2C2E',
    opacity: 0.5,
  },
  modeSwitchText: {
    color: '#8E8E93',
    fontSize: 14,
    fontWeight: '500',
  },
  activeModeText: {
    color: '#FFFFFF',
  },
  disabledModeText: {
    color: '#48484A',
  },
  productionWarning: {
    color: '#FF9500',
    fontSize: 12,
    lineHeight: 16,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});
