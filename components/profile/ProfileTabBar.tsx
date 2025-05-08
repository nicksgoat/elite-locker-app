import React, { useRef, useMemo, memo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Platform,
} from 'react-native';
import * as Haptics from 'expo-haptics';

const { width } = Dimensions.get('window');

export type ProfileTabType = 'workouts' | 'programs' | 'clubs' | 'achievements';

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

// Memoized component to prevent unnecessary re-renders
const ProfileTabBar: React.FC<ProfileTabBarProps> = memo(({
  tabs,
  activeTab,
  onTabChange,
  isScrolling = false,
  showBadges = true,
  counts = {},
  isOwnProfile,
}) => {
  const scrollViewRef = useRef<ScrollView>(null);

  // Get human-readable tab names - memoized
  const getTabName = useMemo(() => (tab: ProfileTabType): string => {
    switch (tab) {
      case 'workouts':
        return 'Workouts';
      case 'programs':
        return 'Programs';
      case 'clubs':
        return 'Clubs';
      case 'achievements':
        return 'Badges';
      default:
        return tab;
    }
  }, []);

  // No need to filter tabs anymore since we've redefined the type
  const visibleTabs = useMemo(() => tabs, [tabs]);

  // Handle tab press with better haptic feedback
  const handleTabPress = (tab: ProfileTabType) => {
    if (tab === activeTab) {
      return; // Don't do anything if the tab is already active
    }
    
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onTabChange(tab);
    
    // Scroll the tab into view
    if (scrollViewRef.current) {
      const tabIndex = visibleTabs.indexOf(tab);
      const tabWidth = width / Math.min(visibleTabs.length, 4);
      scrollViewRef.current.scrollTo({ x: tabIndex * tabWidth, animated: true });
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView
        ref={scrollViewRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.scrollView}
        contentContainerStyle={styles.scrollViewContent}
        scrollEventThrottle={16}
      >
        {visibleTabs.map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.activeTab]}
            onPress={() => handleTabPress(tab)}
            activeOpacity={0.6}
            hitSlop={{ top: 10, bottom: 10, left: 5, right: 5 }}
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
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    width: '100%',
    borderRadius: 0,
    overflow: 'hidden',
    height: 56,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    backdropFilter: 'blur(10px)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    alignItems: 'center',
    paddingHorizontal: 10,
    height: '100%',
  },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderRadius: 8,
    marginHorizontal: 4,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    height: '100%',
  },
  activeTab: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
  tabText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#B0B0B0',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'normal',
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
    fontFamily: Platform.OS === 'ios' ? 'System' : 'normal',
  },
});

export default ProfileTabBar; 