import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import IMessagePageWrapper from '@/components/layout/iMessagePageWrapper';

// Club data types
interface Club {
  id: string;
  name: string;
  description: string;
  memberCount: number;
  imageUrl: string;
  owner: {
    name: string;
    avatarUrl: string;
    isVerified: boolean;
  };
  tags: string[];
  isMember: boolean;
  isPremium: boolean;
  price?: number;
}

// Mock data for clubs
const mockClubs: Club[] = [
  {
    id: '1',
    name: 'Elite Power Lifters',
    description: 'A community focused on strength training and powerlifting techniques.',
    memberCount: 2453,
    imageUrl: 'https://images.unsplash.com/photo-1526506118085-60ce8714f8c5',
    owner: {
      name: 'Chris Bumstead',
      avatarUrl: 'https://randomuser.me/api/portraits/men/15.jpg',
      isVerified: true,
    },
    tags: ['Powerlifting', 'Strength'],
    isMember: true,
    isPremium: true,
    price: 9.99,
  },
  {
    id: '2',
    name: 'HIIT Warriors',
    description: 'High-intensity interval training workouts for maximum results.',
    memberCount: 1874,
    imageUrl: 'https://images.unsplash.com/photo-1549060279-7e168fcee0c2',
    owner: {
      name: 'Sara Martinez',
      avatarUrl: 'https://randomuser.me/api/portraits/women/28.jpg',
      isVerified: true,
    },
    tags: ['HIIT', 'Cardio'],
    isMember: true,
    isPremium: false,
  },
  {
    id: '3',
    name: 'Yoga & Mindfulness',
    description: 'Find your balance with yoga poses and mindfulness practices.',
    memberCount: 3287,
    imageUrl: 'https://images.unsplash.com/photo-1575052814086-f385e2e2ad1b',
    owner: {
      name: 'Amelia Wong',
      avatarUrl: 'https://randomuser.me/api/portraits/women/45.jpg',
      isVerified: true,
    },
    tags: ['Yoga', 'Mindfulness', 'Flexibility'],
    isMember: false,
    isPremium: true,
    price: 4.99,
  },
  {
    id: '4',
    name: 'Calisthenics Crew',
    description: 'Bodyweight exercises and street workout techniques.',
    memberCount: 1435,
    imageUrl: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b',
    owner: {
      name: 'Michael Stevens',
      avatarUrl: 'https://randomuser.me/api/portraits/men/36.jpg',
      isVerified: false,
    },
    tags: ['Calisthenics', 'Bodyweight', 'Street Workout'],
    isMember: false,
    isPremium: false,
  },
  {
    id: '5',
    name: 'Marathon Runners',
    description: 'Training plans and tips for marathon and long-distance running.',
    memberCount: 2109,
    imageUrl: 'https://images.unsplash.com/photo-1452626038306-9aae5e071dd1',
    owner: {
      name: 'Jessica Parker',
      avatarUrl: 'https://randomuser.me/api/portraits/women/65.jpg',
      isVerified: true,
    },
    tags: ['Running', 'Endurance', 'Marathon'],
    isMember: false,
    isPremium: true,
    price: 7.99,
  },
];

// Filter categories
const categories = [
  { id: 'all', name: 'All Clubs' },
  { id: 'my', name: 'My Clubs' },
  { id: 'premium', name: 'Premium' },
  { id: 'free', name: 'Free' },
];

export default function ClubsScreen() {
  const router = useRouter();
  const [activeCategory, setActiveCategory] = useState('all');
  const [refreshing, setRefreshing] = useState(false);

  // Handle club press
  const handleClubPress = useCallback((clubId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(`/club/${clubId}`);
  }, [router]);

  // Handle create club
  const handleCreateClub = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push('/club/create');
  }, [router]);

  // Filter clubs based on active category
  const filteredClubs = useCallback(() => {
    switch (activeCategory) {
      case 'my':
        return mockClubs.filter(club => club.isMember);
      case 'premium':
        return mockClubs.filter(club => club.isPremium);
      case 'free':
        return mockClubs.filter(club => !club.isPremium);
      default:
        return mockClubs;
    }
  }, [activeCategory]);

  // Render club item
  const renderClubItem = ({ item }: { item: Club }) => (
    <TouchableOpacity 
      style={styles.clubCard}
      onPress={() => handleClubPress(item.id)}
      activeOpacity={0.8}
    >
      <BlurView intensity={25} tint="dark" style={styles.cardBlur}>
        <Image 
          source={{ uri: item.imageUrl }}
          style={styles.clubImage}
          contentFit="cover"
        />
        
        <View style={styles.clubInfo}>
          <View style={styles.clubTitleRow}>
            <Text style={styles.clubName}>{item.name}</Text>
            {item.isPremium && (
              <View style={styles.premiumBadge}>
                <Ionicons name="star" size={12} color="#FFFFFF" />
                <Text style={styles.premiumText}>Premium</Text>
              </View>
            )}
          </View>
          
          <Text style={styles.clubDescription} numberOfLines={2}>
            {item.description}
          </Text>
          
          <View style={styles.clubDetailsRow}>
            <View style={styles.ownerInfo}>
              <Image 
                source={{ uri: item.owner.avatarUrl }}
                style={styles.ownerAvatar}
                contentFit="cover"
              />
              <Text style={styles.ownerName}>{item.owner.name}</Text>
              {item.owner.isVerified && (
                <Ionicons name="checkmark-circle" size={14} color="#0A84FF" style={{ marginLeft: 2 }} />
              )}
            </View>
            
            <View style={styles.memberCount}>
              <Ionicons name="people-outline" size={14} color="#8E8E93" />
              <Text style={styles.memberCountText}>
                {item.memberCount.toLocaleString()}
              </Text>
            </View>
          </View>
          
          <View style={styles.tagsContainer}>
            {item.tags.map((tag, index) => (
              <View key={index} style={styles.tagBadge}>
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
          </View>
          
          <View style={styles.actionRow}>
            {item.isMember ? (
              <TouchableOpacity style={styles.memberButton}>
                <Text style={styles.memberButtonText}>Member</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity 
                style={[
                  styles.joinButton,
                  item.isPremium ? styles.joinPremiumButton : {}
                ]}
              >
                <Text style={styles.joinButtonText}>
                  {item.isPremium ? `Join • $${item.price}/mo` : 'Join Free'}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </BlurView>
    </TouchableOpacity>
  );

  return (
    <IMessagePageWrapper 
      title="Clubs" 
      subtitle="Join communities"
      showHeader={false}
    >
      {/* Category filters */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.categoriesContainer}
        contentContainerStyle={styles.categoriesContent}
      >
        {categories.map((category) => (
          <TouchableOpacity
            key={category.id}
            style={[
              styles.categoryButton,
              activeCategory === category.id ? styles.categoryButtonActive : {}
            ]}
            onPress={() => setActiveCategory(category.id)}
          >
            <Text 
              style={[
                styles.categoryText,
                activeCategory === category.id ? styles.categoryTextActive : {}
              ]}
            >
              {category.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      
      {/* Create club button */}
      <TouchableOpacity 
        style={styles.createClubButton}
        onPress={handleCreateClub}
      >
        <BlurView intensity={25} tint="dark" style={styles.createButtonBlur}>
          <Ionicons name="add-circle" size={24} color="#0A84FF" />
          <Text style={styles.createButtonText}>Create a Club</Text>
        </BlurView>
      </TouchableOpacity>
      
      {/* Clubs list */}
      <FlatList
        data={filteredClubs()}
        renderItem={renderClubItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.clubsList}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={{ height: 16 }} />}
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <Ionicons name="people" size={64} color="#666" />
            <Text style={styles.emptyTitle}>No clubs found</Text>
            <Text style={styles.emptySubtitle}>Try a different filter or create your own club</Text>
          </View>
        )}
      />
    </IMessagePageWrapper>
  );
}

const styles = StyleSheet.create({
  categoriesContainer: {
    marginBottom: 16,
  },
  categoriesContent: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(58, 58, 60, 0.5)',
    marginRight: 8,
  },
  categoryButtonActive: {
    backgroundColor: '#0A84FF',
  },
  categoryText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
  categoryTextActive: {
    fontWeight: '600',
  },
  createClubButton: {
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  createButtonBlur: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
  },
  createButtonText: {
    color: '#0A84FF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  clubsList: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  clubCard: {
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  cardBlur: {
    overflow: 'hidden',
  },
  clubImage: {
    width: '100%',
    height: 160,
  },
  clubInfo: {
    padding: 16,
  },
  clubTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  clubName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    flex: 1,
  },
  premiumBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 204, 0, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  premiumText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFCC00',
    marginLeft: 4,
  },
  clubDescription: {
    fontSize: 14,
    color: '#CCCCCC',
    marginBottom: 12,
    lineHeight: 20,
  },
  clubDetailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  ownerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ownerAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginRight: 8,
  },
  ownerName: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  memberCount: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  memberCountText: {
    fontSize: 14,
    color: '#8E8E93',
    marginLeft: 4,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  tagBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
    marginBottom: 8,
  },
  tagText: {
    fontSize: 12,
    color: '#FFFFFF',
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  memberButton: {
    backgroundColor: 'rgba(58, 58, 60, 0.5)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  memberButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  joinButton: {
    backgroundColor: '#0A84FF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  joinPremiumButton: {
    backgroundColor: '#FFCC00',
  },
  joinButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 60,
    paddingHorizontal: 20,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#8E8E93',
    textAlign: 'center',
  },
}); 