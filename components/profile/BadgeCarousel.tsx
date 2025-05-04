import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Modal,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import * as Haptics from 'expo-haptics';

import { Badge } from '@/contexts/ProfileContext';

const { width } = Dimensions.get('window');
const BADGE_SIZE = 80;

interface BadgeCarouselProps {
  badges: Badge[];
  title?: string;
  emptyMessage?: string;
}

interface BadgeDetailModalProps {
  badge: Badge | null;
  visible: boolean;
  onClose: () => void;
}

// Badge Detail Modal
const BadgeDetailModal: React.FC<BadgeDetailModalProps> = ({
  badge,
  visible,
  onClose,
}) => {
  if (!badge) return null;

  const handleClose = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onClose();
  };

  // Format date
  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  // Get badge color based on category
  const getBadgeColor = (category: string): string => {
    switch (category) {
      case 'achievement':
        return '#0A84FF';
      case 'streak':
        return '#FF9500';
      case 'challenge':
        return '#FF2D55';
      case 'membership':
        return '#64D2FF';
      default:
        return '#0A84FF';
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
      <View style={styles.modalContainer}>
        <TouchableOpacity
          style={styles.modalBackground}
          activeOpacity={1}
          onPress={handleClose}
        />
        
        <View style={styles.modalContent}>
          <BlurView intensity={40} tint="dark" style={styles.modalBlur}>
            {/* Close button */}
            <TouchableOpacity
              style={styles.closeButton}
              onPress={handleClose}
              activeOpacity={0.7}
            >
              <Ionicons name="close" size={24} color="#FFFFFF" />
            </TouchableOpacity>
            
            {/* Badge image */}
            <View style={[
              styles.badgeImageWrapper,
              { borderColor: getBadgeColor(badge.category) }
            ]}>
              <LinearGradient
                colors={[getBadgeColor(badge.category), 'rgba(0,0,0,0.2)']}
                style={styles.badgeImageGradient}
              >
                <Image
                  source={{ uri: badge.imageUrl }}
                  style={styles.badgeDetailImage}
                  contentFit="cover"
                />
              </LinearGradient>
            </View>
            
            {/* Badge details */}
            <Text style={styles.badgeTitle}>{badge.name}</Text>
            <Text style={styles.badgeDescription}>{badge.description}</Text>
            
            {/* Achievement date */}
            <View style={styles.achievedDateContainer}>
              <Text style={styles.achievedLabel}>Achieved on</Text>
              <Text style={styles.achievedDate}>{formatDate(badge.achievedAt)}</Text>
            </View>
            
            {/* Category badge */}
            <View style={[
              styles.categoryBadge,
              { backgroundColor: `${getBadgeColor(badge.category)}20` }
            ]}>
              <Text style={[
                styles.categoryText,
                { color: getBadgeColor(badge.category) }
              ]}>
                {badge.category.charAt(0).toUpperCase() + badge.category.slice(1)}
              </Text>
            </View>
          </BlurView>
        </View>
      </View>
    </Modal>
  );
};

// Badge Item Component
const BadgeItem: React.FC<{
  badge: Badge;
  onPress: (badge: Badge) => void;
}> = ({ badge, onPress }) => {
  // Get badge color based on category
  const getBadgeColor = (category: string): string => {
    switch (category) {
      case 'achievement':
        return '#0A84FF';
      case 'streak':
        return '#FF9500';
      case 'challenge':
        return '#FF2D55';
      case 'membership':
        return '#64D2FF';
      default:
        return '#0A84FF';
    }
  };

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress(badge);
  };

  return (
    <TouchableOpacity
      style={styles.badgeItemContainer}
      onPress={handlePress}
      activeOpacity={0.8}
    >
      <View style={[
        styles.badgeImageContainer,
        { borderColor: getBadgeColor(badge.category) }
      ]}>
        <LinearGradient
          colors={[getBadgeColor(badge.category), 'rgba(0,0,0,0.2)']}
          style={styles.badgeGradient}
        >
          <Image
            source={{ uri: badge.imageUrl }}
            style={styles.badgeImage}
            contentFit="cover"
          />
        </LinearGradient>
      </View>
      <Text style={styles.badgeName} numberOfLines={2}>{badge.name}</Text>
    </TouchableOpacity>
  );
};

// Main BadgeCarousel Component
const BadgeCarousel: React.FC<BadgeCarouselProps> = ({
  badges,
  title = 'Achievements',
  emptyMessage = 'No badges earned yet',
}) => {
  const [selectedBadge, setSelectedBadge] = useState<Badge | null>(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);

  const handleBadgePress = (badge: Badge) => {
    setSelectedBadge(badge);
    setDetailModalVisible(true);
  };

  const handleCloseModal = () => {
    setDetailModalVisible(false);
  };

  return (
    <View style={styles.container}>
      {/* Section header */}
      <View style={styles.headerContainer}>
        <Text style={styles.headerTitle}>{title}</Text>
        {badges.length > 0 && (
          <Text style={styles.badgeCount}>{badges.length}</Text>
        )}
      </View>

      {/* Badge carousel */}
      {badges.length > 0 ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.carouselContent}
        >
          {badges.map((badge) => (
            <BadgeItem
              key={badge.id}
              badge={badge}
              onPress={handleBadgePress}
            />
          ))}
        </ScrollView>
      ) : (
        <View style={styles.emptyContainer}>
          <Ionicons name="ribbon-outline" size={40} color="rgba(255,255,255,0.2)" />
          <Text style={styles.emptyText}>{emptyMessage}</Text>
        </View>
      )}

      {/* Badge detail modal */}
      <BadgeDetailModal
        badge={selectedBadge}
        visible={detailModalVisible}
        onClose={handleCloseModal}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginVertical: 8,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  badgeCount: {
    color: '#AAAAAA',
    fontSize: 16,
    marginLeft: 8,
  },
  carouselContent: {
    paddingHorizontal: 12,
  },
  badgeItemContainer: {
    alignItems: 'center',
    width: BADGE_SIZE + 20,
    marginHorizontal: 4,
  },
  badgeImageContainer: {
    width: BADGE_SIZE,
    height: BADGE_SIZE,
    borderRadius: BADGE_SIZE / 2,
    overflow: 'hidden',
    borderWidth: 2,
    marginBottom: 8,
  },
  badgeGradient: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeImage: {
    width: BADGE_SIZE - 8,
    height: BADGE_SIZE - 8,
    borderRadius: (BADGE_SIZE - 8) / 2,
  },
  badgeName: {
    color: '#FFFFFF',
    fontSize: 12,
    textAlign: 'center',
    height: 36,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 24,
    paddingHorizontal: 16,
  },
  emptyText: {
    color: '#AAAAAA',
    fontSize: 14,
    marginTop: 8,
  },
  
  // Modal styles
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  modalContent: {
    width: width * 0.85,
    maxWidth: 340,
    borderRadius: 20,
    overflow: 'hidden',
  },
  modalBlur: {
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 20,
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    zIndex: 10,
  },
  badgeImageWrapper: {
    width: BADGE_SIZE * 1.5,
    height: BADGE_SIZE * 1.5,
    borderRadius: (BADGE_SIZE * 1.5) / 2,
    overflow: 'hidden',
    borderWidth: 3,
    marginBottom: 16,
    marginTop: 8,
  },
  badgeImageGradient: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeDetailImage: {
    width: BADGE_SIZE * 1.3,
    height: BADGE_SIZE * 1.3,
    borderRadius: (BADGE_SIZE * 1.3) / 2,
  },
  badgeTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  badgeDescription: {
    color: '#DDDDDD',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 16,
  },
  achievedDateContainer: {
    alignItems: 'center',
    marginVertical: 8,
  },
  achievedLabel: {
    color: '#AAAAAA',
    fontSize: 14,
  },
  achievedDate: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
    marginTop: 4,
  },
  categoryBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginTop: 8,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '600',
  },
});

export default BadgeCarousel; 