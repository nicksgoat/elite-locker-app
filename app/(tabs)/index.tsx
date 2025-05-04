import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Image,
  ScrollView,
  SafeAreaView,
  Animated,
  FlatList,
  RefreshControl,
  Dimensions,
  Platform
} from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import FloatingActionButton from '../../components/ui/FloatingActionButton';

interface Club {
  id: string;
  name: string;
  category: string;
  members: number;
  posts: number;
  description: string;
  creator: string;
  image: string;
  verified: boolean;
  isMember: boolean;
  lastActivity: string;
}

// Mock data for clubs
const clubsData: Club[] = [
  {
    id: '1',
    name: 'Elite Speed Academy',
    category: 'Speed Training',
    members: 1234,
    posts: 56,
    description: 'The premier community for speed development across all sports. Daily training tips and form checks.',
    creator: 'Coach Mike Johnson',
    image: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?ixlib=rb-4.0.3&auto=format&fit=crop&w=1350&q=80',
    verified: true,
    isMember: true,
    lastActivity: '2 hours ago'
  },
  {
    id: '2',
    name: 'Power Lifters United',
    category: 'Strength Training',
    members: 867,
    posts: 128,
    description: 'For serious lifters focusing on powerlifting technique, competition prep, and PRs.',
    creator: 'Jane Smith',
    image: 'https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?ixlib=rb-4.0.3&auto=format&fit=crop&w=1350&q=80',
    verified: true,
    isMember: true,
    lastActivity: '5 min ago'
  },
  {
    id: '3',
    name: 'Endurance Runners',
    category: 'Cardio',
    members: 753,
    posts: 37,
    description: 'From 5Ks to ultramarathons, this community is for all endurance athletes.',
    creator: 'John Marathon',
    image: 'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?ixlib=rb-4.0.3&auto=format&fit=crop&w=1350&q=80',
    verified: false,
    isMember: false,
    lastActivity: '1 day ago'
  },
  {
    id: '4',
    name: 'Yoga Warriors',
    category: 'Flexibility',
    members: 542,
    posts: 89,
    description: 'Find your zen with our community of dedicated yoga practitioners.',
    creator: 'Sarah Zen',
    image: 'https://images.unsplash.com/photo-1545205597-3d9d02c29597?ixlib=rb-4.0.3&auto=format&fit=crop&w=1350&q=80',
    verified: true,
    isMember: true,
    lastActivity: '3 hours ago'
  },
  {
    id: '5',
    name: 'CrossFit Champions',
    category: 'Cross Training',
    members: 982,
    posts: 214,
    description: 'WODs, technique tips, and community challenges for CrossFit enthusiasts.',
    creator: 'Alex Fitness',
    image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?ixlib=rb-4.0.3&auto=format&fit=crop&w=1350&q=80',
    verified: true,
    isMember: false,
    lastActivity: '12 hours ago'
  },
  {
    id: '6',
    name: 'Basketball Skills Lab',
    category: 'Basketball',
    members: 673,
    posts: 78,
    description: 'Elevate your game with drills, analysis, and basketball IQ development.',
    creator: 'Coach Williams',
    image: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?ixlib=rb-4.0.3&auto=format&fit=crop&w=1350&q=80',
    verified: false,
    isMember: false,
    lastActivity: '2 days ago'
  },
  {
    id: '7',
    name: 'Olympic Lifting Club',
    category: 'Strength Training',
    members: 412,
    posts: 65,
    description: 'Dedicated to perfecting the snatch and clean & jerk with expert coaching.',
    creator: 'Maria Strong',
    image: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?ixlib=rb-4.0.3&auto=format&fit=crop&w=1350&q=80',
    verified: true,
    isMember: false,
    lastActivity: '6 hours ago'
  }
];

// Filter categories
const categories = [
  'All',
  'Strength Training',
  'Cardio',
  'CrossFit',
  'Speed Training',
  'Flexibility',
  'Basketball',
  'Football'
];

export default function ClubsScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'my' | 'explore'>('my');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [refreshing, setRefreshing] = useState(false);
  const [expandedClub, setExpandedClub] = useState<string | null>(null);
  
  // Filtered clubs based on active tab and selected category
  const filteredClubs = clubsData.filter(club => {
    // Filter by tab
    if (activeTab === 'my' && !club.isMember) return false;
    
    // Filter by category
    if (selectedCategory !== 'All' && club.category !== selectedCategory) return false;
    
    return true;
  });

  const handleTabChange = (tab: 'my' | 'explore') => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setActiveTab(tab);
  };

  const handleCategoryPress = (category: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedCategory(category);
  };

  const handleClubPress = (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    // Toggle expansion if clicking the same club
    if (expandedClub === id) {
      setExpandedClub(null);
    } else {
      setExpandedClub(id);
    }
  };
  
  const handleViewClub = (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push(`/club/${id}` as any);
  };

  const onRefresh = () => {
    setRefreshing(true);
    
    // Simulate refresh
    setTimeout(() => {
      setRefreshing(false);
    }, 1500);
  };

  const renderClubCard = ({ item }: { item: Club }) => {
    const isExpanded = expandedClub === item.id;
    
    return (
      <View style={styles.clubCard}>
        <TouchableOpacity 
          style={styles.clubCardContent}
          onPress={() => handleClubPress(item.id)}
          activeOpacity={0.9}
        >
          <View style={styles.clubCardHeader}>
            <Image source={{ uri: item.image }} style={styles.clubAvatar} />
            <View style={styles.clubInfo}>
              <View style={styles.clubNameRow}>
                <Text style={styles.clubName}>{item.name}</Text>
                {item.verified && (
                  <Ionicons name="checkmark-circle" size={16} color="#0A84FF" style={styles.verifiedIcon} />
                )}
              </View>
              <Text style={styles.clubStats}>
                <Ionicons name="people-outline" size={12} /> {item.members.toLocaleString()} members · {item.posts} posts
              </Text>
              <View style={styles.clubCategoryContainer}>
                <Text style={styles.clubCategory}>{item.category}</Text>
              </View>
            </View>
            <View style={styles.clubActions}>
              {item.isMember && (
                <View style={styles.memberBadge}>
                  <Text style={styles.memberBadgeText}>Member</Text>
                </View>
              )}
              <Text style={styles.lastActivity}>{item.lastActivity}</Text>
            </View>
          </View>
          
          {isExpanded && (
            <View style={styles.expandedContent}>
              <Text style={styles.clubDescription}>{item.description}</Text>
              <Text style={styles.createdBy}>Created by {item.creator}</Text>
              
              <View style={styles.expandedActions}>
                <TouchableOpacity 
                  style={styles.viewClubButton}
                  onPress={() => handleViewClub(item.id)}
                >
                  <Ionicons name="enter-outline" size={16} color="#FFFFFF" />
                  <Text style={styles.viewClubText}>View Club</Text>
                </TouchableOpacity>
                
                {!item.isMember ? (
                  <TouchableOpacity style={styles.joinButton}>
                    <Ionicons name="add-circle-outline" size={16} color="#FFFFFF" />
                    <Text style={styles.joinButtonText}>Join</Text>
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity style={styles.chatButton}>
                    <Ionicons name="chatbubble-outline" size={16} color="#FFFFFF" />
                    <Text style={styles.chatButtonText}>Chat</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          )}
        </TouchableOpacity>
      </View>
    );
  };

  const EmptyClubsList = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="people-outline" size={64} color="#666" />
      <Text style={styles.emptyTitle}>
        {activeTab === 'my' ? 'No clubs joined yet' : 'No clubs found'}
      </Text>
      <Text style={styles.emptySubtitle}>
        {activeTab === 'my' 
          ? 'Join clubs to see them here' 
          : 'Try changing your filter selection'}
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Tab Selector */}
      <View style={styles.tabContainer}>
        <BlurView intensity={30} tint="dark" style={styles.tabBlurView}>
          <View style={styles.tabSelector}>
            <TouchableOpacity 
              style={[styles.tab, activeTab === 'my' && styles.activeTab]}
              onPress={() => handleTabChange('my')}
            >
              <Text style={[styles.tabText, activeTab === 'my' && styles.activeTabText]}>
                My Clubs
              </Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.tab, activeTab === 'explore' && styles.activeTab]}
              onPress={() => handleTabChange('explore')}
            >
              <Text style={[styles.tabText, activeTab === 'explore' && styles.activeTabText]}>
                Explore
              </Text>
            </TouchableOpacity>
          </View>
        </BlurView>
      </View>
      
      {/* Categories */}
      <View style={styles.categoriesContainer}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesContent}
        >
          {categories.map((category) => (
            <TouchableOpacity 
              key={category}
              style={[
                styles.categoryItem, 
                selectedCategory === category && styles.categoryItemActive
              ]}
              onPress={() => handleCategoryPress(category)}
            >
              <Text style={[
                styles.categoryText, 
                selectedCategory === category && styles.categoryTextActive
              ]}>
                {category}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
      
      {/* Clubs List */}
      <FlatList
        data={filteredClubs}
        renderItem={renderClubCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.clubsList}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#0A84FF"
            colors={["#0A84FF"]}
          />
        }
        ListEmptyComponent={EmptyClubsList}
      />
      
      <FloatingActionButton />
    </SafeAreaView>
  );
}

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  tabContainer: {
    marginTop: 8,
    overflow: 'hidden',
  },
  tabBlurView: {
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  tabSelector: {
    flexDirection: 'row',
    backgroundColor: '#1C1C1E',
    borderRadius: 10,
    padding: 4,
    height: 40,
  },
  tab: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: 'rgba(10, 132, 255, 0.2)',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8E8E93',
  },
  activeTabText: {
    color: '#0A84FF',
  },
  categoriesContainer: {
    marginTop: 16,
    marginBottom: 8,
  },
  categoriesContent: {
    paddingHorizontal: 20,
  },
  categoryItem: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: 'rgba(44, 44, 46, 0.8)',
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#3A3A3C',
  },
  categoryItemActive: {
    backgroundColor: 'rgba(10, 132, 255, 0.2)',
    borderColor: '#0A84FF',
  },
  categoryText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
  categoryTextActive: {
    color: '#0A84FF',
  },
  clubsList: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  clubCard: {
    marginVertical: 8,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#1C1C1E',
    borderWidth: 1,
    borderColor: '#2C2C2E',
  },
  clubCardContent: {
    padding: 16,
  },
  clubCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  clubAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  clubInfo: {
    flex: 1,
  },
  clubNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  clubName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    marginRight: 4,
  },
  verifiedIcon: {
    marginLeft: 4,
  },
  clubStats: {
    fontSize: 12,
    color: '#8E8E93',
    marginTop: 2,
  },
  clubCategoryContainer: {
    marginTop: 4,
  },
  clubCategory: {
    fontSize: 11,
    color: '#0A84FF',
    fontWeight: '500',
    backgroundColor: 'rgba(10, 132, 255, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    overflow: 'hidden',
    alignSelf: 'flex-start',
  },
  clubActions: {
    alignItems: 'flex-end',
  },
  memberBadge: {
    backgroundColor: 'rgba(48, 209, 88, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    marginBottom: 4,
  },
  memberBadgeText: {
    fontSize: 11,
    color: '#30D158',
    fontWeight: '600',
  },
  lastActivity: {
    fontSize: 10,
    color: '#8E8E93',
  },
  expandedContent: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  clubDescription: {
    fontSize: 14,
    color: '#DDDDDD',
    lineHeight: 20,
    marginBottom: 8,
  },
  createdBy: {
    fontSize: 12,
    color: '#8E8E93',
    marginBottom: 16,
  },
  expandedActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  viewClubButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#363638',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    flex: 1,
    marginRight: 8,
    justifyContent: 'center',
  },
  viewClubText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 6,
  },
  joinButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0A84FF',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    flex: 1,
    justifyContent: 'center',
  },
  joinButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 6,
  },
  chatButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0A84FF',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    flex: 1,
    justifyContent: 'center',
  },
  chatButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 6,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    marginTop: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#8E8E93',
    textAlign: 'center',
  }
});
