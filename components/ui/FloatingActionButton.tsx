import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Animated, 
  Easing,
  ViewStyle,
  Vibration
} from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';

interface ActionOption {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
  color?: string;
}

interface FloatingActionButtonProps {
  style?: ViewStyle;
  size?: number;
  iconSize?: number;
}

const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({
  style,
  size = 60,
  iconSize = 28,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [animation] = useState(new Animated.Value(0));
  const [scaleAnimation] = useState(new Animated.Value(1));
  const router = useRouter();

  // Scale animation on mount
  useEffect(() => {
    Animated.sequence([
      Animated.timing(scaleAnimation, {
        toValue: 1.2,
        duration: 200,
        useNativeDriver: true,
        easing: Easing.out(Easing.back(2)),
      }),
      Animated.timing(scaleAnimation, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
        easing: Easing.inOut(Easing.ease),
      }),
    ]).start();
  }, []);

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

  // Options for the expanded menu
  const actionOptions: ActionOption[] = [
    {
      icon: 'barbell-outline',
      label: 'Log Workout',
      onPress: () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        router.push('/workout/active' as any);
      },
      color: '#0A84FF',
    },
    {
      icon: 'walk-outline',
      label: 'Track Run',
      onPress: () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        router.push('/workout/run' as any);
      },
      color: '#34C759',
    },
    {
      icon: 'copy-outline',
      label: 'Create Template',
      onPress: () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        router.push('/workout/template/create' as any);
      },
      color: '#FF9500',
    },
    {
      icon: 'list-outline',
      label: 'Load Template',
      onPress: () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        router.push('/workout/template' as any);
      },
      color: '#AF52DE',
    },
  ];

  // Animation styles for the menu button
  const rotateInterpolate = animation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '45deg'],
  });

  const buttonAnimationStyle = {
    transform: [
      { rotate: rotateInterpolate },
      { scale: scaleAnimation }
    ],
  };
  
  // Background blur opacity
  const backdropOpacity = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 0.5],
  });

  return (
    <View style={[styles.container, style]}>
      {/* Semi-transparent backdrop for better focus on the menu */}
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
      
      {/* Action Options */}
      {actionOptions.map((option, index) => {
        const translateY = animation.interpolate({
          inputRange: [0, 1],
          outputRange: [size, -1 * (index + 1) * (size + 15)],
        });

        const scaleInterpolate = animation.interpolate({
          inputRange: [0, 0.5, 1],
          outputRange: [0, 0.5, 1],
        });

        const opacityInterpolate = animation.interpolate({
          inputRange: [0, 0.5, 1],
          outputRange: [0, 0.3, 1],
        });

        const animatedOptionStyle = {
          transform: [
            { translateY },
            { scale: scaleInterpolate }
          ],
          opacity: opacityInterpolate,
        };

        return (
          <Animated.View
            key={option.label}
            style={[styles.actionButton, animatedOptionStyle]}
          >
            <BlurView intensity={50} tint="dark" style={styles.actionBlur}>
              <TouchableOpacity
                style={styles.actionTouchable}
                onPress={() => {
                  toggleMenu();
                  setTimeout(() => {
                    option.onPress();
                  }, 300);
                }}
                activeOpacity={0.8}
              >
                <View style={[styles.actionIcon, { backgroundColor: option.color }]}>
                  <Ionicons name={option.icon} size={24} color="#FFFFFF" />
                </View>
              </TouchableOpacity>
            </BlurView>
            {isOpen && (
              <BlurView intensity={50} tint="dark" style={styles.labelBlur}>
                <Text style={styles.actionLabel}>{option.label}</Text>
              </BlurView>
            )}
          </Animated.View>
        );
      })}

      {/* Main Button */}
      <BlurView intensity={60} tint="dark" style={[styles.buttonBlur, { width: size, height: size, borderRadius: size / 2 }]}>
        <Animated.View style={buttonAnimationStyle}>
          <TouchableOpacity
            onPress={toggleMenu}
            style={[styles.button, { width: size, height: size }]}
            activeOpacity={0.8}
          >
            <Ionicons name="add" size={iconSize} color="#FFFFFF" />
          </TouchableOpacity>
        </Animated.View>
      </BlurView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    bottom: 30,
    right: 20,
    zIndex: 999,
  },
  backdrop: {
    position: 'absolute',
    top: -1000,
    left: -1000,
    right: -1000,
    bottom: -1000,
    backgroundColor: 'rgba(0,0,0,0.6)',
    zIndex: -1,
  },
  backdropTouchable: {
    width: '100%',
    height: '100%',
  },
  buttonBlur: {
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
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 30,
  },
  actionButton: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: -1,
    flexDirection: 'row',
  },
  actionBlur: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 4,
  },
  actionTouchable: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  labelBlur: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    marginRight: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  actionLabel: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
});

export default FloatingActionButton; 