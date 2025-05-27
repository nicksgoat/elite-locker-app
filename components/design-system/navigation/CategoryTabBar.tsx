import { Text } from '@/components/design-system/primitives';
import { useTheme } from '@/components/design-system/ThemeProvider';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
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
 * A horizontal scrolling tab bar for category navigation with enhanced glassmorphism design.
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
  blurIntensity = 40,
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
        <View style={styles.borderOverlay} />
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {tabs.map((tab, index) => {
            const isActive = tab.id === activeTab;
            return (
              <TouchableOpacity
                key={tab.id}
                style={[
                  styles.tab,
                  isActive && styles.activeTab,
                  index === 0 && styles.firstTab,
                  index === tabs.length - 1 && styles.lastTab,
                ]}
                onPress={() => handleTabPress(tab.id)}
                activeOpacity={0.8}
              >
                {isActive && (
                  <LinearGradient
                    colors={['rgba(255, 255, 255, 0.2)', 'rgba(255, 255, 255, 0.1)']}
                    style={styles.activeBackground}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  />
                )}
                <Text
                  variant="bodySemiBold"
                  color={isActive ? "inverse" : "secondary"}
                  style={[
                    styles.tabText,
                    isActive && styles.activeTabText
                  ]}
                >
                  {tab.label}
                </Text>
                {isActive && <View style={styles.activeIndicator} />}
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
    height: 56,
    marginBottom: 8,
  },
  blurView: {
    flex: 1,
    overflow: 'hidden',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  borderOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  scrollContent: {
    paddingHorizontal: 16,
    alignItems: 'center',
    height: '100%',
    paddingVertical: 8,
  },
  tab: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginRight: 12,
    borderRadius: 22,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  firstTab: {
    marginLeft: 0,
  },
  lastTab: {
    marginRight: 16,
  },
  activeTab: {
    borderColor: 'rgba(255, 255, 255, 0.15)',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    shadowColor: '#FFFFFF',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  activeBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 22,
  },
  tabText: {
    fontWeight: '600',
    fontSize: 14,
    letterSpacing: 0.2,
  },
  activeTabText: {
    textShadowColor: 'rgba(255, 255, 255, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  activeIndicator: {
    position: 'absolute',
    bottom: -1,
    left: '50%',
    width: 20,
    height: 2,
    backgroundColor: '#FFFFFF',
    borderRadius: 1,
    transform: [{ translateX: -10 }],
    opacity: 0.8,
  },
});

export default CategoryTabBar;
