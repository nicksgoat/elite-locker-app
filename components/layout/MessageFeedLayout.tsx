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

/**
 * A layout component that displays content in an iMessage-style feed
 * with proper message compose area and plus button
 */
const MessageFeedLayout: React.FC<MessageFeedLayoutProps> = ({ 
  children,
  title = 'Elite Locker',
  subtitle,
  showComposeArea = false,
  showHeader = false, // Default to false to hide header by default
}) => {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [inputText, setInputText] = useState('');
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);
  
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
  
  return (
    <KeyboardAvoidingView 
      style={[styles.container, { paddingTop: insets.top }]}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 10 : 0}
    >
      {/* Title area with just text, no buttons - only show if showHeader is true */}
      {showHeader && (
        <View style={styles.titleContainer}>
          <Text style={styles.mainTitle}>{title}</Text>
          {subtitle && <Text style={styles.mainSubtitle}>{subtitle}</Text>}
        </View>
      )}
      
      {/* Content/Feed */}
      <View style={styles.contentContainer}>
        {children}
      </View>
      
      {/* iMessage-style compose area - only show if showComposeArea is true */}
      {showComposeArea && (
        <BlurView intensity={80} tint="dark" style={styles.composeContainer}>
          <View style={styles.composeInnerContainer}>
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
      )}
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
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
});

export default MessageFeedLayout; 