import ErrorBoundary from '@/components/ui/ErrorBoundary';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { usePathname, useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
    Dimensions,
    Modal,
    StyleSheet,
    Text,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View
} from 'react-native';
import Animated, {
    Extrapolate,
    interpolate,
    useAnimatedStyle,
    useSharedValue,
    withTiming
} from 'react-native-reanimated';

// Define the type for action items
interface TabActionItem {
  id: string;
  icon: string;
  label: string;
  color?: string;
  bgColor?: string;
  onPress: () => void;
}

// Define navigation options with icons
const NAV_OPTIONS = [
  {
    label: 'Home',
    path: '/(tabs)/',
    icon: 'home',
    outlineIcon: 'home-outline'
  },
  {
    label: 'Training',
    path: '/(tabs)/training',
    icon: 'fitness',
    outlineIcon: 'fitness-outline'
  },
  {
    label: 'Social',
    path: '/(tabs)/social',
    icon: 'people',
    outlineIcon: 'people-outline'
  },
  {
    label: 'Profile',
    path: '/(tabs)/profile',
    icon: 'person',
    outlineIcon: 'person-outline'
  },
];

/**
 * iOS iMessage-styled bottom navigation bar with glassmorphism effect
 */
export default function SimpleBottomNavBar() {
  return (
    <ErrorBoundary
      fallback={
        <View style={styles.container}>
          <Text style={styles.errorText}>Navigation Error</Text>
        </View>
      }
    >
      <SimpleNavBarContent />
    </ErrorBoundary>
  );
}

// Tab Action Popup Component
const TabActionPopup: React.FC<{
  visible: boolean;
  onClose: () => void;
  actions: TabActionItem[];
  tabName: string;
}> = ({ visible, onClose, actions, tabName }) => {
  // Handle action press
  const handleActionPress = (action: TabActionItem) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onClose();
    action.onPress();
  };

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.modalOverlay}>
          <TouchableWithoutFeedback>
            <View style={styles.popupContainer}>
              <BlurView intensity={80} tint="dark" style={styles.popupBlur}>
                {/* Title */}
                <View style={styles.titleContainer}>
                  <Text style={styles.title}>{`${tabName} Options`}</Text>
                </View>

                {/* Actions */}
                <View style={styles.actionsContainer}>
                  {actions.map((action) => (
                    <TouchableOpacity
                      key={action.id}
                      style={styles.actionItem}
                      onPress={() => handleActionPress(action)}
                      activeOpacity={0.7}
                    >
                      <View
                        style={[
                          styles.actionIcon,
                          { backgroundColor: action.bgColor || '#0A84FF' }
                        ]}
                      >
                        <Ionicons
                          name={action.icon}
                          size={24}
                          color={action.color || '#FFFFFF'}
                        />
                      </View>
                      <Text style={styles.actionText}>{action.label}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </BlurView>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

function SimpleNavBarContent() {
  const router = useRouter();
  const pathname = usePathname() || '';
  const [popupVisible, setPopupVisible] = useState(false);
  const [activeTabIndex, setActiveTabIndex] = useState(-1);
  const lastTapTimeRef = useRef<{ [key: number]: number }>({});

  // Animation values for each tab
  const tabAnimations = NAV_OPTIONS.map(() => useSharedValue(0));
  const indicatorPosition = useSharedValue(0);
  const indicatorWidth = useSharedValue(0);

  // Navigation handler with haptic feedback and animation
  const navigate = (path: string, index: number) => {
    try {
      const now = Date.now();
      const lastTap = lastTapTimeRef.current[index] || 0;
      const isActive = isTabActive(index);

      // Update last tap time
      lastTapTimeRef.current[index] = now;

      // Check if this is a double tap or tap on active tab
      if ((now - lastTap < 300) || isActive) {
        // This is a double tap or tap on active tab - show popup
        showTabPopup(index);
        return;
      }

      // Regular navigation
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

      // Animate all tabs
      tabAnimations.forEach((anim, i) => {
        anim.value = withTiming(i === index ? 1 : 0, { duration: 300 });
      });

      // Use router.replace instead of push to avoid stacking navigation
      router.replace(path as any);
    } catch (error) {
      console.error('Navigation error:', error);
      // Log additional context for debugging
      console.log('Current pathname:', pathname);
      console.log('Attempted navigation to:', path);
    }
  };

  // Check if a tab is active
  const isTabActive = (index: number): boolean => {
    const option = NAV_OPTIONS[index];
    if (!option) return false;

    if (option.path === '/(tabs)/' && (pathname === '/(tabs)/' || pathname === '/')) {
      return true;
    } else if (option.path !== '/(tabs)/' && pathname.startsWith(option.path)) {
      return true;
    }

    return false;
  };

  // Show tab popup
  const showTabPopup = (index: number) => {
    // Provide haptic feedback
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    // Set active tab index and show popup
    setActiveTabIndex(index);
    setPopupVisible(true);
  };

  // Close popup
  const closePopup = () => {
    setPopupVisible(false);
  };

  // Get actions for the tab
  const getTabActions = (index: number): TabActionItem[] => {
    const option = NAV_OPTIONS[index];
    if (!option) return [];

    // Define common actions
    const actions: TabActionItem[] = [];

    // Add tab-specific actions
    switch (option.label) {
      case 'Home':
        actions.push(
          {
            id: 'refresh',
            icon: 'refresh-outline',
            label: 'Refresh Home',
            bgColor: '#5AC8FA',
            onPress: () => router.replace('/(tabs)/')
          },
          {
            id: 'settings',
            icon: 'settings-outline',
            label: 'Home Settings',
            bgColor: '#FF9500',
            onPress: () => router.push('/settings')
          }
        );
        break;

      case 'Training':
        actions.push(
          {
            id: 'new-workout',
            icon: 'add-outline',
            label: 'New Workout',
            bgColor: '#FF2D55',
            onPress: () => router.push('/workout/create')
          },
          {
            id: 'programs',
            icon: 'calendar-outline',
            label: 'My Programs',
            bgColor: '#5856D6',
            onPress: () => router.push('/programs')
          },
          {
            id: 'exercises',
            icon: 'barbell-outline',
            label: 'Exercise Library',
            bgColor: '#FF9500',
            onPress: () => router.push('/exercises')
          }
        );
        break;

      case 'Social':
        actions.push(
          {
            id: 'new-post',
            icon: 'create-outline',
            label: 'New Post',
            bgColor: '#5AC8FA',
            onPress: () => router.push('/social/post/create')
          },
          {
            id: 'my-clubs',
            icon: 'people-outline',
            label: 'My Clubs',
            bgColor: '#FF9500',
            onPress: () => router.push('/clubs')
          },
          {
            id: 'messages',
            icon: 'chatbubble-outline',
            label: 'Messages',
            bgColor: '#34C759',
            onPress: () => router.push('/messages')
          }
        );
        break;

      case 'Profile':
        actions.push(
          {
            id: 'edit-profile',
            icon: 'create-outline',
            label: 'Edit Profile',
            bgColor: '#5AC8FA',
            onPress: () => router.push('/profile/edit')
          },
          {
            id: 'settings',
            icon: 'settings-outline',
            label: 'Settings',
            bgColor: '#8E8E93',
            onPress: () => router.push('/settings')
          },
          {
            id: 'stats',
            icon: 'stats-chart-outline',
            label: 'My Stats',
            bgColor: '#FF9500',
            onPress: () => router.push('/profile/stats')
          }
        );
        break;
    }

    return actions;
  };

  // Set initial active tab animation
  useEffect(() => {
    NAV_OPTIONS.forEach((option, index) => {
      let isActive = false;

      // Check if this tab is active
      if (option.path === '/(tabs)/' && (pathname === '/(tabs)/' || pathname === '/')) {
        isActive = true;
      } else if (option.path !== '/(tabs)/' && pathname.startsWith(option.path)) {
        isActive = true;
      }

      // Set animation value
      if (isActive) {
        tabAnimations[index].value = 1;
      }
    });
  }, [pathname]);

  return (
    <>
      <View style={styles.outerContainer}>
        <BlurView intensity={60} tint="dark" style={styles.blurContainer}>
          {/* Subtle gradient overlay for enhanced glassmorphism */}
          <View style={styles.gradientOverlay} />
          <View style={styles.container}>
            {NAV_OPTIONS.map((option, index) => {
              // Determine if this tab is active
              const isActive = isTabActive(index);

              // Create animated styles for this tab
              const animatedIconStyle = useAnimatedStyle(() => {
                const scale = interpolate(
                  tabAnimations[index].value,
                  [0, 1],
                  [1, 1.2],
                  Extrapolate.CLAMP
                );

                return {
                  transform: [{ scale }]
                };
              });

              const animatedTextStyle = useAnimatedStyle(() => {
                const opacity = interpolate(
                  tabAnimations[index].value,
                  [0, 1],
                  [0.7, 1],
                  Extrapolate.CLAMP
                );

                return {
                  opacity
                };
              });

              return (
                <TouchableOpacity
                  key={option.label}
                  style={styles.tab}
                  onPress={() => navigate(option.path, index)}
                  activeOpacity={0.7}
                  accessibilityLabel={option.label}
                  accessibilityRole="button"
                  accessibilityState={{ selected: isActive }}
                >
                  <Animated.View style={[styles.iconContainer, animatedIconStyle]}>
                    <Ionicons
                      name={isActive ? option.icon : option.outlineIcon}
                      size={28}
                      color={isActive ? '#FFFFFF' : '#9BA1A6'}
                    />
                  </Animated.View>

                  {/* Animated active indicator - always render but animate visibility */}
                  <Animated.View
                    style={[
                      styles.activeIndicator,
                      useAnimatedStyle(() => ({
                        width: withTiming(isActive ? 30 : 0, { duration: 300 }),
                        opacity: withTiming(isActive ? 1 : 0, { duration: 200 })
                      }))
                    ]}
                  />
                </TouchableOpacity>
              );
            })}
          </View>
        </BlurView>
      </View>

      {/* Tab Action Popup */}
      {activeTabIndex >= 0 && (
        <TabActionPopup
          visible={popupVisible}
          onClose={closePopup}
          actions={getTabActions(activeTabIndex)}
          tabName={NAV_OPTIONS[activeTabIndex]?.label || ''}
        />
      )}
    </>
  );
}

const { width } = Dimensions.get('window');
const TAB_WIDTH = width / 5;

const styles = StyleSheet.create({
  outerContainer: {
    overflow: 'hidden',
    borderTopWidth: 0.5,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    // Add shadow for iOS
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    // Add elevation for Android
    elevation: 10,
  },
  blurContainer: {
    width: '100%',
    height: '100%',
    position: 'relative',
  },
  gradientOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(20, 20, 20, 0.3)',
    borderTopWidth: 0.5,
    borderTopColor: 'rgba(255, 255, 255, 0.15)',
  },
  container: {
    flexDirection: 'row',
    paddingTop: 12,
    paddingBottom: 16,
    justifyContent: 'space-around',
    alignItems: 'flex-start',
    backgroundColor: 'transparent',
    height: '100%',
  },
  tab: {
    alignItems: 'center',
    justifyContent: 'flex-start',
    width: TAB_WIDTH,
    height: '100%',
    position: 'relative',
    paddingTop: 8,
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeIndicator: {
    position: 'absolute',
    top: 42, // Position below the icon
    height: 3,
    borderRadius: 1.5,
    backgroundColor: '#0A84FF',
    // Add a subtle glow effect
    shadowColor: '#0A84FF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 3,
  },
  errorText: {
    color: '#FF3B30',
    fontSize: 12,
    padding: 10,
    textAlign: 'center',
  },
  // Popup styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  popupContainer: {
    width: width * 0.8,
    maxWidth: 350,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  popupBlur: {
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  titleContainer: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  actionsContainer: {
    paddingVertical: 8,
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  actionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#0A84FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  actionText: {
    fontSize: 16,
    color: '#FFFFFF',
  },
});