import React, { useState, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Animated, 
  Easing,
  Dimensions,
  ScrollView
} from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';

const { width, height } = Dimensions.get('window');

interface ActionOption {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
  color?: string;
  bgColor?: string;
}

/**
 * A floating action button component styled like iMessage's compose button
 * When pressed, it displays a popup menu with app navigation options
 */
const MessageFloatingActionButton: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const animation = useRef(new Animated.Value(0)).current;
  const router = useRouter();

  // Animation config
  const toggleMenu = () => {
    const toValue = isOpen ? 0 : 1;
    
    // Provide haptic feedback
    if (toValue === 1) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } else {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    
    // Animate the menu
    Animated.timing(animation, {
      toValue,
      duration: 300,
      easing: Easing.bezier(0.4, 0, 0.2, 1),
      useNativeDriver: true,
    }).start();
    
    setIsOpen(!isOpen);
  };

  // Options for the popup menu
  const actionOptions: ActionOption[] = [
    {
      icon: 'barbell-outline',
      label: 'Log Workout',
      onPress: () => {
        router.push('/workout/active' as any);
      },
      color: '#FFFFFF',
      bgColor: '#0A84FF',
    },
    {
      icon: 'walk-outline',
      label: 'Track Run',
      onPress: () => {
        router.push('/workout/run' as any);
      },
      color: '#FFFFFF',
      bgColor: '#34C759',
    },
    {
      icon: 'copy-outline',
      label: 'Create Template',
      onPress: () => {
        router.push('/workout/template/create' as any);
      },
      color: '#FFFFFF',
      bgColor: '#FF9500',
    },
    {
      icon: 'person-outline',
      label: 'My Profile',
      onPress: () => {
        router.push('/profile' as any);
      },
      color: '#FFFFFF',
      bgColor: '#AF52DE',
    },
    {
      icon: 'search-outline',
      label: 'Explore',
      onPress: () => {
        router.push('/explore' as any);
      },
      color: '#FFFFFF',
      bgColor: '#5AC8FA',
    },
    {
      icon: 'list-outline',
      label: 'Templates',
      onPress: () => {
        router.push('/workout/template' as any);
      },
      color: '#FFFFFF',
      bgColor: '#FF2D55',
    },
  ];

  // Animation styles for menu popup
  const popupScaleInterpolate = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  const popupOpacityInterpolate = animation.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0, 0.5, 1],
  });

  // Backdrop opacity
  const backdropOpacity = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 0.5],
  });

  return (
    <View style={styles.container}>
      {/* Semi-transparent backdrop when menu is open */}
      {isOpen && (
        <Animated.View 
          style={[
            styles.backdrop,
            { opacity: backdropOpacity }
          ]}
        >
          <TouchableOpacity
            style={styles.backdropTouchable}
            activeOpacity={1}
            onPress={toggleMenu}
          />
        </Animated.View>
      )}
      
      {/* Popup Menu */}
      <Animated.View
        style={[
          styles.popupContainer,
          {
            transform: [{ scale: popupScaleInterpolate }],
            opacity: popupOpacityInterpolate,
            display: isOpen ? 'flex' : 'none',
          }
        ]}
      >
        <BlurView intensity={80} tint="dark" style={styles.popupBlur}>
          <ScrollView 
            style={styles.popupScroll}
            contentContainerStyle={styles.popupScrollContent}
            showsVerticalScrollIndicator={false}
          >
            {actionOptions.map((option, index) => (
              <TouchableOpacity
                key={option.label}
                style={styles.actionItem}
                onPress={() => {
                  toggleMenu();
                  setTimeout(() => {
                    option.onPress();
                  }, 200);
                }}
                activeOpacity={0.7}
              >
                <View 
                  style={[
                    styles.actionIcon, 
                    { backgroundColor: option.bgColor }
                  ]}
                >
                  <Ionicons name={option.icon} size={24} color={option.color} />
                </View>
                <Text style={styles.actionText}>{option.label}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </BlurView>
      </Animated.View>
      
      {/* Main Button */}
      <BlurView intensity={80} tint="dark" style={styles.buttonBlur}>
        <TouchableOpacity
          onPress={toggleMenu}
          style={styles.button}
          activeOpacity={0.8}
        >
          <Ionicons name="create" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </BlurView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    zIndex: 999,
  },
  backdrop: {
    position: 'absolute',
    top: -1000,
    left: -1000,
    right: -1000,
    bottom: -1000,
    backgroundColor: 'rgba(0,0,0,0.7)',
    zIndex: -1,
  },
  backdropTouchable: {
    width: '100%',
    height: '100%',
  },
  buttonBlur: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
  },
  button: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  popupContainer: {
    position: 'absolute',
    bottom: 70,
    right: 10,
    width: width * 0.8,
    maxWidth: 300,
    maxHeight: height * 0.6,
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    transform: [{ scale: 0 }],
  },
  popupBlur: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  popupScroll: {
    maxHeight: height * 0.5,
  },
  popupScrollContent: {
    padding: 16,
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  actionIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  actionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default MessageFloatingActionButton; 