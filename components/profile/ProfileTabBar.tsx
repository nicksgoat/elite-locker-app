import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Animated,
  Dimensions,
} from 'react-native';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';

const { width } = Dimensions.get('window');

export type ProfileTabType = 'workouts' | 'programs' | 'clubs' | 'achievements' | 'settings';

interface ProfileTabBarProps {
  tabs: ProfileTabType[];
  activeTab: ProfileTabType;
  onTabChange: (tab: ProfileTabType) => void;
  isScrolling?: boolean;
  showBadges?: boolean;
  counts?: {
    [key in ProfileTabType]?: number;
  };
  isOwnProfile: boolean;
}

const ProfileTabBar: React.FC<ProfileTabBarProps> = ({
  tabs,
  activeTab,
  onTabChange,
  isScrolling = false,
  showBadges = true,
  counts = {},
  isOwnProfile,
}) => {
  const scrollViewRef = useRef<ScrollView>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateAnim = useRef(new Animated.Value(10)).current;

  // Show animation when scrolling starts
  useEffect(() => {
    if (isScrolling) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(translateAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(translateAnim, {
          toValue: 10,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [isScrolling, fadeAnim, translateAnim]);

  // Get human-readable tab names
  const getTabName = (tab: ProfileTabType): string => {
    switch (tab) {
      case 'workouts':
        return 'Workouts';
      case 'programs':
        return 'Programs';
      case 'clubs':
        return 'Clubs';
      case 'achievements':
        return 'Badges';
      case 'settings':
        return 'Settings';
      default:
        return tab;
    }
  };

  // Filter tabs based on whether it's own profile
  const visibleTabs = isOwnProfile 
    ? tabs 
    : tabs.filter(tab => tab !== 'settings');

  // Handle tab press
  const handleTabPress = (tab: ProfileTabType) => {
    Haptics.selectionAsync();
    onTabChange(tab);
    
    // Scroll the tab into view
    if (scrollViewRef.current) {
      const tabIndex = visibleTabs.indexOf(tab);
      const tabWidth = width / Math.min(visibleTabs.length, 4);
      scrollViewRef.current.scrollTo({ x: tabIndex * tabWidth, animated: true });
    }
  };

  return (
    <Animated.View
      style={[
        styles.container,
        isScrolling && styles.containerScrolling,
        {
          opacity: fadeAnim,
          transform: [{ translateY: translateAnim }],
        },
      ]}
    >
      <BlurView intensity={40} tint="dark" style={styles.blurView}>
        <ScrollView
          ref={scrollViewRef}
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.scrollView}
          contentContainerStyle={styles.scrollViewContent}
        >
          {visibleTabs.map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[styles.tab, activeTab === tab && styles.activeTab]}
              onPress={() => handleTabPress(tab)}
              activeOpacity={0.7}
            >
              <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
                {getTabName(tab)}
              </Text>
              {showBadges && counts && counts[tab] && counts[tab]! > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{counts[tab]}</Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </ScrollView>
      </BlurView>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginBottom: 10,
    borderRadius: 16,
    overflow: 'hidden',
    height: 52,
  },
  containerScrolling: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  blurView: {
    width: '100%',
    height: '100%',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 8,
    marginHorizontal: 4,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  activeTab: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  tabText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#B0B0B0',
  },
  activeTabText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  badge: {
    backgroundColor: '#0A84FF',
    borderRadius: 10,
    height: 20,
    minWidth: 20,
    paddingHorizontal: 6,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 6,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '600',
  },
});

export default ProfileTabBar; 