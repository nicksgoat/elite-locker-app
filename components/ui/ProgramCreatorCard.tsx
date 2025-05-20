import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';

interface ProgramCreatorCardProps {
  creatorId: string;
  name: string;
  avatar?: string;
  category?: string;
  onPress?: () => void;
}

export default function ProgramCreatorCard({
  creatorId,
  name,
  avatar,
  category = 'FUNDAMENTALS',
  onPress
}: ProgramCreatorCardProps) {
  const router = useRouter();

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (onPress) {
      onPress();
    } else {
      // Navigate to creator profile
      router.push(`/profile/${creatorId}`);
    }
  };

  return (
    <TouchableOpacity 
      style={styles.container}
      onPress={handlePress}
      activeOpacity={0.8}
    >
      <BlurView intensity={30} tint="dark" style={styles.blurContainer}>
        <View style={styles.content}>
          {/* Creator Avatar */}
          <View style={styles.avatarContainer}>
            {avatar ? (
              <Image 
                source={{ uri: avatar }} 
                style={styles.avatar}
                contentFit="cover"
              />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarPlaceholderText}>
                  {name.charAt(0)}
                </Text>
              </View>
            )}
          </View>
          
          {/* Creator Info */}
          <View style={styles.infoContainer}>
            <Text style={styles.name}>{name}</Text>
            {category && (
              <Text style={styles.category}>{category}</Text>
            )}
          </View>
        </View>
      </BlurView>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },
  blurContainer: {
    overflow: 'hidden',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  avatarContainer: {
    marginRight: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#2C2C2E',
  },
  avatarPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#2C2C2E',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarPlaceholderText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  infoContainer: {
    flex: 1,
  },
  name: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  category: {
    color: '#0A84FF',
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
});
