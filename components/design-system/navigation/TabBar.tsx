/**
 * Elite Locker Design System - TabBar Component
 * 
 * A tab bar component for navigation between different sections.
 */

import React from 'react';
import { 
  View, 
  StyleSheet, 
  TouchableOpacity, 
  ViewStyle,
  ScrollView,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

import { Text } from '../primitives/Text';
import { useTheme } from '../ThemeProvider';

// Tab item interface
export interface TabItem<T extends string> {
  id: T;
  label: string;
  icon?: string;
  badge?: number;
}

// TabBar props
export interface TabBarProps<T extends string> {
  tabs: TabItem<T>[];
  activeTab: T;
  onTabChange: (tab: T) => void;
  variant?: 'default' | 'scrollable' | 'pills' | 'underline';
  style?: ViewStyle;
  showIcons?: boolean;
  showLabels?: boolean;
  blurIntensity?: number;
  blurTint?: 'light' | 'dark' | 'default';
}

/**
 * TabBar component
 * 
 * A tab bar component for navigation between different sections.
 * 
 * @example
 * ```tsx
 * <TabBar 
 *   tabs={[
 *     { id: 'feed', label: 'Feed', icon: 'newspaper' },
 *     { id: 'events', label: 'Events', icon: 'calendar' },
 *     { id: 'leaderboards', label: 'Leaderboards', icon: 'trophy' },
 *   ]}
 *   activeTab="feed"
 *   onTabChange={(tab) => setActiveTab(tab)}
 * />
 * ```
 */
export const TabBar = <T extends string>({
  tabs,
  activeTab,
  onTabChange,
  variant = 'default',
  style,
  showIcons = true,
  showLabels = true,
  blurIntensity = 30,
  blurTint = 'dark',
}: TabBarProps<T>) => {
  const { colors, spacing } = useTheme();
  
  // Handle tab press
  const handleTabPress = (tab: T) => {
    if (tab === activeTab) return;
    
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onTabChange(tab);
  };
  
  // Render tab content
  const renderTabContent = (tab: TabItem<T>, isActive: boolean) => (
    <>
      {showIcons && tab.icon && (
        <Ionicons 
          name={tab.icon as any} 
          size={20} 
          color={isActive ? colors.palette.blue500 : colors.light.icon.secondary} 
          style={styles.tabIcon}
        />
      )}
      
      {showLabels && (
        <Text 
          variant="bodySmall" 
          color={isActive ? 'link' : 'secondary'}
          style={styles.tabText}
        >
          {tab.label}
        </Text>
      )}
      
      {tab.badge !== undefined && tab.badge > 0 && (
        <View style={styles.badge}>
          <Text variant="labelSmall" color="inverse" style={styles.badgeText}>
            {tab.badge}
          </Text>
        </View>
      )}
    </>
  );
  
  // Render scrollable tabs
  if (variant === 'scrollable') {
    return (
      <View style={[styles.container, style]}>
        <BlurView intensity={blurIntensity} tint={blurTint} style={styles.blurView}>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.scrollableTabBar}
          >
            {tabs.map((tab) => {
              const isActive = tab.id === activeTab;
              return (
                <TouchableOpacity 
                  key={tab.id}
                  style={[styles.scrollableTab, isActive && styles.activeScrollableTab]} 
                  onPress={() => handleTabPress(tab.id)}
                  activeOpacity={0.7}
                >
                  {renderTabContent(tab, isActive)}
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </BlurView>
      </View>
    );
  }
  
  // Render pill tabs
  if (variant === 'pills') {
    return (
      <View style={[styles.container, style]}>
        <BlurView intensity={blurIntensity} tint={blurTint} style={styles.blurView}>
          <View style={styles.pillsTabBar}>
            {tabs.map((tab) => {
              const isActive = tab.id === activeTab;
              return (
                <TouchableOpacity 
                  key={tab.id}
                  style={[styles.pillTab, isActive && styles.activePillTab]} 
                  onPress={() => handleTabPress(tab.id)}
                  activeOpacity={0.7}
                >
                  {renderTabContent(tab, isActive)}
                </TouchableOpacity>
              );
            })}
          </View>
        </BlurView>
      </View>
    );
  }
  
  // Render underline tabs
  if (variant === 'underline') {
    return (
      <View style={[styles.container, style]}>
        <BlurView intensity={blurIntensity} tint={blurTint} style={styles.blurView}>
          <View style={styles.underlineTabBar}>
            {tabs.map((tab) => {
              const isActive = tab.id === activeTab;
              return (
                <TouchableOpacity 
                  key={tab.id}
                  style={[styles.underlineTab, isActive && styles.activeUnderlineTab]} 
                  onPress={() => handleTabPress(tab.id)}
                  activeOpacity={0.7}
                >
                  {renderTabContent(tab, isActive)}
                  {isActive && <View style={styles.underline} />}
                </TouchableOpacity>
              );
            })}
          </View>
        </BlurView>
      </View>
    );
  }
  
  // Render default tabs
  return (
    <View style={[styles.container, style]}>
      <BlurView intensity={blurIntensity} tint={blurTint} style={styles.blurView}>
        <View style={styles.tabBar}>
          {tabs.map((tab) => {
            const isActive = tab.id === activeTab;
            return (
              <TouchableOpacity 
                key={tab.id}
                style={[styles.tab, isActive && styles.activeTab]} 
                onPress={() => handleTabPress(tab.id)}
                activeOpacity={0.7}
              >
                {renderTabContent(tab, isActive)}
              </TouchableOpacity>
            );
          })}
        </View>
      </BlurView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    zIndex: 10,
  },
  blurView: {
    borderRadius: 0,
    overflow: 'hidden',
  },
  tabBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingVertical: 8,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  activeTab: {
    // Active tab styling
  },
  tabIcon: {
    marginBottom: 4,
  },
  tabText: {
    textAlign: 'center',
  },
  badge: {
    position: 'absolute',
    top: -2,
    right: -8,
    backgroundColor: '#FF3B30',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  // Scrollable tabs
  scrollableTabBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  scrollableTab: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
  },
  activeScrollableTab: {
    // Active scrollable tab styling
  },
  // Pills tabs
  pillsTabBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
  },
  pillTab: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginHorizontal: 4,
    borderRadius: 20,
    backgroundColor: 'rgba(118, 118, 128, 0.12)',
  },
  activePillTab: {
    backgroundColor: 'rgba(10, 132, 255, 0.12)',
  },
  // Underline tabs
  underlineTabBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingVertical: 8,
  },
  underlineTab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    position: 'relative',
  },
  activeUnderlineTab: {
    // Active underline tab styling
  },
  underline: {
    position: 'absolute',
    bottom: 0,
    left: '25%',
    right: '25%',
    height: 2,
    backgroundColor: '#0A84FF',
    borderRadius: 1,
  },
});

export default TabBar;
