import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  Dimensions,
  Animated,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';

const { width, height } = Dimensions.get('window');

interface MenuItem {
  name: string;
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  route: string;
  color: string;
}

const MENU_ITEMS: MenuItem[] = [
  {
    name: 'explore',
    icon: 'compass',
    label: 'Explore',
    route: '/explore',
    color: '#0A84FF',
  },
  {
    name: 'feed',
    icon: 'newspaper',
    label: 'Feed',
    route: '/feed',
    color: '#30D158',
  },
  {
    name: 'clubs',
    icon: 'people-circle',
    label: 'Clubs',
    route: '/clubs',
    color: '#FF9F0A',
  },
  {
    name: 'progress',
    icon: 'analytics',
    label: 'Progress',
    route: '/progress',
    color: '#FF2D55',
  },
  {
    name: 'settings',
    icon: 'settings',
    label: 'Settings',
    route: '/settings',
    color: '#8E8E93',
  },
  {
    name: 'feed-new',
    icon: 'add-circle',
    label: 'New Feed',
    route: '/feed-new',
    color: '#5856D6',
  },
];

interface QuickAccessMenuProps {
  visible: boolean;
  onClose: () => void;
}

const QuickAccessMenu: React.FC<QuickAccessMenuProps> = ({ visible, onClose }) => {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [scaleAnim] = useState(new Animated.Value(0));

  React.useEffect(() => {
    if (visible) {
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 100,
        friction: 8,
      }).start();
    } else {
      Animated.spring(scaleAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 100,
        friction: 8,
      }).start();
    }
  }, [visible]);

  const handleMenuPress = (route: string, label: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onClose();
    setTimeout(() => {
      router.push(route as any);
    }, 200);
  };

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableOpacity 
        style={styles.overlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <BlurView intensity={20} tint="dark" style={styles.backdrop} />
        
        <Animated.View 
          style={[
            styles.menuContainer,
            {
              bottom: insets.bottom + 100,
              transform: [{ scale: scaleAnim }],
            }
          ]}
        >
          <BlurView intensity={100} tint="dark" style={styles.menu}>
            <View style={styles.menuHeader}>
              <Text style={styles.menuTitle}>Quick Access</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={onClose}
                activeOpacity={0.7}
              >
                <Ionicons name="close" size={20} color="#8E8E93" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.menuItems}>
              {MENU_ITEMS.map((item, index) => (
                <TouchableOpacity
                  key={item.name}
                  style={[
                    styles.menuItem,
                    index % 2 === 0 ? styles.leftItem : styles.rightItem,
                  ]}
                  onPress={() => handleMenuPress(item.route, item.label)}
                  activeOpacity={0.7}
                >
                  <View style={[styles.iconContainer, { backgroundColor: item.color }]}>
                    <Ionicons name={item.icon} size={24} color="#FFFFFF" />
                  </View>
                  <Text style={styles.menuItemLabel}>{item.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </BlurView>
        </Animated.View>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  menuContainer: {
    position: 'absolute',
    left: 20,
    right: 20,
  },
  menu: {
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: 'rgba(28, 28, 30, 0.9)',
  },
  menuHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(84, 84, 88, 0.6)',
  },
  menuTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  closeButton: {
    padding: 4,
  },
  menuItems: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 16,
  },
  menuItem: {
    width: '50%',
    alignItems: 'center',
    paddingVertical: 16,
  },
  leftItem: {
    paddingRight: 8,
  },
  rightItem: {
    paddingLeft: 8,
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  menuItemLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#FFFFFF',
    textAlign: 'center',
  },
});

export default QuickAccessMenu; 