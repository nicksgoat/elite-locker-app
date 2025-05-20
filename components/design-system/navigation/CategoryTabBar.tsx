import { Text } from '@/components/design-system/primitives';
import { useTheme } from '@/components/design-system/ThemeProvider';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import React from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';

export interface CategoryTab {
  id: string;
  label: string;
}

export interface CategoryTabBarProps {
  tabs: CategoryTab[];
  activeTab: string;
  onTabChange: (tab: string) => void;
  style?: any;
  blurIntensity?: number;
  blurTint?: 'light' | 'dark' | 'default';
}

/**
 * CategoryTabBar component
 *
 * A horizontal scrolling tab bar for category navigation in Spotify-like interface.
 *
 * @example
 * ```tsx
 * <CategoryTabBar
 *   tabs={[
 *     { id: 'featured', label: 'Featured' },
 *     { id: 'strength', label: 'Strength' },
 *     { id: 'cardio', label: 'Cardio' },
 *   ]}
 *   activeTab="featured"
 *   onTabChange={(tab) => setActiveTab(tab)}
 * />
 * ```
 */
export const CategoryTabBar: React.FC<CategoryTabBarProps> = ({
  tabs,
  activeTab,
  onTabChange,
  style,
  blurIntensity = 30,
  blurTint = 'dark',
}) => {
  const { colors, spacing } = useTheme();

  // Handle tab press
  const handleTabPress = (tab: string) => {
    if (tab === activeTab) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onTabChange(tab);
  };

  return (
    <View style={[styles.container, style]}>
      <BlurView intensity={blurIntensity} tint={blurTint} style={styles.blurView}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {tabs.map((tab) => {
            const isActive = tab.id === activeTab;
            return (
              <TouchableOpacity
                key={tab.id}
                style={[
                  styles.tab,
                  isActive && styles.activeTab
                ]}
                onPress={() => handleTabPress(tab.id)}
                activeOpacity={0.7}
              >
                <Text
                  variant="bodySmall"
                  color={isActive ? "inverse" : "secondary"}
                  style={styles.tabText}
                >
                  {tab.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </BlurView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: 48,
    marginBottom: 8,
  },
  blurView: {
    flex: 1,
    overflow: 'hidden',
  },
  scrollContent: {
    paddingHorizontal: 16,
    alignItems: 'center',
    height: '100%',
  },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    borderRadius: 20,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeTab: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  tabText: {
    fontWeight: '500',
  },
});

export default CategoryTabBar;
