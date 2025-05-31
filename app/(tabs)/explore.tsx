import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useCallback, useMemo, useRef, useState } from 'react';
import {
    Dimensions,
    Platform,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import IMessagePageWrapper from '../../components/layout/iMessagePageWrapper';

const { width } = Dimensions.get('window');

// Trainer card interface
interface TrainerProfile {
  id: string;
  name: string;
  handle: string;
  bio: string;
  role: 'user' | 'coach' | 'admin';
  avatarUrl: string;
  isVerified: boolean;
  isPremium: boolean;
  followers: number;
  workouts: number;
}

// Content item interface
interface ContentItem {
  id: string;
  title: string;
  type: 'workout' | 'program' | 'club';
  imageUrl: string;
  creator: {
    id: string;
    name: string;
    avatarUrl: string;
    isVerified: boolean;
  };
  stats: {
    likes: number;
    comments: number;
  };
}

// Mock popular trainers with more data for profile view
const popularTrainers: TrainerProfile[] = [
  {
    id: 'trainer1',
    name: 'Sam Sulek',
    handle: 'samsulek',
    bio: 'Fitness content creator. Building the best physique possible.',
    role: 'coach',
    avatarUrl: 'https://randomuser.me/api/portraits/men/32.jpg',
    isVerified: true,
    isPremium: true,
    followers: 1500000,
    workouts: 458
  },
  {
    id: 'trainer2',
    name: 'Chris Bumstead',
    handle: 'cbum',
    bio: 'Mr. Olympia Classic Physique Champion',
    role: 'coach',
    avatarUrl: 'https://randomuser.me/api/portraits/men/15.jpg',
    isVerified: true,
    isPremium: true,
    followers: 5200000,
    workouts: 326
  },
  {
    id: 'trainer3',
    name: 'Natacha Oceane',
    handle: 'natachaoceane',
    bio: 'Fitness scientist & athlete. Evidence-based workouts.',
    role: 'coach',
    avatarUrl: 'https://randomuser.me/api/portraits/women/22.jpg',
    isVerified: true,
    isPremium: true,
    followers: 2800000,
    workouts: 289
  },
  {
    id: 'trainer4',
    name: 'Jeff Nippard',
    handle: 'jeffnippard',
    bio: 'Natural bodybuilder with science-based training approach.',
    role: 'coach',
    avatarUrl: 'https://randomuser.me/api/portraits/men/42.jpg',
    isVerified: true,
    isPremium: true,
    followers: 1800000,
    workouts: 312
  }
];

// Mock trending content with creator IDs that match trainer IDs
const trendingContent: ContentItem[] = [
  {
    id: 'content1',
    title: 'Full Body Destruction',
    type: 'workout',
    imageUrl: 'https://www.si.com/.image/c_fill,w_1080,ar_16:9,f_auto,q_auto,g_auto/MTk5MTMzNzI1MDQzMjA1OTA1/devon-allen.jpg',
    creator: {
      id: 'trainer1',
      name: 'Sam Sulek',
      avatarUrl: 'https://randomuser.me/api/portraits/men/32.jpg',
      isVerified: true
    },
    stats: {
      likes: 58432,
      comments: 1243
    }
  },
  {
    id: 'content2',
    title: 'Classic Physique Blueprint',
    type: 'program',
    imageUrl: 'https://images.unsplash.com/photo-1577221084712-45b0445d2b00',
    creator: {
      id: 'trainer2',
      name: 'Chris Bumstead',
      avatarUrl: 'https://randomuser.me/api/portraits/men/15.jpg',
      isVerified: true
    },
    stats: {
      likes: 124532,
      comments: 3421
    }
  },
  {
    id: 'content3',
    title: 'Elite Lifting Club',
    type: 'club',
    imageUrl: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48',
    creator: {
      id: 'trainer4',
      name: 'Jeff Nippard',
      avatarUrl: 'https://randomuser.me/api/portraits/men/42.jpg',
      isVerified: true
    },
    stats: {
      likes: 45231,
      comments: 842
    }
  },
  {
    id: 'content4',
    title: 'Science-Based HIIT',
    type: 'program',
    imageUrl: 'https://pbs.twimg.com/profile_banners/372145971/1465540138/1500x500',
    creator: {
      id: 'trainer3',
      name: 'Natacha Oceane',
      avatarUrl: 'https://randomuser.me/api/portraits/women/22.jpg',
      isVerified: true
    },
    stats: {
      likes: 67824,
      comments: 1485
    }
  }
];

// Explore categories
interface ExploreCategory {
  id: string;
  title: string;
  icon: string;
  color: string;
}

const exploreCategories = [
  {
    id: 'category1',
    title: 'Top Rated Clubs',
    icon: 'star',
    color: '#0A84FF',
  },
  {
    id: 'category2',
    title: 'New Workouts',
    icon: 'fitness',
    color: '#30D158',
  },
  {
    id: 'category3',
    title: 'Popular Trainers',
    icon: 'person',
    color: '#FF9500',
  },
  {
    id: 'category4',
    title: 'Events Near You',
    icon: 'calendar',
    color: '#FF3B30',
  },
  {
    id: 'category5',
    title: 'Challenges',
    icon: 'trophy',
    color: '#5856D6',
  },
  {
    id: 'category6',
    title: 'Running Routes',
    icon: 'map',
    color: '#AF52DE',
  },
];

// Format number with k/m suffix - memoized for better performance
const formatNumber = (num: number): string => {
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}m`;
  }
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}k`;
  }
  return num.toString();
};

export default function ExploreScreen() {
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  // Handle refresh - with optimized performance
  const handleRefresh = useCallback(() => {
    setRefreshing(true);

    // Simulate network request
    setTimeout(() => {
      setRefreshing(false);
    }, 1500);
  }, []);

  // Navigate to trainer profile - using consistent routing
  const handleTrainerPress = useCallback((trainerId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(`/profile/${trainerId}`);
  }, [router]);

  // Navigate to content details
  const handleContentPress = useCallback((content: ContentItem) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    switch (content.type) {
      case 'workout':
        router.push(`/workout/detail/${content.id}`);
        break;
      case 'program':
        router.push(`/programs/detail/${content.id}`);
        break;
      case 'club':
        router.push(`/club/${content.id}`);
        break;
    }
  }, [router]);

  // Navigate to creator profile from content card
  const handleCreatorPress = useCallback((creatorId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(`/profile/${creatorId}`);
  }, [router]);

  const handleCategoryPress = useCallback((id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    // For trainer category, scroll to the trainer section
    if (id === 'category3') {
      scrollViewRef.current?.scrollTo({ y: 300, animated: true });
    }
  }, []);

  // Render trainer card with optimized performance
  const renderTrainerCard = useCallback(({ item }: { item: TrainerProfile }) => (
    <TouchableOpacity
      style={styles.trainerCard}
      onPress={() => handleTrainerPress(item.id)}
      activeOpacity={0.7}
    >
      <BlurView intensity={40} tint="dark" style={styles.trainerCardBlur}>
        <View style={styles.trainerHeader}>
          <Image
            source={{ uri: item.avatarUrl }}
            style={styles.trainerAvatar}
            contentFit="cover"
            cachePolicy="memory-disk"
            transition={200}
            recyclingKey={item.id}
          />
          <View style={styles.trainerInfo}>
            <View style={styles.trainerNameRow}>
              <Text style={styles.trainerName}>{item.name}</Text>
              {item.isVerified && (
                <Ionicons name="checkmark-circle" size={16} color="#0A84FF" style={{ marginLeft: 4 }} />
              )}
            </View>
            <Text style={styles.trainerHandle}>@{item.handle}</Text>
          </View>
        </View>

        <Text style={styles.trainerBio} numberOfLines={2}>{item.bio}</Text>

        <View style={styles.trainerStats}>
          <View style={styles.trainerStat}>
            <Text style={styles.trainerStatValue}>{formatNumber(item.followers)}</Text>
            <Text style={styles.trainerStatLabel}>Followers</Text>
          </View>
          <View style={styles.trainerStat}>
            <Text style={styles.trainerStatValue}>{item.workouts}</Text>
            <Text style={styles.trainerStatLabel}>Workouts</Text>
          </View>
          <TouchableOpacity
            style={styles.followButton}
            onPress={() => handleTrainerPress(item.id)}
            activeOpacity={0.7}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Text style={styles.followButtonText}>Profile</Text>
          </TouchableOpacity>
        </View>
      </BlurView>
    </TouchableOpacity>
  ), [handleTrainerPress]);

  // Render content card with creator profile navigation
  const renderContentCard = useCallback(({ item }: { item: ContentItem }) => (
    <View style={styles.contentCard}>
      <TouchableOpacity
        style={styles.contentImageContainer}
        onPress={() => handleContentPress(item)}
        activeOpacity={0.8}
      >
        <Image
          source={{ uri: item.imageUrl }}
          style={styles.contentImage}
          contentFit="cover"
          cachePolicy="memory-disk"
          transition={200}
          recyclingKey={item.id}
        />
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.8)']}
          style={styles.contentGradient}
        />
        <View style={styles.contentTypeTag}>
          <Text style={styles.contentTypeText}>{item.type}</Text>
        </View>
      </TouchableOpacity>

      <View style={styles.contentInfo}>
        <TouchableOpacity
          onPress={() => handleContentPress(item)}
          activeOpacity={0.8}
        >
          <Text style={styles.contentTitle} numberOfLines={1}>{item.title}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.contentCreator}
          onPress={() => handleCreatorPress(item.creator.id)}
          activeOpacity={0.7}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Image
            source={{ uri: item.creator.avatarUrl }}
            style={styles.creatorAvatar}
            contentFit="cover"
            cachePolicy="memory-disk"
            recyclingKey={item.creator.id}
          />
          <Text style={styles.creatorName}>{item.creator.name}</Text>
          {item.creator.isVerified && (
            <Ionicons name="checkmark-circle" size={12} color="#0A84FF" style={{ marginLeft: 2 }} />
          )}
        </TouchableOpacity>

        <View style={styles.contentStats}>
          <View style={styles.contentStat}>
            <Ionicons name="heart" size={12} color="#FF3B30" />
            <Text style={styles.contentStatText}>{formatNumber(item.stats.likes)}</Text>
          </View>
          <View style={styles.contentStat}>
            <Ionicons name="chatbubble" size={12} color="#8E8E93" />
            <Text style={styles.contentStatText}>{formatNumber(item.stats.comments)}</Text>
          </View>
        </View>
      </View>
    </View>
  ), [handleContentPress, handleCreatorPress]);

  // Memoized category item renderer
  const renderCategoryItem = useCallback(({ item }: { item: ExploreCategory }) => (
    <TouchableOpacity
      style={styles.categoryItem}
      onPress={() => handleCategoryPress(item.id)}
      activeOpacity={0.7}
    >
      <BlurView intensity={20} tint="dark" style={styles.categoryBlur}>
        <View style={[styles.iconContainer, { backgroundColor: `${item.color}30` }]}>
          <Ionicons name={item.icon as any} size={28} color={item.color} />
        </View>
        <Text style={styles.categoryTitle}>{item.title}</Text>
      </BlurView>
    </TouchableOpacity>
  ), [handleCategoryPress]);

  // Memoized trending content items
  const trendingItems = useMemo(() => trendingContent.slice(0, 3), []);

  return (
    <IMessagePageWrapper
      title="Explore"
      subtitle="Discover fitness content"
      showHeader={false}
    >
      <ScrollView
        ref={scrollViewRef}
        style={styles.container}
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16} // Optimize scroll performance
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor="#FFFFFF"
          />
        }
      >
        {/* Categories Section */}
        <View style={styles.categoriesContainer}>
          {exploreCategories.reduce((rows: any[], item, index) => {
            if (index % 2 === 0) {
              rows.push([item]);
            } else {
              rows[rows.length - 1].push(item);
            }
            return rows;
          }, []).map((row: any[], rowIndex: number) => (
            <View key={rowIndex} style={styles.row}>
              {row.map((item) => renderCategoryItem({ item }))}
            </View>
          ))}
        </View>

        {/* Trending Content Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Trending Now</Text>
          <TouchableOpacity activeOpacity={0.7}>
            <Text style={styles.seeAllText}>See All</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.horizontalScrollView}
          contentContainerStyle={styles.contentScrollContainer}
          scrollEventThrottle={16} // Optimize scroll performance
        >
          {trendingContent.map(item => (
            <View key={item.id} style={{ width: width * 0.75, marginRight: 12 }}>
              {renderContentCard({ item })}
            </View>
          ))}
        </ScrollView>

        {/* Popular Trainers Section */}
        <View style={[styles.sectionHeader, { marginTop: 32 }]}>
          <Text style={styles.sectionTitle}>Popular Trainers</Text>
          <TouchableOpacity activeOpacity={0.7}>
            <Text style={styles.seeAllText}>See All</Text>
          </TouchableOpacity>
        </View>

        {popularTrainers.map(trainer => (
          <View key={trainer.id} style={{ marginBottom: 16 }}>
            {renderTrainerCard({ item: trainer })}
          </View>
        ))}

        {/* Spacer for bottom tab bar */}
        <View style={{ height: 20 }} />
      </ScrollView>
    </IMessagePageWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerSection: {
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'normal',
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#8E8E93',
    lineHeight: 22,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'normal',
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  categoryItem: {
    width: '48%',
    borderRadius: 16,
    overflow: 'hidden',
    height: 120,
  },
  categoryBlur: {
    width: '100%',
    height: '100%',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'normal',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'normal',
  },
  seeAllText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#0A84FF',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'normal',
  },
  horizontalScrollView: {
    marginLeft: -16,
  },
  contentScrollContainer: {
    paddingLeft: 16,
    paddingRight: 4,
  },
  contentCard: {
    width: '100%',
    height: 240,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: 'rgba(30, 30, 30, 0.8)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 6,
  },
  contentImageContainer: {
    height: 160,
    width: '100%',
    position: 'relative',
  },
  contentImage: {
    width: '100%',
    height: '100%',
  },
  contentGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 60,
  },
  contentTypeTag: {
    position: 'absolute',
    left: 12,
    top: 12,
    backgroundColor: 'rgba(10, 132, 255, 0.8)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  contentTypeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'normal',
  },
  contentInfo: {
    padding: 12,
  },
  contentTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 8,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'normal',
  },
  contentCreator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  creatorAvatar: {
    width: 20,
    height: 20,
    borderRadius: 10,
    marginRight: 6,
  },
  creatorName: {
    fontSize: 14,
    color: '#CCCCCC',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'normal',
  },
  contentStats: {
    flexDirection: 'row',
  },
  contentStat: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 14,
  },
  contentStatText: {
    fontSize: 13,
    color: '#8E8E93',
    marginLeft: 4,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'normal',
  },
  trainerCard: {
    width: '100%',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 6,
  },
  trainerCardBlur: {
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    padding: 16,
  },
  trainerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  trainerAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  trainerInfo: {
    flex: 1,
  },
  trainerNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  trainerName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'normal',
  },
  trainerHandle: {
    fontSize: 14,
    color: '#8E8E93',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'normal',
  },
  trainerBio: {
    fontSize: 14,
    color: '#CCCCCC',
    marginBottom: 12,
    lineHeight: 20,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'normal',
  },
  trainerStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  trainerStat: {
    marginRight: 16,
  },
  trainerStatValue: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'normal',
  },
  trainerStatLabel: {
    fontSize: 13,
    color: '#8E8E93',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'normal',
  },
  followButton: {
    marginLeft: 'auto',
    backgroundColor: '#0A84FF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
  followButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'normal',
  },
  categoriesContainer: {
    marginBottom: 24,
  },
});
