import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Animated, Keyboard, KeyboardAvoidingView, Platform, Pressable, Dimensions } from 'react-native';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';

interface MessageFeedLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  showComposeArea?: boolean;
  showHeader?: boolean;
}

interface NavigationOption {
  id: string;
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  color: string;
  route: string;
}

/**
 * A layout component that displays content in an iMessage-style feed
 * with proper message compose area and plus button
 */
const MessageFeedLayout: React.FC<MessageFeedLayoutProps> = ({ 
  children,
  title = 'Elite Locker',
  subtitle,
  showComposeArea = false,
  showHeader = true,
}) => {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [inputText, setInputText] = useState('');
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);
  // Menu state
  const [menuVisible, setMenuVisible] = useState(false);
  
  // Animation values
  const menuScaleAnim = useRef(new Animated.Value(0)).current;
  const menuOpacityAnim = useRef(new Animated.Value(0)).current;
  const backdropOpacityAnim = useRef(new Animated.Value(0)).current;
  const plusButtonRotateAnim = useRef(new Animated.Value(0)).current;
  
  // Navigation options
  const navOptions: NavigationOption[] = [
    {
      id: 'feed',
      icon: 'chatbubbles',
      label: 'Messages',
      color: '#0A84FF',
      route: '/',
    },
    {
      id: 'workout',
      icon: 'barbell',
      label: 'Workouts',
      color: '#34C759',
      route: '/workouts',
    },
    {
      id: 'explore',
      icon: 'compass',
      label: 'Explore',
      color: '#5AC8FA',
      route: '/explore',
    },
    {
      id: 'clubs',
      icon: 'people',
      label: 'Clubs',
      color: '#FF9500',
      route: '/clubs',
    },
    {
      id: 'progress',
      icon: 'stats-chart',
      label: 'Progress',
      color: '#FF2D55',
      route: '/progress',
    },
    {
      id: 'profile',
      icon: 'person',
      label: 'Profile',
      color: '#AF52DE',
      route: '/profile',
    },
  ];
  
  // Toggle menu
  const toggleMenu = () => {
    const isShowing = !menuVisible;
    
    Haptics.impactAsync(
      isShowing 
        ? Haptics.ImpactFeedbackStyle.Medium 
        : Haptics.ImpactFeedbackStyle.Light
    );
    
    if (isShowing) {
      // Show menu animations
      setMenuVisible(true);
      Animated.parallel([
        Animated.spring(menuScaleAnim, {
          toValue: 1,
          tension: 70,
          friction: 7,
          useNativeDriver: true,
        }),
        Animated.timing(menuOpacityAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(backdropOpacityAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.spring(plusButtonRotateAnim, {
          toValue: 1,
          tension: 50,
          friction: 4,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      // Hide menu animations
      Animated.parallel([
        Animated.timing(menuScaleAnim, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(menuOpacityAnim, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(backdropOpacityAnim, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.spring(plusButtonRotateAnim, {
          toValue: 0,
          tension: 50,
          friction: 4,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setMenuVisible(false);
      });
    }
  };
  
  // Handle option select
  const handleOptionPress = (route: string) => {
    toggleMenu();
    
    // Small delay to let the animation finish
    setTimeout(() => {
      router.push(route as any);
    }, 200);
  };
  
  // Rotation interpolation
  const rotateInterpolation = plusButtonRotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '45deg']
  });
  
  // Send message handler
  const handleSendPress = () => {
    if (inputText.trim().length === 0) return;
    
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    // Here we would handle sending a message
    setInputText('');
    Keyboard.dismiss();
  };
  
  // Handle keyboard show/hide events
  React.useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      () => {
        setKeyboardVisible(true);
      }
    );
    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => {
        setKeyboardVisible(false);
      }
    );

    return () => {
      keyboardDidHideListener.remove();
      keyboardDidShowListener.remove();
    };
  }, []);
  
  // Calculate top padding based on whether header is shown
  const topPadding = showHeader ? insets.top : insets.top + 10;
  
  return (
    <KeyboardAvoidingView 
      style={[styles.container, { paddingTop: topPadding }]}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 10 : 0}
    >
      {/* iMessage-style header - only show if showHeader is true */}
      {showHeader && (
        <BlurView intensity={50} tint="dark" style={styles.header}>
          <View style={styles.headerContent}>
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <Ionicons name="chevron-back" size={28} color="#0A84FF" />
            </TouchableOpacity>
            <View style={styles.headerTitleContainer}>
              <Text style={styles.headerTitle}>{title}</Text>
              {subtitle && <Text style={styles.headerSubtitle}>{subtitle}</Text>}
            </View>
            <TouchableOpacity style={styles.infoButton}>
              <Ionicons name="information-circle-outline" size={28} color="#0A84FF" />
            </TouchableOpacity>
          </View>
        </BlurView>
      )}
      
      {/* Title area when header is hidden */}
      {!showHeader && (
        <View style={styles.titleContainer}>
          <Text style={styles.mainTitle}>{title}</Text>
          {subtitle && <Text style={styles.mainSubtitle}>{subtitle}</Text>}
        </View>
      )}
      
      {/* Content/Feed */}
      <View style={[styles.contentContainer, !showHeader && { paddingTop: 0 }]}>
        {children}
      </View>
      
      {/* Navigation menu backdrop */}
      {menuVisible && (
        <Animated.View 
          style={[
            styles.menuBackdrop,
            { opacity: backdropOpacityAnim }
          ]}
        >
          <Pressable 
            style={styles.backdropPressable} 
            onPress={toggleMenu}
          />
        </Animated.View>
      )}
      
      {/* Navigation options menu - remains in position regardless of compose area */}
      {menuVisible && (
        <Animated.View 
          style={[
            styles.navMenu,
            {
              opacity: menuOpacityAnim,
              transform: [{ scale: menuScaleAnim }],
              bottom: showComposeArea ? 100 : 70, // Position properly based on compose area
            }
          ]}
        >
          <BlurView intensity={70} tint="dark" style={styles.menuBlur}>
            {navOptions.map((option) => (
              <TouchableOpacity
                key={option.id}
                style={styles.menuOption}
                onPress={() => handleOptionPress(option.route)}
                activeOpacity={0.7}
              >
                <View 
                  style={[
                    styles.optionIconContainer,
                    { backgroundColor: option.color }
                  ]}
                >
                  <Ionicons name={option.icon} size={26} color="#FFFFFF" />
                </View>
                <Text style={styles.optionLabel}>{option.label}</Text>
              </TouchableOpacity>
            ))}
          </BlurView>
        </Animated.View>
      )}
      
      {/* iMessage-style compose area - only show if showComposeArea is true */}
      {showComposeArea ? (
        <BlurView intensity={80} tint="dark" style={styles.composeContainer}>
          <View style={styles.composeInnerContainer}>
            <Animated.View style={{ transform: [{ rotate: rotateInterpolation }] }}>
              <TouchableOpacity 
                style={styles.plusButton}
                onPress={toggleMenu}
              >
                <Ionicons name="add-circle" size={28} color="#0A84FF" />
              </TouchableOpacity>
            </Animated.View>
            
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.textInput}
                placeholder="iMessage"
                placeholderTextColor="#8E8E93"
                value={inputText}
                onChangeText={setInputText}
                multiline
                maxLength={200}
              />
            </View>
            
            {inputText.trim().length > 0 ? (
              <TouchableOpacity 
                style={styles.sendButton}
                onPress={handleSendPress}
              >
                <Ionicons name="arrow-up-circle" size={30} color="#0A84FF" />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity style={styles.cameraButton}>
                <Ionicons name="camera" size={26} color="#0A84FF" />
              </TouchableOpacity>
            )}
          </View>
          
          {/* Bottom padding for iOS home indicator */}
          <View style={{ height: insets.bottom }} />
        </BlurView>
      ) : (
        // Navigation bar when compose area is hidden
        <BlurView intensity={80} tint="dark" style={styles.navContainer}>
          <View style={styles.navInnerContainer}>
            <Animated.View style={{ transform: [{ rotate: rotateInterpolation }] }}>
              <TouchableOpacity 
                style={styles.plusButton}
                onPress={toggleMenu}
              >
                <Ionicons name="add-circle" size={28} color="#0A84FF" />
              </TouchableOpacity>
            </Animated.View>
            
            {/* Navigation buttons */}
            <View style={styles.navButtonsContainer}>
              {navOptions.slice(0, 5).map((option) => (
                <TouchableOpacity
                  key={option.id}
                  style={styles.navButton}
                  onPress={() => router.push(option.route as any)}
                >
                  <Ionicons name={option.icon} size={24} color={option.color} />
                </TouchableOpacity>
              ))}
            </View>
          </View>
          
          {/* Bottom padding for iOS home indicator */}
          <View style={{ height: insets.bottom }} />
        </BlurView>
      )}
    </KeyboardAvoidingView>
  );
};

const { height, width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitleContainer: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#8E8E93',
    marginTop: 2,
  },
  infoButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Title styling when header is not shown
  titleContainer: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginBottom: 10,
  },
  mainTitle: {
    fontSize: 34,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  mainSubtitle: {
    fontSize: 16,
    color: '#8E8E93',
    marginTop: 4,
  },
  contentContainer: {
    flex: 1,
  },
  menuBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 10,
  },
  backdropPressable: {
    width: '100%',
    height: '100%',
  },
  navMenu: {
    position: 'absolute',
    left: 20,
    zIndex: 11,
    width: width * 0.9,
    maxWidth: 300,
    borderRadius: 14,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
  menuBlur: {
    padding: 10,
  },
  menuOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 10,
  },
  optionIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  optionLabel: {
    fontSize: 17,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  composeContainer: {
    borderTopWidth: 0.5,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  composeInnerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  plusButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 4,
  },
  inputContainer: {
    flex: 1,
    backgroundColor: 'rgba(58, 58, 60, 0.8)',
    borderRadius: 20,
    minHeight: 36,
    maxHeight: 120,
    paddingHorizontal: 12,
    paddingVertical: 8,
    justifyContent: 'center',
  },
  textInput: {
    color: '#FFFFFF',
    fontSize: 16,
    paddingTop: 0,
    paddingBottom: 0,
  },
  sendButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 4,
  },
  cameraButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 4,
  },
  // Navigation bar styles (when compose area is hidden)
  navContainer: {
    borderTopWidth: 0.5,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  navInnerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  navButtonsContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginLeft: 8,
  },
  navButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
  },
});

export default MessageFeedLayout; 