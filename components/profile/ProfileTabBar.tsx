import { TabBar } from '@/components/design-system/navigation';
import React, { memo } from 'react';
import { StyleSheet } from 'react-native';

export type ProfileTabType = 'workouts' | 'programs' | 'stats' | 'earnings';

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

// Get human-readable tab names
const getTabName = (tab: ProfileTabType): string => {
  switch (tab) {
    case 'workouts':
      return 'Workouts';
    case 'programs':
      return 'Programs';
    case 'stats':
      return 'Stats';
    case 'earnings':
      return 'Earnings';
    default:
      const exhaustiveCheck: never = tab;
      return exhaustiveCheck;
  }
};

// Memoized component to prevent unnecessary re-renders
const ProfileTabBar: React.FC<ProfileTabBarProps> = memo(({
  tabs,
  activeTab,
  onTabChange,
  showBadges = true,
  counts = {},
  isOwnProfile,
}) => {
  // Convert tabs to TabItem format
  const tabItems = tabs.map(tab => ({
    id: tab,
    label: getTabName(tab),
    badge: showBadges && counts && counts[tab] ? counts[tab] : undefined,
  }));

  return (
    <TabBar
      tabs={tabItems}
      activeTab={activeTab}
      onTabChange={onTabChange}
      variant="underline"
      style={styles.tabBar}
      blurIntensity={20}
    />
  );
});

const styles = StyleSheet.create({
  tabBar: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(60, 60, 67, 0.2)',
  },
});

export default ProfileTabBar;