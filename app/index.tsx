import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Image,
  TextInput,
  Animated,
  Pressable,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';

// Mock clubs data
const mockClubs = [
  {
    id: '1',
    name: 'Elite Speed Academy',
    description: 'Professional speed and agility training for athletes looking to improve their performance on the field.',
    sport_tags: ['speed_training', 'agility', 'performance'],
    members: 1234,
    onlineMembers: 42,
    creator: {
      name: 'Coach Mike Johnson',
      avatar: 'https://i.pravatar.cc/150?img=1',
      verified: true,
    },
    pricing: {
      monthly: 29.99,
      annual: 299.99,
      trial_days: 7,
    },
    stats: {
      sessions_this_week: 5,
      active_programs: 3,
      avg_rating: 4.8,
    },
    preview_content: 'New HIIT Program + Live Session Thursday',
    image_url: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?ixlib=rb-4.0.3&auto=format&fit=crop&w=1350&q=80',
    privacy: 'public',
    featured: true,
  },
  {
    id: '2',
    name: 'Pro Football Training',
    description: 'Take your football skills to the next level with training from NFL veterans and coaches.',
    sport_tags: ['football', 'strength', 'pro'],
    members: 875,
    onlineMembers: 33,
    creator: {
      name: 'Tom Richards',
      avatar: 'https://i.pravatar.cc/150?img=2',
      verified: true,
    },
    pricing: {
      monthly: 39.99,
      annual: 399.99,
      trial_days: 7,
    },
    stats: {
      sessions_this_week: 3,
      active_programs: 5,
      avg_rating: 4.7,
    },
    preview_content: 'QB Camp Starting Next Week',
    image_url: 'https://images.unsplash.com/photo-1566577739112-5180d4bf9390?ixlib=rb-4.0.3&auto=format&fit=crop&w=1350&q=80',
    privacy: 'public',
    featured: false,
  },
  {
    id: '3',
    name: 'Yoga Flow Masters',
    description: 'Achieve balance, flexibility, and strength through our specialized yoga programs for all levels.',
    sport_tags: ['yoga', 'wellness', 'flexibility'],
    members: 2105,
    onlineMembers: 87,
    creator: {
      name: 'Sarah Williams',
      avatar: 'https://i.pravatar.cc/150?img=5',
      verified: true,
    },
    pricing: {
      monthly: 19.99,
      annual: 199.99,
      trial_days: 14,
    },
    stats: {
      sessions_this_week: 12,
      active_programs: 6,
      avg_rating: 4.9,
    },
    preview_content: 'Morning Flow Series + Meditation Guide',
    image_url: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?ixlib=rb-4.0.3&auto=format&fit=crop&w=1350&q=80',
    privacy: 'public',
    featured: true,
  }
];

// Available sports for filtering
const availableSports = [
  { id: 'all', name: 'All' },
  { id: 'football', name: 'Football' },
  { id: 'basketball', name: 'Basketball' },
  { id: 'speed_training', name: 'Speed Training' },
  { id: 'agility', name: 'Agility' },
  { id: 'strength', name: 'Strength' },
  { id: 'yoga', name: 'Yoga' },
  { id: 'wellness', name: 'Wellness' },
  { id: 'flexibility', name: 'Flexibility' },
];

const ClubItem = ({ item, onPress }) => {
  return (
    <Pressable
      style={styles.clubItem}
      onPress={onPress}
      android_ripple={{ color: 'rgba(255, 255, 255, 0.1)' }}
    >
      <View style={styles.clubHeader}>
        <View style={styles.creatorInfo}>
          <Image source={{ uri: item.creator.avatar }} style={styles.creatorAvatar} />
          <View style={styles.creatorDetails}>
            <Text style={styles.clubName}>{item.name}</Text>
            <View style={styles.creatorRow}>
              <Text style={styles.creatorName}>{item.creator.name}</Text>
              {item.creator.verified && (
                <Ionicons name="checkmark-circle" size={16} color="#0A84FF" style={styles.verifiedBadge} />
              )}
            </View>
          </View>
        </View>
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{item.stats.sessions_this_week}</Text>
            <Text style={styles.statLabel}>Sessions</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{item.stats.avg_rating}</Text>
            <Text style={styles.statLabel}>Rating</Text>
          </View>
        </View>
      </View>
      
      <Image source={{ uri: item.image_url }} style={styles.clubImage} />
      
      <View style={styles.clubContent}>
        <Text style={styles.description} numberOfLines={2}>
          {item.description}
        </Text>
        
        <View style={styles.tagsContainer}>
          {item.sport_tags.map((tag, index) => (
            <View key={index} style={styles.tag}>
              <Text style={styles.tagText}>#{tag}</Text>
            </View>
          ))}
        </View>
        
        <View style={styles.clubFooter}>
          <View style={styles.memberInfo}>
            <Ionicons name="people" size={14} color="#8E8E93" />
            <Text style={styles.memberCount}>
              {item.onlineMembers} online • {item.members} members
            </Text>
          </View>
          <View style={styles.pricingBadge}>
            <Text style={styles.price}>${item.pricing.monthly}/mo</Text>
          </View>
        </View>
      </View>
    </Pressable>
  );
};

export default function ClubsScreen() {
  const [clubs] = useState(mockClubs);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [selectedSport, setSelectedSport] = useState('all');
  const searchAnimation = new Animated.Value(0);

  const toggleSearch = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setShowSearch(!showSearch);
    Animated.spring(searchAnimation, {
      toValue: showSearch ? 0 : 1,
      useNativeDriver: true,
    }).start();
  };

  const filteredClubs = clubs.filter(club => {
    // Apply search filter
    const matchesSearch = 
      club.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      club.description.toLowerCase().includes(searchQuery.toLowerCase());
      
    // Apply sport tag filter
    const matchesSport = 
      selectedSport === 'all' || 
      club.sport_tags.includes(selectedSport);
      
    return matchesSearch && matchesSport;
  });

  const handleNewClub = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push('/create');
  };

  const handleClubPress = (clubId) => {
    router.push(`/club/${clubId}`);
  };

  const handleSportSelect = (sportId) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedSport(sportId);
  };

  return (
    <SafeAreaView style={styles.container}>
      <BlurView intensity={30} style={styles.header}>
        <Text style={styles.title}>Elite Clubs</Text>
        <View style={styles.headerButtons}>
          <TouchableOpacity style={styles.headerButton} onPress={handleNewClub}>
            <Ionicons name="add-circle-outline" size={24} color="#0A84FF" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerButton} onPress={toggleSearch}>
            <Ionicons name="search" size={24} color="#0A84FF" />
          </TouchableOpacity>
        </View>
      </BlurView>
      
      <Animated.View
        style={[
          styles.searchContainer,
          {
            transform: [
              {
                translateY: searchAnimation.interpolate({
                  inputRange: [0, 1],
                  outputRange: [-50, 0],
                }),
              },
            ],
            opacity: searchAnimation,
          },
        ]}
      >
        <BlurView intensity={30} style={styles.searchInputContainer}>
          <Ionicons name="search" size={20} color="#8E8E93" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search clubs"
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#8E8E93"
            returnKeyType="search"
            clearButtonMode="while-editing"
          />
        </BlurView>
      </Animated.View>

      {/* Sports filter horizontal scrollview */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.sportsFilterContainer}
        contentContainerStyle={styles.sportsFilterContent}
      >
        {availableSports.map((sport) => (
          <TouchableOpacity
            key={sport.id}
            style={[
              styles.sportFilterItem,
              selectedSport === sport.id && styles.sportFilterItemSelected,
            ]}
            onPress={() => handleSportSelect(sport.id)}
          >
            <Text
              style={[
                styles.sportFilterText,
                selectedSport === sport.id && styles.sportFilterTextSelected,
              ]}
            >
              {sport.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <FlatList
        data={filteredClubs}
        renderItem={({ item }) => (
          <ClubItem
            item={item}
            onPress={() => handleClubPress(item.id)}
          />
        )}
        keyExtractor={(item) => item.id}
        style={styles.list}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(60, 60, 67, 0.29)',
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: -0.4,
  },
  headerButtons: {
    flexDirection: 'row',
  },
  headerButton: {
    padding: 8,
    marginLeft: 8,
  },
  searchContainer: {
    overflow: 'hidden',
    paddingHorizontal: 16,
    paddingBottom: 8,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(142, 142, 147, 0.12)',
    borderRadius: 10,
    paddingHorizontal: 8,
    height: 36,
  },
  searchIcon: {
    marginRight: 6,
  },
  searchInput: {
    flex: 1,
    fontSize: 17,
    color: '#FFFFFF',
    paddingVertical: 8,
    letterSpacing: -0.3,
  },
  sportsFilterContainer: {
    paddingLeft: 16,
    marginTop: 12,
    marginBottom: 4,
  },
  sportsFilterContent: {
    paddingRight: 16,
  },
  sportFilterItem: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: 'rgba(142, 142, 147, 0.12)',
    marginRight: 8,
  },
  sportFilterItemSelected: {
    backgroundColor: '#0A84FF',
  },
  sportFilterText: {
    fontSize: 14,
    color: '#8E8E93',
    fontWeight: '500',
  },
  sportFilterTextSelected: {
    color: '#FFFFFF',
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingBottom: 16,
  },
  clubItem: {
    backgroundColor: 'rgba(30, 30, 30, 0.8)',
    borderRadius: 16,
    margin: 8,
    overflow: 'hidden',
  },
  clubHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
  },
  creatorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  creatorAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  creatorDetails: {
    flex: 1,
  },
  clubName: {
    fontSize: 17,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 2,
    letterSpacing: -0.3,
  },
  creatorRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  creatorName: {
    fontSize: 14,
    color: '#8E8E93',
    marginRight: 4,
  },
  verifiedBadge: {
    marginLeft: 4,
  },
  statsContainer: {
    flexDirection: 'row',
  },
  statItem: {
    alignItems: 'center',
    marginLeft: 16,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  statLabel: {
    fontSize: 12,
    color: '#8E8E93',
  },
  clubImage: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
  },
  clubContent: {
    padding: 12,
  },
  description: {
    fontSize: 15,
    color: '#FFFFFF',
    marginBottom: 12,
    letterSpacing: -0.2,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  tag: {
    backgroundColor: 'rgba(10, 132, 255, 0.2)',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginRight: 8,
    marginBottom: 4,
  },
  tagText: {
    fontSize: 12,
    color: '#0A84FF',
    letterSpacing: -0.2,
  },
  clubFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  memberInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  memberCount: {
    fontSize: 13,
    color: '#8E8E93',
    marginLeft: 4,
    letterSpacing: -0.2,
  },
  pricingBadge: {
    backgroundColor: '#0A84FF',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  price: {
    fontSize: 13,
    color: '#FFFFFF',
    fontWeight: '600',
  },
}); 