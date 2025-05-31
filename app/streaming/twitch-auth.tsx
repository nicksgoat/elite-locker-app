import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
// Only import WebView on mobile platforms
let WebView: any = null;
if (Platform.OS !== 'web') {
  try {
    WebView = require('react-native-webview').WebView;
  } catch (error) {
    console.warn('WebView not available on this platform');
  }
}

interface TwitchAuthState {
  isConnected: boolean;
  isLoading: boolean;
  twitchUsername: string | null;
  twitchUserId: string | null;
  showWebView: boolean;
  authUrl: string | null;
  showFallbackButton: boolean;
}

export default function TwitchAuthScreen() {
  const [state, setState] = useState<TwitchAuthState>({
    isConnected: false,
    isLoading: false,
    twitchUsername: null,
    twitchUserId: null,
    showWebView: false,
    authUrl: null,
    showFallbackButton: false,
  });

  useEffect(() => {
    loadTwitchStatus();
  }, []);

  const loadTwitchStatus = async () => {
    // TODO: Load saved Twitch connection status from storage
    // For now, we'll simulate checking the connection
    setState(prev => ({ ...prev, isLoading: true }));

    try {
      // Check if user has saved Twitch credentials
      // const savedAuth = await AsyncStorage.getItem('twitch_auth');
      // if (savedAuth) {
      //   const { username, userId } = JSON.parse(savedAuth);
      //   setState(prev => ({
      //     ...prev,
      //     isConnected: true,
      //     twitchUsername: username,
      //     twitchUserId: userId,
      //   }));
      // }
    } catch (error) {
      console.error('Error loading Twitch status:', error);
    } finally {
      setState(prev => ({ ...prev, isLoading: false }));
    }
  };

  const handleConnectTwitch = async () => {
    setState(prev => ({ ...prev, isLoading: true }));

    try {
      // Get authorization URL from backend
      const { ENDPOINTS } = require('../../config/api');
      const authUrl = `${ENDPOINTS.TWITCH_AUTH_URL}?userId=current-user`;

      console.log('Attempting to fetch Twitch auth URL...');
      console.log('URL:', authUrl);

      const response = await fetch(authUrl);

      console.log('Twitch auth response status:', response.status);
      console.log('Twitch auth response ok:', response.ok);

      const data = await response.json();
      console.log('Twitch auth response data:', data);

      if (data.success) {
        const authUrl = data.data.authUrl;

        if (Platform.OS === 'web') {
          // On web, open in a new window
          console.log('Opening Twitch auth in new window (web)');
          window.open(authUrl, 'twitchAuth', 'width=600,height=700,scrollbars=yes,resizable=yes');

          // Show instructions for web users
          Alert.alert(
            'Twitch Authorization',
            'A new window has opened for Twitch authorization. After completing the authorization, you may need to manually return to this page.',
            [
              { text: 'OK' },
              { text: 'Open URL Again', onPress: () => window.open(authUrl, 'twitchAuth', 'width=600,height=700,scrollbars=yes,resizable=yes') }
            ]
          );
        } else {
          // On mobile, use WebView
          console.log('Setting up WebView with URL:', authUrl);
          console.log('WebView available:', !!WebView);
          console.log('Platform:', Platform.OS);

          setState(prev => ({
            ...prev,
            authUrl: authUrl,
            showWebView: true,
            showFallbackButton: false,
          }));

          // Show fallback button after 5 seconds if WebView doesn't load
          setTimeout(() => {
            setState(prev => ({ ...prev, showFallbackButton: true }));
          }, 5000);
        }

        setState(prev => ({ ...prev, isLoading: false }));
      } else {
        throw new Error(data.error?.message || 'Failed to get auth URL');
      }
    } catch (error) {
      console.error('Error connecting to Twitch:', error);
      Alert.alert('Error', 'Failed to connect to Twitch. Please try again.');
      setState(prev => ({ ...prev, isLoading: false }));
    }
  };

  const handleDisconnectTwitch = async () => {
    Alert.alert(
      'Disconnect Twitch',
      'Are you sure you want to disconnect your Twitch account? This will disable chat bot and stream integration features.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Disconnect',
          style: 'destructive',
          onPress: async () => {
            setState(prev => ({ ...prev, isLoading: true }));

            try {
              // TODO: Call disconnect API
              // await disconnectTwitch();

              setState(prev => ({
                ...prev,
                isConnected: false,
                twitchUsername: null,
                twitchUserId: null,
                isLoading: false,
              }));

              Alert.alert('Success', 'Twitch account disconnected successfully.');
            } catch (error) {
              console.error('Error disconnecting Twitch:', error);
              Alert.alert('Error', 'Failed to disconnect Twitch account.');
              setState(prev => ({ ...prev, isLoading: false }));
            }
          },
        },
      ]
    );
  };

  const handleWebViewNavigationStateChange = (navState: any) => {
    const { url } = navState;

    // Check if this is the callback URL (support both localhost and IP address)
    if (url.includes('/api/twitch/callback')) {
      // The GET callback will handle the OAuth flow and show a success page
      // We'll wait for the WebView message instead of parsing URL params
      console.log('Reached Twitch callback URL:', url);
    }
  };

  const handleWebViewMessage = (event: any) => {
    try {
      const message = JSON.parse(event.nativeEvent.data);
      console.log('WebView message received:', message);

      if (message.type === 'TWITCH_AUTH_SUCCESS') {
        const { twitchUser } = message.data;

        setState(prev => ({
          ...prev,
          isConnected: true,
          twitchUsername: twitchUser.displayName,
          twitchUserId: twitchUser.id,
          showWebView: false,
          isLoading: false,
        }));

        // TODO: Save tokens and user info to secure storage

        Alert.alert(
          'Success!',
          `Successfully connected to Twitch as ${twitchUser.displayName}`,
          [{ text: 'OK', onPress: () => router.back() }]
        );
      } else if (message.type === 'TWITCH_AUTH_ERROR') {
        setState(prev => ({
          ...prev,
          showWebView: false,
          isLoading: false
        }));

        Alert.alert('Error', 'Failed to complete Twitch authentication.');
      }
    } catch (error) {
      console.error('Error parsing WebView message:', error);
    }
  };

  const handleAuthCallback = async (code: string, state: string) => {
    setState(prev => ({ ...prev, showWebView: false, isLoading: true }));

    try {
      const { ENDPOINTS } = require('../../config/api');
      const response = await fetch(ENDPOINTS.TWITCH_CALLBACK, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
          // Authorization temporarily removed for testing
        },
        body: JSON.stringify({
          code,
          state,
          userId: 'current-user', // TODO: Get real user ID
        }),
      });

      const data = await response.json();

      if (data.success) {
        const { twitchUser } = data.data;

        setState(prev => ({
          ...prev,
          isConnected: true,
          twitchUsername: twitchUser.displayName,
          twitchUserId: twitchUser.id,
          isLoading: false,
        }));

        // TODO: Save tokens and user info to secure storage

        Alert.alert(
          'Success!',
          `Successfully connected to Twitch as ${twitchUser.displayName}`,
          [{ text: 'OK', onPress: () => router.back() }]
        );
      } else {
        throw new Error(data.error?.message || 'Failed to authenticate');
      }
    } catch (error) {
      console.error('Error handling auth callback:', error);
      Alert.alert('Error', 'Failed to complete Twitch authentication.');
      setState(prev => ({ ...prev, isLoading: false }));
    }
  };

  // Debug WebView rendering
  console.log('WebView render check:', {
    showWebView: state.showWebView,
    hasAuthUrl: !!state.authUrl,
    platform: Platform.OS,
    webViewAvailable: !!WebView
  });

  if (state.showWebView && state.authUrl && Platform.OS !== 'web') {
    if (!WebView) {
      // Fallback if WebView is not available
      console.log('WebView not available, falling back to external browser');
      return (
        <SafeAreaView style={styles.container}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>WebView Not Available</Text>
            <Text style={styles.heroDescription}>
              WebView is not available on this platform. Please use the button below to open Twitch authorization in your browser.
            </Text>
            <TouchableOpacity
              style={[styles.actionButton, styles.connectButton]}
              onPress={() => {
                // Open in external browser
                if (typeof window !== 'undefined' && window.open) {
                  window.open(state.authUrl!, '_blank');
                } else {
                  Alert.alert('Open Browser', `Please open this URL in your browser: ${state.authUrl}`);
                }
              }}
            >
              <Text style={styles.actionButtonText}>Open in Browser</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: '#666', marginTop: 16 }]}
              onPress={() => setState(prev => ({ ...prev, showWebView: false }))}
            >
              <Text style={styles.actionButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      );
    }

    console.log('Rendering WebView with URL:', state.authUrl);
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.webViewHeader}>
          <TouchableOpacity
            onPress={() => setState(prev => ({ ...prev, showWebView: false }))}
            style={styles.closeButton}
          >
            <Ionicons name="close" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.webViewTitle}>Connect to Twitch</Text>
        </View>
        <WebView
          source={{ uri: state.authUrl }}
          onNavigationStateChange={handleWebViewNavigationStateChange}
          onMessage={handleWebViewMessage}
          onLoadStart={() => console.log('WebView load started')}
          onLoadEnd={() => console.log('WebView load ended')}
          onError={(syntheticEvent) => {
            const { nativeEvent } = syntheticEvent;
            console.error('WebView error:', nativeEvent);
            Alert.alert('WebView Error', `Failed to load Twitch page: ${nativeEvent.description}`);
          }}
          onHttpError={(syntheticEvent) => {
            const { nativeEvent } = syntheticEvent;
            console.error('WebView HTTP error:', nativeEvent);
            Alert.alert('Network Error', `HTTP ${nativeEvent.statusCode}: ${nativeEvent.description}`);
          }}
          style={styles.webView}
          startInLoadingState={true}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          allowsInlineMediaPlayback={true}
          mediaPlaybackRequiresUserAction={false}
          renderLoading={() => (
            <View style={styles.webViewLoading}>
              <ActivityIndicator size="large" color="#9146FF" />
              <Text style={styles.loadingText}>Loading Twitch...</Text>
            </View>
          )}
        />

        {/* Fallback button if WebView doesn't load */}
        {state.showFallbackButton && (
          <View style={styles.fallbackContainer}>
            <Text style={styles.fallbackText}>Having trouble loading?</Text>
            <TouchableOpacity
              style={[styles.actionButton, styles.connectButton, { marginHorizontal: 20 }]}
              onPress={() => {
                // Try to open in external browser
                const { Linking } = require('react-native');
                Linking.openURL(state.authUrl!).catch(() => {
                  Alert.alert('Error', 'Could not open browser. Please copy the URL manually.');
                });
              }}
            >
              <Ionicons name="open-outline" size={20} color="#FFFFFF" />
              <Text style={styles.actionButtonText}>Open in Browser</Text>
            </TouchableOpacity>
          </View>
        )}
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Twitch Integration</Text>
        </View>

        {/* Twitch Logo and Description */}
        <View style={styles.heroSection}>
          <View style={styles.twitchLogo}>
            <Ionicons name="logo-twitch" size={64} color="#9146FF" />
          </View>
          <Text style={styles.heroTitle}>Connect to Twitch</Text>
          <Text style={styles.heroDescription}>
            Integrate your Elite Locker workouts with Twitch for interactive streaming experiences
          </Text>
        </View>

        {/* Connection Status */}
        <View style={styles.section}>
          <View style={styles.statusCard}>
            <View style={styles.statusHeader}>
              <View style={[
                styles.statusIndicator,
                { backgroundColor: state.isConnected ? '#4CAF50' : '#F44336' }
              ]} />
              <Text style={styles.statusTitle}>
                {state.isConnected ? 'Connected' : 'Not Connected'}
              </Text>
            </View>

            {state.isConnected && state.twitchUsername && (
              <View style={styles.connectedInfo}>
                <Text style={styles.connectedLabel}>Connected as:</Text>
                <Text style={styles.connectedUsername}>{state.twitchUsername}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Features List */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Features</Text>
          <View style={styles.featuresList}>
            <View style={styles.featureItem}>
              <Ionicons name="chatbubbles-outline" size={24} color="#9146FF" />
              <View style={styles.featureText}>
                <Text style={styles.featureTitle}>Chat Bot Integration</Text>
                <Text style={styles.featureDescription}>
                  Viewers can use commands like !workout, !stats, !challenge
                </Text>
              </View>
            </View>

            <View style={styles.featureItem}>
              <Ionicons name="trophy-outline" size={24} color="#9146FF" />
              <View style={styles.featureText}>
                <Text style={styles.featureTitle}>Channel Point Rewards</Text>
                <Text style={styles.featureDescription}>
                  Let viewers spend points to add reps or choose exercises
                </Text>
              </View>
            </View>

            <View style={styles.featureItem}>
              <Ionicons name="tv-outline" size={24} color="#9146FF" />
              <View style={styles.featureText}>
                <Text style={styles.featureTitle}>Auto Stream Updates</Text>
                <Text style={styles.featureDescription}>
                  Automatically update stream title with current exercise
                </Text>
              </View>
            </View>

            <View style={styles.featureItem}>
              <Ionicons name="people-outline" size={24} color="#9146FF" />
              <View style={styles.featureText}>
                <Text style={styles.featureTitle}>Viewer Challenges</Text>
                <Text style={styles.featureDescription}>
                  Accept workout challenges from your community
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Action Button */}
        <View style={styles.actionSection}>
          {state.isConnected ? (
            <TouchableOpacity
              style={[styles.actionButton, styles.disconnectButton]}
              onPress={handleDisconnectTwitch}
              disabled={state.isLoading}
            >
              {state.isLoading ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <>
                  <Ionicons name="unlink-outline" size={20} color="#FFFFFF" />
                  <Text style={styles.actionButtonText}>Disconnect Twitch</Text>
                </>
              )}
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[styles.actionButton, styles.connectButton]}
              onPress={handleConnectTwitch}
              disabled={state.isLoading}
            >
              {state.isLoading ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <>
                  <Ionicons name="link-outline" size={20} color="#FFFFFF" />
                  <Text style={styles.actionButtonText}>Connect to Twitch</Text>
                </>
              )}
            </TouchableOpacity>
          )}
        </View>

        {/* Additional Settings */}
        {state.isConnected && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Twitch Settings</Text>

            <TouchableOpacity
              style={styles.settingRow}
              onPress={() => router.push('/streaming/chat-settings')}
            >
              <View style={styles.settingInfo}>
                <Text style={styles.settingTitle}>Chat Bot Settings</Text>
                <Text style={styles.settingDescription}>
                  Configure chat commands and responses
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#CCCCCC" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.settingRow}
              onPress={() => router.push('/streaming/channel-points')}
            >
              <View style={styles.settingInfo}>
                <Text style={styles.settingTitle}>Channel Point Rewards</Text>
                <Text style={styles.settingDescription}>
                  Set up interactive channel point rewards
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#CCCCCC" />
            </TouchableOpacity>
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
  heroSection: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  twitchLogo: {
    marginBottom: 20,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  heroDescription: {
    fontSize: 16,
    color: '#CCCCCC',
    textAlign: 'center',
    lineHeight: 24,
    maxWidth: 300,
  },
  section: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1A1A1A',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  statusCard: {
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    padding: 16,
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  statusTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  connectedInfo: {
    marginTop: 8,
  },
  connectedLabel: {
    fontSize: 14,
    color: '#CCCCCC',
  },
  connectedUsername: {
    fontSize: 16,
    fontWeight: '600',
    color: '#9146FF',
    marginTop: 4,
  },
  featuresList: {
    gap: 16,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  featureText: {
    flex: 1,
    marginLeft: 16,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 14,
    color: '#CCCCCC',
    lineHeight: 20,
  },
  actionSection: {
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    gap: 8,
  },
  connectButton: {
    backgroundColor: '#9146FF',
  },
  disconnectButton: {
    backgroundColor: '#F44336',
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#2A2A2A',
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
  webViewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#1A1A1A',
    borderBottomWidth: 1,
    borderBottomColor: '#2A2A2A',
  },
  closeButton: {
    marginRight: 16,
  },
  webViewTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  webView: {
    flex: 1,
  },
  webViewLoading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000000',
  },
  loadingText: {
    color: '#FFFFFF',
    fontSize: 16,
    marginTop: 16,
  },
  fallbackContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#1A1A1A',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#2A2A2A',
  },
  fallbackText: {
    color: '#CCCCCC',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 12,
  },
});
