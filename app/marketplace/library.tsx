/**
 * Elite Locker - Your Library Screen
 * Spotify-style personal library for saved workouts, programs, and clubs
 */

import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Dimensions,
    FlatList,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

import ClubCard from '../../components/cards/ClubCard';
import ProgramCard from '../../components/cards/ProgramCard';
import { WorkoutCard } from '../../components/design-system/cards';
import IMessagePageWrapper from '../../components/layout/iMessagePageWrapper';
import { useAuthContext } from '../../contexts/AuthContext';
import { clubService } from '../../services/clubService';
import { programService } from '../../services/programService';
import { workoutService } from '../../services/workoutService';

const { width: screenWidth } = Dimensions.get('window');

const libraryTabs = [
  { id: 'all', title: 'All', icon: 'library' },
  { id: 'workouts', title: 'Workouts', icon: 'fitness' },
  { id: 'programs', title: 'Programs', icon: 'calendar' },
  { id: 'clubs', title: 'Clubs', icon: 'people' },
  { id: 'saved', title: 'Saved', icon: 'bookmark' },
];

const sortOptions = [
  { id: 'recent', title: 'Recently Added' },
  { id: 'alphabetical', title: 'Alphabetical' },
  { id: 'creator', title: 'Creator' },
  { id: 'type', title: 'Type' },
];

export default function MarketplaceLibraryScreen() {
  const router = useRouter();
  const { user } = useAuthContext();

  const [activeTab, setActiveTab] = useState('all');
  const [sortBy, setSortBy] = useState('recent');
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [libraryContent, setLibraryContent] = useState<any[]>([]);
  const [userWorkouts, setUserWorkouts] = useState<any[]>([]);
  const [userPrograms, setUserPrograms] = useState<any[]>([]);
  const [userClubs, setUserClubs] = useState<any[]>([]);
  const [savedContent, setSavedContent] = useState<any[]>([]);

  const loadLibraryContent = async () => {
    if (!user?.id) return;

    try {
      const [workouts, programs, clubs] = await Promise.all([
        workoutService.getWorkoutHistory({ limit: 50 }).catch(() => []),
        programService.getPrograms().catch(() => []),
        clubService.getClubs({ limit: 50 }).catch(() => []),
      ]);

      const workoutsArray = Array.isArray(workouts) ? workouts : [];
      const programsArray = Array.isArray(programs) ? programs : [];
      const clubsArray = Array.isArray(clubs) ? clubs : [];

      // Transform content for display
      const transformedWorkouts = workoutsArray.map(workout => ({
        ...workout,
        type: 'workout',
        imageUrl: workout.image_url || workout.thumbnail_url || '',
        createdAt: workout.created_at,
        // Map fields for card compatibility
        title: workout.title || workout.name,
        authorName: workout.author_name || workout.created_by?.name || 'Unknown Author',
        authorImageUrl: workout.author_image_url || workout.created_by?.avatar_url,
        exerciseCount: workout.exercise_count || workout.exercises?.length || 0,
        level: workout.difficulty || workout.level || 'beginner',
      }));

      const transformedPrograms = programsArray.map(program => ({
        ...program,
        type: 'program',
        imageUrl: program.image_url || program.thumbnail_url || '',
        createdAt: program.created_at,
        // Map fields for card compatibility
        title: program.title || program.name,
        authorName: program.author_name || program.created_by?.name || 'Unknown Author',
        authorImageUrl: program.author_image_url || program.created_by?.avatar_url,
        workoutCount: program.workout_count || program.workouts?.length || 0,
        level: program.difficulty || program.level || 'beginner',
        duration: program.duration_weeks || program.duration,
      }));

      const transformedClubs = clubsArray.map(club => ({
        ...club,
        type: 'club',
        imageUrl: club.profile_image_url || '',
        createdAt: club.created_at,
        // Map fields for card compatibility
        name: club.name,
        ownerName: club.owner_name || club.owner?.name || 'Unknown Owner',
        ownerImageUrl: club.owner_image_url || club.owner?.avatar_url,
        profileImageUrl: club.profile_image_url,
        coverImageUrl: club.banner_image_url,
        memberCount: club.member_count,
        price: club.price,
        isSubscribed: club.is_subscribed || false,
      }));

      setUserWorkouts(transformedWorkouts);
      setUserPrograms(transformedPrograms);
      setUserClubs(transformedClubs);

      // Combine all content for "All" tab
      const allContent = [
        ...transformedWorkouts,
        ...transformedPrograms,
        ...transformedClubs,
      ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

      setLibraryContent(allContent);
    } catch (error) {
      console.error('Error loading library content:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadLibraryContent();
  }, [user?.id]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadLibraryContent();
    setRefreshing(false);
  }, []);

  const handleTabPress = useCallback((tabId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setActiveTab(tabId);
  }, []);

  const handleSortPress = useCallback((sortId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSortBy(sortId);
  }, []);

  const handleItemPress = useCallback((item: any) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    switch (item.type) {
      case 'workout':
        // Pass the workout data as query params for the detail screen
        router.push({
          pathname: `/workout/detail/${item.id}`,
          params: {
            workoutData: JSON.stringify({
              id: item.id,
              title: item.title,
              description: item.description,
              duration: item.duration,
              exerciseCount: item.exerciseCount,
              level: item.level,
              imageUrl: item.imageUrl,
              authorName: item.authorName,
              authorImageUrl: item.authorImageUrl,
              price: item.price
            })
          }
        } as any);
        break;
      case 'program':
        router.push({
          pathname: `/programs/detail/${item.id}`,
          params: {
            programData: JSON.stringify({
              id: item.id,
              title: item.title,
              description: item.description,
              duration: item.duration,
              workoutCount: item.workoutCount,
              level: item.level,
              imageUrl: item.imageUrl,
              authorName: item.authorName,
              authorImageUrl: item.authorImageUrl,
              price: item.price
            })
          }
        } as any);
        break;
      case 'club':
        router.push({
          pathname: `/club/${item.id}`,
          params: {
            clubData: JSON.stringify({
              id: item.id,
              name: item.name,
              description: item.description,
              ownerName: item.ownerName,
              ownerImageUrl: item.ownerImageUrl,
              profileImageUrl: item.profileImageUrl,
              coverImageUrl: item.coverImageUrl,
              memberCount: item.memberCount,
              price: item.price,
              isSubscribed: item.isSubscribed
            })
          }
        } as any);
        break;
    }
  }, [router]);



  const getFilteredContent = () => {
    switch (activeTab) {
      case 'workouts':
        return userWorkouts;
      case 'programs':
        return userPrograms;
      case 'clubs':
        return userClubs;
      case 'saved':
        return savedContent;
      default:
        return libraryContent;
    }
  };

  const renderTab = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={[
        styles.tab,
        activeTab === item.id && styles.tabActive
      ]}
      onPress={() => handleTabPress(item.id)}
      activeOpacity={0.8}
    >
      <Ionicons
        name={item.icon as any}
        size={20}
        color={activeTab === item.id ? '#0A84FF' : 'rgba(255, 255, 255, 0.6)'}
      />
      <Text style={[
        styles.tabText,
        activeTab === item.id && styles.tabTextActive
      ]}>
        {item.title}
      </Text>
    </TouchableOpacity>
  );

  const renderSortOption = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={[
        styles.sortOption,
        sortBy === item.id && styles.sortOptionActive
      ]}
      onPress={() => handleSortPress(item.id)}
      activeOpacity={0.8}
    >
      <Text style={[
        styles.sortOptionText,
        sortBy === item.id && styles.sortOptionTextActive
      ]}>
        {item.title}
      </Text>
    </TouchableOpacity>
  );

  const renderLibraryItem = ({ item }: { item: any }) => {
    switch (item.type) {
      case 'workout':
        return (
          <WorkoutCard
            workout={{
              id: item.id,
              title: item.title,
              description: item.description,
              duration: item.duration,
              exercises: item.exerciseCount,
              thumbnailUrl: item.imageUrl,
              level: item.level,
              createdBy: {
                id: item.authorId || '',
                name: item.authorName,
                avatarUrl: item.authorImageUrl
              }
            }}
            variant="default"
            onPress={() => handleItemPress(item)}
          />
        );
      case 'program':
        return (
          <ProgramCard
            id={item.id}
            title={item.title}
            description={item.description}
            duration={item.duration}
            level={item.level}
            imageUrl={item.imageUrl}
            workoutCount={item.workoutCount}
            authorName={item.authorName}
            authorImageUrl={item.authorImageUrl}
            price={item.price}
            onPress={() => handleItemPress(item)}
          />
        );
      case 'club':
        return (
          <ClubCard
            id={item.id}
            name={item.name}
            description={item.description}
            ownerName={item.ownerName}
            ownerImageUrl={item.ownerImageUrl}
            profileImageUrl={item.profileImageUrl}
            coverImageUrl={item.coverImageUrl}
            memberCount={item.memberCount}
            price={item.price}
            isSubscribed={item.isSubscribed}
            onPress={() => handleItemPress(item)}
          />
        );
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <IMessagePageWrapper title="Your Library" subtitle="Loading your content...">
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0A84FF" />
        </View>
      </IMessagePageWrapper>
    );
  }

  const filteredContent = getFilteredContent();

  return (
    <IMessagePageWrapper title="Your Library" subtitle={`${filteredContent.length} items`}>
      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#FFFFFF"
          />
        }
      >
          {/* Library Tabs */}
          <View style={styles.section}>
            <FlatList
              data={libraryTabs}
              renderItem={renderTab}
              keyExtractor={(item) => item.id}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.tabsList}
            />
          </View>

          {/* Sort Options */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Sort by</Text>
            <FlatList
              data={sortOptions}
              renderItem={renderSortOption}
              keyExtractor={(item) => item.id}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.sortList}
            />
          </View>

          {/* Library Content */}
          <View style={styles.section}>
            {filteredContent.length > 0 ? (
              <FlatList
                data={filteredContent}
                renderItem={renderLibraryItem}
                keyExtractor={(item) => `${item.type}-${item.id}`}
                scrollEnabled={false}
                contentContainerStyle={styles.libraryList}
              />
            ) : (
              <View style={styles.emptyState}>
                <Ionicons name="library-outline" size={64} color="rgba(255, 255, 255, 0.3)" />
                <Text style={styles.emptyStateTitle}>No content yet</Text>
                <Text style={styles.emptyStateSubtitle}>
                  Start exploring the marketplace to add content to your library
                </Text>
                <TouchableOpacity
                  style={styles.exploreButton}
                  onPress={() => router.push('/marketplace' as any)}
                >
                  <Text style={styles.exploreButtonText}>Explore Marketplace</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
      </ScrollView>
    </IMessagePageWrapper>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 12,
    paddingHorizontal: 16,
  },
  tabsList: {
    paddingHorizontal: 16,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    marginRight: 8,
  },
  tabActive: {
    backgroundColor: 'rgba(10, 132, 255, 0.2)',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.6)',
    marginLeft: 8,
  },
  tabTextActive: {
    color: '#0A84FF',
  },
  sortList: {
    paddingHorizontal: 16,
  },
  sortOption: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    marginRight: 8,
  },
  sortOptionActive: {
    backgroundColor: 'rgba(10, 132, 255, 0.2)',
  },
  sortOptionText: {
    fontSize: 14,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.7)',
  },
  sortOptionTextActive: {
    color: '#0A84FF',
  },
  libraryList: {
    paddingHorizontal: 16,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 32,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyStateSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.6)',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  exploreButton: {
    backgroundColor: '#0A84FF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
  },
  exploreButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
