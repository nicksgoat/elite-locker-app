import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Animated,
  Dimensions,
  Image,
  Modal,
  StatusBar,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { useRouter, usePathname } from 'expo-router';

const MENU_WIDTH = Dimensions.get('window').width * 0.8;
const MENU_ITEMS = [
  {
    title: 'Workouts',
    icon: 'barbell',
    submenu: [
      { title: 'My Workouts', icon: 'list', route: '/workout' },
      { title: 'Start Workout', icon: 'play', route: '/workout/start' },
      { title: 'Exercise Library', icon: 'fitness', route: '/exercises' },
      { title: 'Templates', icon: 'copy', route: '/workout/template' },
      { title: 'History', icon: 'time', route: '/workout/history' },
    ],
  },
  {
    title: 'Clubs',
    icon: 'people',
    submenu: [
      { title: 'My Clubs', icon: 'star', route: '/' },
      { title: 'Discover', icon: 'search', route: '/explore' },
      { title: 'Create Club', icon: 'add-circle', route: '/create' },
    ],
  },
  {
    title: 'Events',
    icon: 'calendar',
    submenu: [
      { title: 'Browse Events', icon: 'list', route: '/events' },
      { title: 'My Bookings', icon: 'ticket', route: '/events/bookings' },
      { title: 'Create Event', icon: 'add-circle', route: '/events/create' },
    ],
  },
  {
    title: 'Progress',
    icon: 'analytics',
    submenu: [
      { title: 'Stats', icon: 'stats-chart', route: '/progress/stats' },
      { title: 'Achievements', icon: 'trophy', route: '/progress/achievements' },
      { title: 'Goals', icon: 'flag', route: '/progress/goals' },
    ],
  },
  {
    title: 'Nutrition',
    icon: 'nutrition',
    submenu: [
      { title: 'Meal Plan', icon: 'restaurant', route: '/nutrition/meal-plan' },
      { title: 'Recipes', icon: 'book', route: '/nutrition/recipes' },
      { title: 'Track Calories', icon: 'calculator', route: '/nutrition/calories' },
    ],
  },
  {
    title: 'Profile',
    icon: 'person',
    submenu: [
      { title: 'My Profile', icon: 'person-circle', route: '/profile' },
      { title: 'Settings', icon: 'settings', route: '/settings' },
      { title: 'Help', icon: 'help-circle', route: '/help' },
    ],
  },
];

interface AccordionItemProps {
  item: {
    title: string;
    icon: string;
    submenu: { title: string; icon: string; route: string }[];
  };
  expanded: boolean;
  onToggle: () => void;
  onMenuItemPress: (route: string) => void;
}

const AccordionItem: React.FC<AccordionItemProps> = ({ 
  item, 
  expanded, 
  onToggle,
  onMenuItemPress
}) => {
  const [height] = useState(new Animated.Value(0));

  React.useEffect(() => {
    Animated.timing(height, {
      toValue: expanded ? item.submenu.length * 50 : 0,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [expanded, height, item.submenu.length]);

  return (
    <View style={styles.accordionItem}>
      <TouchableOpacity 
        style={styles.accordionHeader} 
        onPress={onToggle}
        activeOpacity={0.7}
      >
        <View style={styles.accordionHeaderLeft}>
          <Ionicons name={item.icon as any} size={24} color="#FFFFFF" />
          <Text style={styles.accordionTitle}>{item.title}</Text>
        </View>
        <Ionicons
          name={expanded ? 'chevron-up' : 'chevron-down'}
          size={20}
          color="#FFFFFF"
        />
      </TouchableOpacity>
      
      <Animated.View style={[styles.submenu, { height }]}>
        {item.submenu.map((subItem, index) => (
          <TouchableOpacity
            key={index}
            style={styles.submenuItem}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              onMenuItemPress(subItem.route);
            }}
            activeOpacity={0.7}
          >
            <Ionicons name={subItem.icon as any} size={18} color="#FFFFFF" style={styles.submenuIcon} />
            <Text style={styles.submenuText}>{subItem.title}</Text>
          </TouchableOpacity>
        ))}
      </Animated.View>
    </View>
  );
};

interface NavigationMenuProps {
  visible: boolean;
  onClose: () => void;
}

const NavigationMenu: React.FC<NavigationMenuProps> = ({ visible, onClose }) => {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const router = useRouter();
  const pathname = usePathname();
  const [slideAnim] = useState(new Animated.Value(-MENU_WIDTH));
  const [fadeAnim] = useState(new Animated.Value(0));
  
  // Animate menu when visibility changes
  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        })
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: -MENU_WIDTH,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        })
      ]).start();
    }
  }, [visible, slideAnim, fadeAnim]);
  
  // Determine which menu should be expanded based on current route
  React.useEffect(() => {
    if (visible) {
      const currentPath = pathname || '';
      
      // Auto-expand the relevant section based on current route
      if (currentPath.includes('workout') || currentPath.includes('exercises')) {
        setExpandedIndex(0); // Workouts section
      } else if (currentPath === '/' || currentPath.includes('club') || currentPath.includes('explore')) {
        setExpandedIndex(1); // Clubs section
      } else if (currentPath.includes('events')) {
        setExpandedIndex(2); // Events section
      } else if (currentPath.includes('progress')) {
        setExpandedIndex(3); // Progress section
      } else if (currentPath.includes('nutrition')) {
        setExpandedIndex(4); // Nutrition section
      } else if (currentPath.includes('profile') || currentPath.includes('settings')) {
        setExpandedIndex(5); // Profile section
      }
    }
  }, [visible, pathname]);
  
  const handleToggle = (index: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setExpandedIndex(expandedIndex === index ? null : index);
  };
  
  const handleMenuItemPress = (route: string) => {
    // Use enhanced navigation handling
    const handleNavigation = () => {
      onClose();
      setTimeout(() => {
        router.push(route as any);
      }, 300);
    };
    
    // Execute navigation with haptic feedback
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    handleNavigation();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <StatusBar barStyle="light-content" />
      <Animated.View style={[styles.overlay, { opacity: fadeAnim }]}>
        <TouchableOpacity
          style={styles.dismissArea}
          onPress={onClose}
          activeOpacity={1}
        />
        <Animated.View 
          style={[
            styles.menu,
            { transform: [{ translateX: slideAnim }] }
          ]}
        >
          <BlurView intensity={20} style={styles.blurView}>
            <View style={styles.menuHeader}>
              <Image
                source={{ uri: 'https://i.pravatar.cc/150?img=8' }}
                style={styles.avatar}
              />
              <View style={styles.userInfo}>
                <Text style={styles.userName}>John Doe</Text>
                <Text style={styles.userPlan}>Elite Plan</Text>
              </View>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={onClose}
              >
                <Ionicons name="close" size={24} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.menuContent}>
              {MENU_ITEMS.map((item, index) => (
                <AccordionItem
                  key={index}
                  item={item}
                  expanded={expandedIndex === index}
                  onToggle={() => handleToggle(index)}
                  onMenuItemPress={handleMenuItemPress}
                />
              ))}
            </ScrollView>
            
            <View style={styles.menuFooter}>
              <TouchableOpacity 
                style={styles.footerButton}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                  onClose();
                  // Handle logout
                }}
              >
                <Ionicons name="log-out" size={20} color="#FF3B30" />
                <Text style={[styles.footerButtonText, { color: '#FF3B30' }]}>
                  Logout
                </Text>
              </TouchableOpacity>
            </View>
          </BlurView>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  dismissArea: {
    flex: 1,
  },
  menu: {
    width: MENU_WIDTH,
    backgroundColor: '#121212',
    height: '100%',
  },
  blurView: {
    flex: 1,
    overflow: 'hidden',
    borderLeftWidth: 1,
    borderLeftColor: 'rgba(255, 255, 255, 0.1)',
  },
  menuHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
    marginTop: Platform.OS === 'ios' ? 40 : 0,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  userInfo: {
    marginLeft: 12,
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  userPlan: {
    fontSize: 14,
    color: '#0A84FF',
    marginTop: 2,
  },
  closeButton: {
    padding: 10,
  },
  menuContent: {
    flex: 1,
  },
  accordionItem: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  accordionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  accordionHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  accordionTitle: {
    fontSize: 16,
    color: '#FFFFFF',
    marginLeft: 16,
    fontWeight: '500',
  },
  submenu: {
    overflow: 'hidden',
  },
  submenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  submenuIcon: {
    marginRight: 16,
    width: 20,
    textAlign: 'center',
  },
  submenuText: {
    fontSize: 15,
    color: '#FFFFFF',
  },
  menuFooter: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  footerButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  footerButtonText: {
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 12,
  },
});

export default NavigationMenu; 