import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { useRouter, usePathname } from 'expo-router';
import NavigationMenu from './NavigationMenu';

interface GlobalHeaderProps {
  title: string;
  showBackButton?: boolean;
  rightAction?: {
    icon: string;
    onPress: () => void;
  };
  showMenuButton?: boolean;
  transparent?: boolean;
  forceShowMenu?: boolean;
}

// Use a global menu state to persist menu visibility across component instances
let globalMenuVisible = false;

const GlobalHeader: React.FC<GlobalHeaderProps> = ({
  title,
  showBackButton = false,
  rightAction,
  showMenuButton = true,
  transparent = false,
  forceShowMenu = false,
}) => {
  const [menuVisible, setMenuVisible] = useState(globalMenuVisible || forceShowMenu);
  const router = useRouter();
  const currentPath = usePathname();
  
  // Update global menu state when local state changes
  useEffect(() => {
    globalMenuVisible = menuVisible;
  }, [menuVisible]);
  
  // Detect when path changes - if we're on a club page, 
  // we may want to adapt menu behavior
  useEffect(() => {
    // Special path-specific behaviors can be added here
    if (currentPath?.includes('/club/')) {
      // For club pages, menu should auto-expand the clubs section
      // NavigationMenu will handle this internally
    }
  }, [currentPath]);

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };

  const handleMenuToggle = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setMenuVisible(!menuVisible);
  };

  return (
    <>
      <StatusBar barStyle="light-content" />
      <View style={[styles.container, transparent && styles.transparentContainer]}>
        <BlurView 
          intensity={transparent ? 20 : 50} 
          tint="dark"
          style={styles.blurView}
        >
          <View style={styles.header}>
            {showBackButton ? (
              <TouchableOpacity 
                style={styles.leftButton} 
                onPress={handleBack}
                activeOpacity={0.7}
              >
                <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
              </TouchableOpacity>
            ) : showMenuButton ? (
              <TouchableOpacity 
                style={styles.leftButton} 
                onPress={handleMenuToggle}
                activeOpacity={0.7}
              >
                <Ionicons name="menu" size={24} color="#FFFFFF" />
              </TouchableOpacity>
            ) : (
              <View style={styles.leftButton} />
            )}

            <Text style={styles.title} numberOfLines={1}>
              {title}
            </Text>

            {rightAction ? (
              <TouchableOpacity 
                style={styles.rightButton} 
                onPress={rightAction.onPress}
                activeOpacity={0.7}
              >
                <Ionicons name={rightAction.icon as any} size={24} color="#FFFFFF" />
              </TouchableOpacity>
            ) : (
              <View style={styles.rightButton} />
            )}
          </View>
        </BlurView>
      </View>

      <NavigationMenu 
        visible={menuVisible} 
        onClose={() => setMenuVisible(false)} 
      />
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    paddingTop: Platform.OS === 'ios' ? 44 : 0,
    zIndex: 10,
    backgroundColor: 'rgba(18, 18, 18, 0.8)',
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(60, 60, 67, 0.29)',
  },
  transparentContainer: {
    backgroundColor: 'transparent',
  },
  blurView: {
    width: '100%',
    overflow: 'hidden',
  },
  header: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  leftButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    flex: 1,
    textAlign: 'center',
  },
  rightButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
  },
});

export default GlobalHeader; 