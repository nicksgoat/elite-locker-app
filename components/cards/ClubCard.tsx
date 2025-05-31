import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

// Define club card props
export type ClubCardProps = {
  id: string;
  name: string;
  description?: string;
  ownerName: string;
  ownerImageUrl?: string;
  profileImageUrl?: string;
  coverImageUrl?: string;
  memberCount?: number;
  price?: number;
  isSubscribed?: boolean;
  onPress?: () => void;
};

/**
 * A robust card component for displaying club information
 * Uses hardcoded styles with fallbacks for maximum stability
 */
export default function ClubCard({
  name,
  description,
  ownerName,
  ownerImageUrl,
  profileImageUrl,
  coverImageUrl,
  memberCount,
  price,
  isSubscribed,
  onPress,
}: ClubCardProps) {
  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={styles.headerContainer}>
        {coverImageUrl ? (
          <Image
            source={{ uri: coverImageUrl }}
            style={styles.coverImage}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.coverImagePlaceholder} />
        )}

        {/* Profile image */}
        <View style={styles.profileImageContainer}>
          {profileImageUrl ? (
            <Image
              source={{ uri: profileImageUrl }}
              style={styles.profileImage}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.profileImagePlaceholder}>
              <Text style={styles.profileInitial}>
                {(name || 'C').charAt(0).toUpperCase()}
              </Text>
            </View>
          )}
        </View>

        {/* Price tag or subscribed badge */}
        {price !== undefined && price !== null && !isSubscribed && (
          <View style={styles.priceTag}>
            <Text style={styles.priceText}>
              ${price.toFixed(2)}/mo
            </Text>
          </View>
        )}

        {isSubscribed && (
          <View style={styles.subscribedBadge}>
            <Ionicons name="checkmark-circle" size={14} color="#FFFFFF" />
            <Text style={styles.subscribedText}>Subscribed</Text>
          </View>
        )}
      </View>

      <View style={styles.contentContainer}>
        <Text style={styles.name} numberOfLines={1}>{name || 'Unnamed Club'}</Text>

        {description && (
          <Text style={styles.description} numberOfLines={2}>
            {description}
          </Text>
        )}

        <View style={styles.footer}>
          <View style={styles.ownerContainer}>
            {ownerImageUrl ? (
              <Image
                source={{ uri: ownerImageUrl }}
                style={styles.ownerImage}
              />
            ) : (
              <View style={styles.ownerImagePlaceholder}>
                <Text style={styles.ownerInitial}>
                  {ownerName ? ownerName.charAt(0).toUpperCase() : '?'}
                </Text>
              </View>
            )}
            <Text style={styles.ownerPrefix}>by </Text>
            <Text style={styles.ownerName}>{ownerName || 'Unknown'}</Text>
          </View>

          {memberCount !== undefined && (
            <View style={styles.memberContainer}>
              <Ionicons
                name="people-outline"
                size={14}
                color="#9BA1A6"
              />
              <Text style={styles.memberCount}>
                {memberCount}
              </Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

// Hardcoded styles for maximum stability
const styles = StyleSheet.create({
  container: {
    width: 300,
    height: 220,
    marginRight: 16,
    marginBottom: 16,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: 'rgba(28, 28, 30, 0.8)', // Enhanced glassmorphism
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)', // Enhanced border for better glassmorphism
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  headerContainer: {
    width: '100%',
    height: 100,
    position: 'relative',
  },
  coverImage: {
    width: '100%',
    height: '100%',
  },
  coverImagePlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(10, 132, 255, 0.2)', // Light blue background
  },
  profileImageContainer: {
    position: 'absolute',
    bottom: -30,
    left: 16,
    padding: 4,
    backgroundColor: 'rgba(28, 28, 30, 0.7)',
    borderRadius: 40,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  profileImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  profileImagePlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#0A84FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileInitial: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '600',
  },
  priceTag: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(10, 132, 255, 0.95)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  priceText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  subscribedBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(48, 209, 88, 0.95)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  subscribedText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
    marginLeft: 4,
  },
  contentContainer: {
    padding: 16,
    paddingTop: 36,
  },
  name: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  description: {
    color: '#9BA1A6',
    fontSize: 14,
    marginBottom: 12,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  ownerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ownerImage: {
    width: 20,
    height: 20,
    borderRadius: 10,
    marginRight: 4,
  },
  ownerImagePlaceholder: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#0A84FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 4,
  },
  ownerInitial: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
  },
  ownerPrefix: {
    color: '#9BA1A6',
    fontSize: 12,
  },
  ownerName: {
    color: '#FFFFFF',
    fontSize: 12,
  },
  memberContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  memberCount: {
    color: '#9BA1A6',
    fontSize: 12,
    marginLeft: 4,
  },
});