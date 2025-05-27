import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  SafeAreaView,
  Platform,
  TouchableOpacity,
  Image
} from 'react-native';
import WorkoutFeedCard from '../../components/cards/WorkoutFeedCard';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

// Define the WorkoutFeedItem interface (can be imported if shared, e.g., from a types file)
interface WorkoutFeedItem {
  id: string;
  userName: string;
  userAvatarUrl?: string;
  workoutName: string;
  caloriesBurned?: number;
  totalVolume?: number;
  duration?: number; // in seconds for proper time formatting
  prsAchieved?: number;
  timestamp: string;
  location?: string;
  workoutId?: string; 
}

// Mock data for the feed - based on screenshot
const mockFeedData: WorkoutFeedItem[] = [
  {
    id: 'feed1',
    userName: 'Amir Amore',
    userAvatarUrl: 'https://i.pravatar.cc/150?u=amirfeed', // Placeholder avatar
    workoutName: 'Cycle',
    caloriesBurned: 497,
    duration: 47 * 60 + 13, // 47:13 in seconds
    timestamp: '4 hours ago',
    location: 'Canada',
    workoutId: 'placeholder-cycle-id', // Replace with actual ID if available
  },
  {
    id: 'feed2',
    userName: 'paige',
    userAvatarUrl: 'https://i.pravatar.cc/150?u=paigefeed', // Placeholder avatar
    workoutName: 'Hamstrings + Glutes',
    caloriesBurned: 225,
    totalVolume: 21405,
    duration: 60 * 60 + 15, // 1:00:15 in seconds
    prsAchieved: 1,
    timestamp: '15 hours ago',
    location: 'Canada',
    workoutId: '1', // Matches the ID from workoutHistory for Hamstrings + Glutes in detail screen
  },
  {
    id: 'feed3',
    userName: 'Amir Amore',
    userAvatarUrl: 'https://i.pravatar.cc/150?u=amirfeed2',
    workoutName: 'Pull B',
    caloriesBurned: 528,
    totalVolume: 24545,
    duration: 79 * 60, // 1:19:00 in seconds
    prsAchieved: 1,
    timestamp: '1 day ago',
    location: 'Canada',
    workoutId: 'placeholder-pullb-id',
  },
];

export default function HomeScreen() {
  const [feedItems, setFeedItems] = useState<WorkoutFeedItem[]>([]);
  const [activeTab, setActiveTab] = useState('Following'); // State for active tab

  useEffect(() => {
    // In a real app, fetch data based on activeTab or other filters
    setFeedItems(mockFeedData);
  }, [activeTab]);

  const handleCardPress = (workoutId: string) => {
    if (workoutId.trim() === '') {
        console.warn('Workout ID is empty, cannot navigate.');
        return;
    }
    router.push(`/workout/detail/${workoutId}`);
  };

  const handleLikePress = (itemId: string) => {
    console.log('Liked item:', itemId);
    // Implement like logic, e.g., update state and call API
  };

  const handleCommentPress = (itemId: string) => {
    console.log('Comment on item:', itemId);
    // Navigate to comment screen or show comment input modal
  };
    
  const handleMoreOptionsPress = (itemId: string) => {
    console.log('More options for item:', itemId);
    // Implement action sheet or menu for more options
  };

  const renderItem = ({ item }: { item: WorkoutFeedItem }) => (
    <WorkoutFeedCard 
      workoutItem={item}
      onPress={() => item.workoutId && handleCardPress(item.workoutId)}
      onLike={() => handleLikePress(item.id)}
      onComment={() => handleCommentPress(item.id)}
      onMoreOptions={() => handleMoreOptionsPress(item.id)}
    />
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        {/* Tab buttons matching the screenshot */}
        <View style={styles.tabContainer}>
          <TouchableOpacity 
            style={[styles.tabButton, activeTab === 'Top' && styles.activeTabButton]}
            onPress={() => setActiveTab('Top')}
          >
            <Text style={[styles.tabText, activeTab === 'Top' && styles.activeTabText]}>Top</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.tabButton, activeTab === 'Community' && styles.activeTabButton]}
            onPress={() => setActiveTab('Community')}
          >
            <Text style={[styles.tabText, activeTab === 'Community' && styles.activeTabText]}>Community</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.tabButton, activeTab === 'Following' && styles.activeTabButton]}
            onPress={() => setActiveTab('Following')}
          >
            <Text style={[styles.tabText, activeTab === 'Following' && styles.activeTabText]}>Following</Text>
          </TouchableOpacity>
        </View>
        
        <TouchableOpacity style={styles.searchButton} onPress={() => console.log('Search pressed')}>
          <View style={styles.searchButtonContainer}>
            <Ionicons name="search" size={22} color="#8E8E93" />
          </View>
        </TouchableOpacity>
      </View>
      
      <FlatList
        data={feedItems}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContentContainer}
        showsVerticalScrollIndicator={false}
      />
      
      <TouchableOpacity style={styles.fab} onPress={() => console.log('FAB pressed')}>
        <Ionicons name="add" size={28} color="#FFFFFF" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#000000',
    paddingTop: Platform.OS === 'android' ? 25 : 0,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  tabContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    paddingVertical: 4,
  },
  tabButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
  },
  activeTabButton: {
    // No background needed for the active tab in this design
  },
  tabText: {
    fontSize: 16,
    color: '#8E8E93', // Inactive tab color
    fontWeight: '500',
  },
  activeTabText: {
    color: '#FFFFFF', // Active tab text color
    fontWeight: '600',
  },
  searchButton: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchButtonContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#1C1C1E',
    alignItems: 'center',
    justifyContent: 'center',
  },
  listContentContainer: {
    paddingBottom: 80,
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    backgroundColor: '#000000',
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.27,
    shadowRadius: 4.65,
    elevation: 6,
    borderWidth: 1,
    borderColor: '#333333',
  },
}); 