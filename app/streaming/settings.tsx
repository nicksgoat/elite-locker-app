import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Clipboard,
    ScrollView,
    Share,
    StyleSheet,
    Switch,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Conditional import for QR code - fallback for web
let QRCode: any = null;
try {
  QRCode = require('react-native-qr-code-svg').default;
} catch (error) {
  // QR code library not available - will show text URL instead
  console.log('QR code library not available, using text fallback');
}

// Import streaming service with proper error handling
import { streamingService } from '../../services/StreamingService';

interface StreamingStatus {
  isStreaming: boolean;
  isConnected: boolean;
  overlayUrl: string | null;
  userId: string | null;
}

export default function StreamingSettingsScreen() {
  const [status, setStatus] = useState<StreamingStatus>({
    isStreaming: false,
    isConnected: false,
    overlayUrl: null,
    userId: null,
  });
  const [loading, setLoading] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected' | 'connecting'>('disconnected');

  useEffect(() => {
    const initializeStreaming = async () => {
      try {
        // Initialize streaming service with a user ID
        await streamingService.initialize('current-user'); // TODO: Get real user ID
        loadStreamingStatus();
        setupStreamingListeners();
      } catch (error) {
        console.error('Error initializing streaming settings:', error);
      }
    };

    initializeStreaming();

    return () => {
      try {
        streamingService.off('connected');
        streamingService.off('disconnected');
        streamingService.off('streamingEnabled');
        streamingService.off('streamingDisabled');
      } catch (error) {
        console.error('Error cleaning up streaming listeners:', error);
      }
    };
  }, []);

  const loadStreamingStatus = () => {
    try {
      const currentStatus = streamingService.getStreamingStatus();
      setStatus(currentStatus);
      setConnectionStatus(currentStatus.isConnected ? 'connected' : 'disconnected');
    } catch (error) {
      console.error('Error loading streaming status:', error);
      // Set default status if service is not available
      setStatus({
        isStreaming: false,
        isConnected: false,
        overlayUrl: null,
        userId: null,
      });
      setConnectionStatus('disconnected');
    }
  };

  const setupStreamingListeners = () => {
    try {
      streamingService.on('connected', () => {
        setConnectionStatus('connected');
        loadStreamingStatus();
      });

      streamingService.on('disconnected', () => {
        setConnectionStatus('disconnected');
        loadStreamingStatus();
      });

      streamingService.on('streamingEnabled', (data: { overlayUrl: string }) => {
        setStatus(prev => ({
          ...prev,
          isStreaming: true,
          overlayUrl: data.overlayUrl,
        }));
      });

      streamingService.on('streamingDisabled', () => {
        setStatus(prev => ({
          ...prev,
          isStreaming: false,
          overlayUrl: null,
        }));
      });
    } catch (error) {
      console.error('Error setting up streaming listeners:', error);
    }
  };

  const testConnection = async () => {
    try {
      console.log('Testing connection to backend...');
      const response = await fetch('http://127.0.0.1:3001/health');
      console.log('Health check response status:', response.status);
      const data = await response.json();
      console.log('Health check response data:', data);
      Alert.alert('Connection Test', `Backend is ${response.ok ? 'reachable' : 'not reachable'}`);
    } catch (error) {
      console.error('Connection test error:', error);
      Alert.alert('Connection Test', 'Failed to reach backend');
    }
  };

  const handleToggleStreaming = async () => {
    setLoading(true);
    try {
      if (status.isStreaming) {
        await streamingService.disableStreaming();
        Alert.alert('Success', 'Streaming has been disabled');
      } else {
        const result = await streamingService.enableStreaming();
        Alert.alert(
          'Streaming Enabled!',
          `Your overlay URL has been generated. Share it with your viewers or add it to your streaming software.`,
          [
            { text: 'OK' },
            { text: 'Share URL', onPress: () => shareOverlayUrl(result.overlayUrl) }
          ]
        );
      }
    } catch (error) {
      console.error('Streaming toggle error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Streaming service is not available. Please try again later.';
      Alert.alert('Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const shareOverlayUrl = async (url?: string) => {
    const overlayUrl = url || status.overlayUrl;
    if (!overlayUrl) return;

    const fullUrl = `https://overlay.elitelocker.app/${overlayUrl}`;

    try {
      await Share.share({
        message: `Check out my live workout stream: ${fullUrl}`,
        url: fullUrl,
        title: 'Elite Locker Live Workout Stream',
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const copyToClipboard = async () => {
    if (!status.overlayUrl) return;

    const fullUrl = `https://overlay.elitelocker.app/${status.overlayUrl}`;
    await Clipboard.setString(fullUrl);
    Alert.alert('Copied!', 'Overlay URL copied to clipboard');
  };

  const getConnectionStatusColor = () => {
    switch (connectionStatus) {
      case 'connected': return '#4CAF50';
      case 'connecting': return '#FF9800';
      case 'disconnected': return '#F44336';
      default: return '#9E9E9E';
    }
  };

  const getConnectionStatusText = () => {
    switch (connectionStatus) {
      case 'connected': return 'Connected';
      case 'connecting': return 'Connecting...';
      case 'disconnected': return 'Disconnected';
      default: return 'Unknown';
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Streaming Settings</Text>
        </View>

        {/* Connection Status */}
        <View style={styles.section}>
          <View style={styles.statusContainer}>
            <View style={[styles.statusIndicator, { backgroundColor: getConnectionStatusColor() }]} />
            <Text style={styles.statusText}>{getConnectionStatusText()}</Text>
          </View>
        </View>

        {/* Connection Test */}
        <View style={styles.section}>
          <TouchableOpacity
            style={[styles.settingRow, { backgroundColor: '#1A1A1A', borderRadius: 8, padding: 16, marginBottom: 16 }]}
            onPress={testConnection}
          >
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>Test Backend Connection</Text>
              <Text style={styles.settingDescription}>
                Test if the streaming backend is reachable
              </Text>
            </View>
            <Ionicons name="wifi-outline" size={20} color="#CCCCCC" />
          </TouchableOpacity>
        </View>

        {/* Main Streaming Toggle */}
        <View style={styles.section}>
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>Enable Live Streaming</Text>
              <Text style={styles.settingDescription}>
                Share your workouts live with viewers through a web overlay
              </Text>
            </View>
            <Switch
              value={status.isStreaming}
              onValueChange={handleToggleStreaming}
              disabled={loading}
              trackColor={{ false: '#3A3A3A', true: '#4CAF50' }}
              thumbColor={status.isStreaming ? '#FFFFFF' : '#CCCCCC'}
            />
          </View>
        </View>

        {/* Overlay URL Section */}
        {status.isStreaming && status.overlayUrl && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Overlay URL</Text>
            <View style={styles.urlContainer}>
              <Text style={styles.urlText}>
                https://overlay.elitelocker.app/{status.overlayUrl}
              </Text>
              <TouchableOpacity onPress={copyToClipboard} style={styles.copyButton}>
                <Ionicons name="copy-outline" size={20} color="#4CAF50" />
              </TouchableOpacity>
            </View>

            <View style={styles.actionButtons}>
              <TouchableOpacity onPress={() => shareOverlayUrl()} style={styles.actionButton}>
                <Ionicons name="share-outline" size={20} color="#FFFFFF" />
                <Text style={styles.actionButtonText}>Share URL</Text>
              </TouchableOpacity>
            </View>

            {/* QR Code */}
            <View style={styles.qrContainer}>
              <Text style={styles.qrTitle}>QR Code for Overlay</Text>
              <View style={styles.qrCodeWrapper}>
                {QRCode ? (
                  <QRCode
                    value={`https://overlay.elitelocker.app/${status.overlayUrl}`}
                    size={150}
                    backgroundColor="white"
                    color="black"
                  />
                ) : (
                  <View style={styles.qrFallback}>
                    <Text style={styles.qrFallbackText}>QR Code</Text>
                    <Text style={styles.qrFallbackSubtext}>
                      Install react-native-qr-code-svg to view QR code
                    </Text>
                  </View>
                )}
              </View>
              <Text style={styles.qrDescription}>
                {QRCode
                  ? "Scan this QR code to quickly access your overlay URL"
                  : "Copy the URL above to access your overlay"
                }
              </Text>
            </View>
          </View>
        )}

        {/* Instructions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>How to Use</Text>
          <View style={styles.instructionsList}>
            <View style={styles.instructionItem}>
              <Text style={styles.instructionNumber}>1</Text>
              <Text style={styles.instructionText}>
                Enable streaming above to generate your unique overlay URL
              </Text>
            </View>
            <View style={styles.instructionItem}>
              <Text style={styles.instructionNumber}>2</Text>
              <Text style={styles.instructionText}>
                Add the overlay URL as a browser source in OBS, Streamlabs, or your streaming software
              </Text>
            </View>
            <View style={styles.instructionItem}>
              <Text style={styles.instructionNumber}>3</Text>
              <Text style={styles.instructionText}>
                Start your workout and your live data will appear on the overlay
              </Text>
            </View>
            <View style={styles.instructionItem}>
              <Text style={styles.instructionNumber}>4</Text>
              <Text style={styles.instructionText}>
                Share the overlay URL with viewers who want to follow along
              </Text>
            </View>
          </View>
        </View>

        {/* Privacy Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Privacy & Data Sharing</Text>
          <TouchableOpacity
            style={styles.settingRow}
            onPress={() => router.push('/streaming/privacy')}
          >
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>Data Sharing Settings</Text>
              <Text style={styles.settingDescription}>
                Control what information is shared on your stream
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#CCCCCC" />
          </TouchableOpacity>
        </View>

        {/* Twitch Integration */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Twitch Integration</Text>
          <TouchableOpacity
            style={styles.settingRow}
            onPress={() => {
              console.log('Navigating to Twitch auth...');
              try {
                router.push('/streaming/twitch-auth');
              } catch (error) {
                console.error('Navigation error:', error);
                Alert.alert('Navigation Error', 'Failed to navigate to Twitch auth screen');
              }
            }}
          >
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>Connect to Twitch</Text>
              <Text style={styles.settingDescription}>
                Enable chat bot, channel points, and stream integration
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#CCCCCC" />
          </TouchableOpacity>
        </View>

        {/* Theme Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Overlay Appearance</Text>
          <TouchableOpacity
            style={styles.settingRow}
            onPress={() => router.push('/streaming/themes')}
          >
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>Theme & Colors</Text>
              <Text style={styles.settingDescription}>
                Customize the look of your overlay
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#CCCCCC" />
          </TouchableOpacity>
        </View>

        {loading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color="#4CAF50" />
            <Text style={styles.loadingText}>
              {status.isStreaming ? 'Disabling streaming...' : 'Enabling streaming...'}
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#2A2A2A',
  },
  backButton: {
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  section: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1A1A1A',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  statusText: {
    fontSize: 14,
    color: '#CCCCCC',
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  settingInfo: {
    flex: 1,
    marginRight: 16,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
    color: '#CCCCCC',
    lineHeight: 20,
  },
  urlContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1A1A',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  urlText: {
    flex: 1,
    fontSize: 14,
    color: '#4CAF50',
    fontFamily: 'monospace',
  },
  copyButton: {
    padding: 4,
  },
  actionButtons: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2A2A2A',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    marginRight: 12,
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 8,
  },
  qrContainer: {
    alignItems: 'center',
  },
  qrTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  qrCodeWrapper: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  qrFallback: {
    width: 150,
    height: 150,
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
  qrFallbackText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666666',
    marginBottom: 8,
  },
  qrFallbackSubtext: {
    fontSize: 10,
    color: '#999999',
    textAlign: 'center',
    paddingHorizontal: 8,
  },
  qrDescription: {
    fontSize: 12,
    color: '#CCCCCC',
    textAlign: 'center',
    maxWidth: 200,
  },
  instructionsList: {
    marginTop: 8,
  },
  instructionItem: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  instructionNumber: {
    width: 24,
    height: 24,
    backgroundColor: '#4CAF50',
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 24,
    borderRadius: 12,
    marginRight: 12,
  },
  instructionText: {
    flex: 1,
    fontSize: 14,
    color: '#CCCCCC',
    lineHeight: 20,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#FFFFFF',
    fontSize: 16,
    marginTop: 16,
  },
});
