/**
 * Elite Locker - Marketplace Category Detail Screen
 *
 * Shows all content for a specific marketplace category (workouts, programs, clubs, etc.)
 * following Spotify's category detail design patterns.
 */

import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    ImageBackground,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

// Import design system components
import ClubCard from '../../../components/cards/ClubCard';
import ProgramCard from '../../../components/cards/ProgramCard';
import { WorkoutCard } from '../../../components/design-system/cards';
import { useTheme } from '../../../components/design-system/ThemeProvider';
import { categoryService } from '../../../services/categoryService';
import { clubService } from '../../../services/clubService';
import { exerciseService } from '../../../services/exerciseService';
import { profileService } from '../../../services/profileService';
import { programService } from '../../../services/programService';
import { workoutService } from '../../../services/workoutService';

// Local asset imports for marketplace category images
const marketplaceImages = {
  workouts: require('../../../assets/images/marketplace/workouts.jpg'),
  programs: require('../../../assets/images/marketplace/programs.jpg'),
  'in-person': require('../../../assets/images/marketplace/in-person.jpg'),
  online: require('../../../assets/images/marketplace/online.jpg'),
  clubs: require('../../../assets/images/marketplace/clubs.jpg'),
  profiles: require('../../../assets/images/marketplace/profiles.jpg'),
  elitefit: require('../../../assets/images/marketplace/elitefit.jpg'),
};

// Category configurations
const categoryConfigs = {
  workouts: {
    title: 'Premium Workouts',
    subtitle: 'Discover elite training sessions',
    color: '#FF2D55',
    icon: 'fitness-outline',
    image: marketplaceImages.workouts,
  },
  programs: {
    title: 'Training Programs',
    subtitle: 'Complete workout programs',
    color: '#30D158',
    icon: 'calendar-outline',
    image: marketplaceImages.programs,
  },
  clubs: {
    title: 'Elite Clubs',
    subtitle: 'Join exclusive fitness communities',
    color: '#FF9F0A',
    icon: 'people-outline',
    image: marketplaceImages.clubs,
  },
  creators: {
    title: 'Top Creators',
    subtitle: 'Follow the best trainers',
    color: '#5856D6',
    icon: 'star-outline',
    image: marketplaceImages.profiles,
  },
  exercises: {
    title: 'Exercise Library',
    subtitle: 'Master every movement',
    color: '#64D2FF',
    icon: 'barbell-outline',
    image: marketplaceImages.workouts, // Use workouts image as fallback
  },
  nutrition: {
    title: 'Nutrition Plans',
    subtitle: 'Fuel your performance',
    color: '#AF52DE',
    icon: 'restaurant-outline',
    image: marketplaceImages.workouts, // Use workouts image as fallback
  },
  'in-person': {
    title: 'In-Person Sessions',
    subtitle: 'Local training sessions',
    color: '#64D2FF',
    icon: 'location-outline',
    image: marketplaceImages['in-person'],
  },
  online: {
    title: 'Online Sessions',
    subtitle: 'Virtual training sessions',
    color: '#AF52DE',
    icon: 'videocam-outline',
    image: marketplaceImages.online,
  },
  profiles: {
    title: 'Profiles',
    subtitle: 'Coaches and athletes',
    color: '#5856D6',
    icon: 'person-outline',
    image: marketplaceImages.profiles,
  },
  elitefit: {
    title: 'EliteFit',
    subtitle: 'Shop the brand',
    color: '#FFD700',
    icon: 'star-outline',
    image: marketplaceImages.elitefit,
  },
};

export default function MarketplaceCategoryScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { colors, spacing } = useTheme();
  const [isLoading, setIsLoading] = useState(true);
  const [content, setContent] = useState([]);
  const [sortBy, setSortBy] = useState('popular');
  const [category, setCategory] = useState(null);

  const categorySlug = Array.isArray(id) ? id[0] : id;

  // Load category from database
  useEffect(() => {
    const loadCategory = async () => {
      try {
        const dbCategory = await categoryService.getCategoryBySlug(categorySlug);
        if (dbCategory) {
          console.log('🔍 Database category loaded:', dbCategory);
          setCategory(dbCategory);
        } else {
          // Fallback to static config if category not found in database
          const config = categoryConfigs[categorySlug as keyof typeof categoryConfigs];
          if (config) {
            console.log('🔍 Using fallback config for:', categorySlug, config);
            const categoryWithImage = {
              id: categorySlug,
              name: config.title,
              slug: categorySlug,
              description: config.subtitle,
              color_hex: config.color,
              icon: config.icon,
              image: config.image,
            };
            console.log('🔍 Category with image:', categoryWithImage);
            setCategory(categoryWithImage);
          }
        }
      } catch (error) {
        console.error('Error loading category:', error);
      }
    };

    loadCategory();
  }, [categorySlug]);

  // Helper function to check if a string is a valid UUID
  const isValidUUID = (str: string) => {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(str);
  };

  // Load category content
  useEffect(() => {
    const loadCategoryContent = async () => {
      if (!category) return;

      setIsLoading(true);
      try {
        let data = [];

        // Only use database methods if category.id is a valid UUID (from database)
        if (category.id && isValidUUID(category.id) && category.slug !== 'featured') {
          console.log(`Loading content for database category: ${category.name} (${category.id})`);
          // Load content by category from database
          const [workouts, programs, exercises, sessions] = await Promise.all([
            categoryService.getWorkoutsByCategory(category.id, 50),
            categoryService.getProgramsByCategory(category.id, 50),
            categoryService.getExercisesByCategory(category.id, 100),
            workoutService.getRecentSessions?.({ limit: 20, categoryId: category.id }) || Promise.resolve([]),
          ]);

          data = [
            ...workouts.map(w => ({ ...w, type: 'workout' })),
            ...programs.map(p => ({ ...p, type: 'program' })),
            ...exercises.map(e => ({ ...e, type: 'exercise' })),
            ...sessions.map(s => ({ ...s, type: 'session' })),
          ];
        } else {
          console.log(`Loading content for fallback category: ${categorySlug}`);
          // Fallback to old logic for special categories or when category ID is not a valid UUID
          switch (categorySlug) {
            case 'workouts':
              const workouts = await workoutService.getWorkoutHistory({ limit: 50 });
              data = workouts
                .filter(workout => workout.isPaid || workout.isPublic)
                .map(workout => ({ ...workout, type: 'workout' }));
              break;

            case 'programs':
              const programs = await programService.getPrograms();
              data = programs
                .filter(program => program.price || program.isPublic)
                .map(program => ({ ...program, type: 'program' }));
              break;

            case 'clubs':
              const clubs = await clubService.getClubs({ limit: 50 });
              data = clubs
                .filter(club => club.is_paid || club.isPublic)
                .map(club => ({ ...club, type: 'club' }));
              break;

            case 'creators':
              const creators = await profileService.getTopCreators?.() || [];
              data = creators.map(creator => ({ ...creator, type: 'creator' }));
              break;

            case 'exercises':
              const exercises = await exerciseService.getExercises({ limit: 100 });
              data = exercises.map(exercise => ({ ...exercise, type: 'exercise' }));
              break;

            case 'sessions':
              const sessions = await workoutService.getRecentSessions?.({ limit: 50 }) || [];
              data = sessions.map(session => ({ ...session, type: 'session' }));
              break;

            default:
              data = [];
          }
        }

        // Sort data based on sortBy
        if (sortBy === 'popular') {
          data.sort((a, b) => (b.member_count || b.likes || 0) - (a.member_count || a.likes || 0));
        } else if (sortBy === 'newest') {
          data.sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime());
        } else if (sortBy === 'price') {
          data.sort((a, b) => (a.price || 0) - (b.price || 0));
        }

        setContent(data);
      } catch (error) {
        console.error('Error loading category content:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadCategoryContent();
  }, [category, categorySlug, sortBy]);

  // Navigation handlers
  const handleItemPress = (item: any) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    switch (item.type) {
      case 'workout':
        router.push(`/workout/detail/${item.id}` as any);
        break;
      case 'program':
        router.push(`/programs/detail/${item.id}` as any);
        break;
      case 'club':
        router.push(`/club/${item.id}` as any);
        break;
      case 'creator':
        router.push(`/profile/${item.id}` as any);
        break;
      case 'exercise':
        router.push(`/exercise/${item.id}` as any);
        break;
      case 'session':
        router.push(`/session/${item.id}` as any);
        break;
    }
  };

  const handleSortChange = (newSort: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSortBy(newSort);
  };

  // Render content item
  const renderContentItem = ({ item }: { item: any }) => {
    switch (item.type) {
      case 'workout':
        return (
          <WorkoutCard
            workout={{
              id: item.id,
              title: item.title,
              exerciseCount: item.exercises?.length || 0,
              duration: item.duration,
              thumbnailUrl: item.thumbnail_url,
            }}
            variant="default"
            onPress={() => handleItemPress(item)}
          />
        );
      case 'program':
        return (
          <ProgramCard
            title={item.title}
            description={item.description}
            authorName={item.author_name || 'Unknown'}
            imageUrl={item.thumbnail_url}
            duration={item.duration}
            workoutCount={item.workouts?.length || 0}
            level={item.level}
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
            ownerName={item.owner_name || 'Unknown'}
            profileImageUrl={item.profile_image_url}
            memberCount={item.member_count}
            price={item.price}
            onPress={() => handleItemPress(item)}
          />
        );
      case 'exercise':
        return (
          <TouchableOpacity
            style={styles.contentItem}
            onPress={() => handleItemPress(item)}
          >
            <View style={styles.exerciseIcon}>
              <Ionicons name="barbell-outline" size={24} color="#0A84FF" />
            </View>
            <Text style={styles.contentTitle}>{item.name}</Text>
            <Text style={styles.contentType}>{item.muscle_group || 'Exercise'}</Text>
            <Text style={styles.contentSubtype}>{item.equipment || 'Any equipment'}</Text>
          </TouchableOpacity>
        );
      case 'session':
        return (
          <TouchableOpacity
            style={styles.contentItem}
            onPress={() => handleItemPress(item)}
          >
            <View style={styles.sessionIcon}>
              <Ionicons name="time-outline" size={24} color="#30D158" />
            </View>
            <Text style={styles.contentTitle}>{item.name || 'Workout Session'}</Text>
            <Text style={styles.contentType}>
              {item.duration ? `${Math.round(item.duration / 60)} min` : 'Session'}
            </Text>
            <Text style={styles.contentSubtype}>
              {item.created_at ? new Date(item.created_at).toLocaleDateString() : 'Recent'}
            </Text>
          </TouchableOpacity>
        );
      case 'creator':
        return (
          <TouchableOpacity
            style={styles.contentItem}
            onPress={() => handleItemPress(item)}
          >
            <View style={styles.creatorIcon}>
              <Text style={styles.creatorIconText}>
                {(item.username || item.name || 'U').charAt(0).toUpperCase()}
              </Text>
            </View>
            <Text style={styles.contentTitle}>{item.username || item.name}</Text>
            <Text style={styles.contentType}>Creator</Text>
            <Text style={styles.contentSubtype}>{item.follower_count || 0} followers</Text>
          </TouchableOpacity>
        );
      default:
        return (
          <TouchableOpacity
            style={styles.contentItem}
            onPress={() => handleItemPress(item)}
          >
            <Text style={styles.contentTitle}>{item.title || item.name}</Text>
            <Text style={styles.contentType}>{item.type}</Text>
          </TouchableOpacity>
        );
    }
  };

  // Don't render until category is loaded
  if (!category) {
    return (
      <View style={{ flex: 1, backgroundColor: '#000000' }}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0A84FF" />
          <Text style={styles.loadingText}>Loading category...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#000000' }}>
      {/* Header */}
      <View style={styles.header}>
        {(() => {
          console.log('🔍 Rendering header, category.image:', category.image);
          console.log('🔍 Category object:', category);
          return category.image;
        })() ? (
          <ImageBackground
            source={category.image}
            style={styles.headerBackground}
            imageStyle={styles.headerBackgroundImage}
          >
            <LinearGradient
              colors={[
                'transparent',
                'rgba(0,0,0,0.3)',
                'rgba(0,0,0,0.7)',
                'rgba(0,0,0,0.9)'
              ]}
              locations={[0, 0.3, 0.7, 1]}
              style={styles.headerGradient}
            >
              <View style={styles.headerContent}>
                <TouchableOpacity
                  style={styles.backButton}
                  onPress={() => router.back()}
                  activeOpacity={0.7}
                >
                  <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
                </TouchableOpacity>

                <View style={styles.headerInfo}>
                  <Text style={styles.headerTitle}>{category.name}</Text>
                  <Text style={styles.headerSubtitle}>{category.description}</Text>
                </View>
              </View>
            </LinearGradient>
          </ImageBackground>
        ) : (
          <View style={[styles.headerBackground, { backgroundColor: category.color_hex }]}>
            <BlurView intensity={80} tint="dark" style={styles.headerBlur}>
              <View style={styles.headerContent}>
                <TouchableOpacity
                  style={styles.backButton}
                  onPress={() => router.back()}
                  activeOpacity={0.7}
                >
                  <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
                </TouchableOpacity>

                <View style={styles.headerInfo}>
                  <Text style={styles.headerTitle}>{category.name}</Text>
                  <Text style={styles.headerSubtitle}>{category.description}</Text>
                </View>
              </View>
            </BlurView>
          </View>
        )}
      </View>

      {/* Sort options */}
      <View style={styles.sortContainer}>
        <Text style={styles.sortLabel}>Sort by:</Text>
        <View style={styles.sortOptions}>
          {['popular', 'newest', 'price'].map((option) => (
            <TouchableOpacity
              key={option}
              style={[
                styles.sortOption,
                sortBy === option && styles.sortOptionActive
              ]}
              onPress={() => handleSortChange(option)}
            >
              <Text
                style={[
                  styles.sortOptionText,
                  sortBy === option && styles.sortOptionTextActive
                ]}
              >
                {option.charAt(0).toUpperCase() + option.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Content */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={category.color_hex} />
          <Text style={styles.loadingText}>Loading {category.name.toLowerCase()}...</Text>
        </View>
      ) : (
        <FlatList
          data={content}
          renderItem={renderContentItem}
          keyExtractor={(item) => `${item.type}-${item.id}`}
          numColumns={2}
          columnWrapperStyle={styles.row}
          contentContainerStyle={styles.contentList}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Ionicons name={category.icon as any} size={64} color="#333" />
              <Text style={styles.emptyStateText}>No {category.name.toLowerCase()} available</Text>
              <Text style={styles.emptyStateSubtext}>Check back later for new content</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

// Styles for the category detail screen
const styles = StyleSheet.create({
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    height: 200, // Increased height for better image display
    overflow: 'hidden',
  },
  headerBackground: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  headerBackgroundImage: {
    resizeMode: 'cover',
  },
  headerGradient: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingBottom: 20,
  },
  headerBlur: {
    flex: 1,
    paddingTop: 60,
    paddingBottom: 16,
    overflow: 'hidden',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 60, // Account for status bar
  },
  backButton: {
    marginRight: 16,
    padding: 4,
  },
  headerInfo: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  sortContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginTop: 200, // Updated to match new header height
    backgroundColor: '#000000',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  sortLabel: {
    color: '#999',
    fontSize: 14,
    marginRight: 12,
  },
  sortOptions: {
    flexDirection: 'row',
  },
  sortOption: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  sortOptionActive: {
    backgroundColor: '#0A84FF',
  },
  sortOptionText: {
    color: '#999',
    fontSize: 14,
    fontWeight: '500',
  },
  sortOptionTextActive: {
    color: '#FFFFFF',
  },
  contentList: {
    padding: 16,
    paddingBottom: 100,
  },
  row: {
    justifyContent: 'space-between',
  },
  contentItem: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    flex: 0.48,
  },
  contentTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  contentType: {
    color: '#999',
    fontSize: 12,
    textTransform: 'capitalize',
  },
  contentSubtype: {
    color: '#666',
    fontSize: 11,
    marginTop: 2,
  },
  exerciseIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(10, 132, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  sessionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(48, 209, 88, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  creatorIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#0A84FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  creatorIconText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    marginTop: 200, // Updated to match new header height
  },
  loadingText: {
    color: '#999',
    marginTop: 16,
    fontSize: 16,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    marginTop: 60,
  },
  emptyStateText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateSubtext: {
    color: '#999',
    fontSize: 14,
    textAlign: 'center',
  },
});
