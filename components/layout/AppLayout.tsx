import { usePathname, useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import SimpleBottomNavBar from './SimpleBottomNavBar';

interface AppLayoutProps {
  children: React.ReactNode;
  hideNavBar?: boolean;
}

/**
 * Main app layout component that handles the navigation bar visibility
 * and provides proper safe area insets
 */
const AppLayout: React.FC<AppLayoutProps> = ({
  children,
  hideNavBar = false,
}) => {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const pathname = usePathname();

  // Animation for nav bar visibility
  const navBarOpacity = useSharedValue(hideNavBar ? 0 : 1);

  // Update animation when hideNavBar changes
  React.useEffect(() => {
    navBarOpacity.value = withTiming(hideNavBar ? 0 : 1, { duration: 300 });
  }, [hideNavBar]);

  // Create animated style for nav bar container
  const navBarAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: navBarOpacity.value,
      transform: [
        { translateY: withTiming(hideNavBar ? 100 : 0, { duration: 300 }) }
      ]
    };
  });

  return (
    <View style={styles.container}>
      {children}

      {/* Animated nav bar container */}
      {!hideNavBar && (
        <Animated.View
          style={[
            styles.navBarContainer,
            navBarAnimatedStyle
          ]}
        >
          <View style={[styles.navBarContent, { height: 60 + insets.bottom }]}>
            <SimpleBottomNavBar />
          </View>
        </Animated.View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  navBarContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'transparent',
  },
  navBarContent: {
    width: '100%',
    overflow: 'hidden',
  }
});

export default AppLayout;