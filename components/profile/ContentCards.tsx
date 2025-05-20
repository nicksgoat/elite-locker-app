import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React from 'react';
import {
    Dimensions,
    FlatList,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

import {
    ClubSummary,
    ProgramSummary,
    WorkoutSummary
} from '@/contexts/ProfileContext';

const { width } = Dimensions.get('window');
const cardWidth = (width - 48) / 2;

// Workout card component
export const WorkoutCard: React.FC<{
  workout: WorkoutSummary;
  onPress: (id: string) => void;
  onLike?: (id: string) => void;
  onBookmark?: (id: string) => void;
}> = ({ workout, onPress, onLike, onBookmark }) => {
  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress(workout.id);
  };

  const handleLike = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onLike?.(workout.id);
  };

  const handleBookmark = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onBookmark?.(workout.id);
  };

  // Format date
  const formatDate = (date: Date): string => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  // Format duration
  const formatDuration = (minutes: number): string => {
    if (minutes < 60) {
      return `${minutes}m`;
    } else {
      const hours = Math.floor(minutes / 60);
      const mins = minutes % 60;
      return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
    }
  };

  return (
    <TouchableOpacity
      style={styles.workoutCard}
      onPress={handlePress}
      activeOpacity={0.8}
    >
      <BlurView intensity={20} tint="dark" style={styles.blurView}>
        {/* Image with overlay */}
        <View style={styles.cardImageContainer}>
          <Image
            source={{ uri: workout.thumbnailUrl || 'https://pbs.twimg.com/profile_banners/372145971/1465540138/1500x500' }}
            style={styles.cardImage}
            contentFit="cover"
          />
          <LinearGradient
            colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0.6)', 'rgba(0,0,0,0.8)']}
            style={styles.cardGradient}
          />

          {/* Duration badge */}
          <View style={styles.durationBadge}>
            <Text style={styles.durationText}>{formatDuration(workout.duration)}</Text>
          </View>

          {/* Sets badge */}
          <View style={styles.setsBadge}>
            <Text style={styles.setsText}>{workout.sets} sets</Text>
          </View>
        </View>

        {/* Card content */}
        <View style={styles.cardContent}>
          <Text style={styles.cardTitle} numberOfLines={1}>{workout.title}</Text>
          <Text style={styles.cardDate}>{formatDate(workout.date)}</Text>

          {/* Social stats */}
          <View style={styles.socialStats}>
            <TouchableOpacity
              style={styles.socialButton}
              onPress={handleLike}
              activeOpacity={0.7}
            >
              <Ionicons name="heart-outline" size={14} color="#AAA" />
              <Text style={styles.socialCount}>{workout.likes}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.socialButton} activeOpacity={0.7}>
              <Ionicons name="chatbubble-outline" size={14} color="#AAA" />
              <Text style={styles.socialCount}>{workout.comments}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.bookmarkButton}
              onPress={handleBookmark}
              activeOpacity={0.7}
            >
              <Ionicons name="bookmark-outline" size={16} color="#AAA" />
            </TouchableOpacity>
          </View>
        </View>
      </BlurView>
    </TouchableOpacity>
  );
};

// Program card component
export const ProgramCard: React.FC<{
  program: ProgramSummary;
  onPress: (id: string) => void;
  onSubscribe?: (id: string) => void;
}> = ({ program, onPress, onSubscribe }) => {
  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress(program.id);
  };

  const handleSubscribe = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onSubscribe?.(program.id);
  };

  // Format price
  const formatPrice = (price: number): string => {
    return price === 0 ? 'Free' : `$${price.toFixed(2)}`;
  };

  return (
    <TouchableOpacity
      style={styles.programCard}
      onPress={handlePress}
      activeOpacity={0.8}
    >
      <BlurView intensity={20} tint="dark" style={styles.blurView}>
        {/* Image with overlay */}
        <View style={styles.programImageContainer}>
          <Image
            source={{ uri: program.coverImageUrl || 'https://pbs.twimg.com/profile_banners/372145971/1465540138/1500x500' }}
            style={styles.programImage}
            contentFit="cover"
          />
          <LinearGradient
            colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0.7)', 'rgba(0,0,0,0.9)']}
            style={styles.programGradient}
          />

          {/* Price badge */}
          <View style={[
            styles.priceBadge,
            program.price === 0 ? styles.freeBadge : {}
          ]}>
            <Text style={styles.priceText}>{formatPrice(program.price)}</Text>
          </View>
        </View>

        {/* Card content */}
        <View style={styles.programContent}>
          <Text style={styles.programTitle} numberOfLines={1}>{program.title}</Text>
          <Text style={styles.programDescription} numberOfLines={2}>{program.description}</Text>

          {/* Subscribers */}
          <View style={styles.subscribersContainer}>
            <Ionicons name="people-outline" size={14} color="#AAA" />
            <Text style={styles.subscribersText}>
              {program.subscriberCount.toLocaleString()} subscribers
            </Text>
          </View>

          {/* Subscribe button */}
          <TouchableOpacity
            style={styles.subscribeButton}
            onPress={handleSubscribe}
            activeOpacity={0.7}
          >
            <BlurView intensity={30} tint="dark" style={styles.subscribeBlur}>
              <Text style={styles.subscribeText}>Try It</Text>
            </BlurView>
          </TouchableOpacity>
        </View>
      </BlurView>
    </TouchableOpacity>
  );
};

// Club card component
export const ClubCard: React.FC<{
  club: ClubSummary;
  onPress: (id: string) => void;
  onJoin?: (id: string) => void;
}> = ({ club, onPress, onJoin }) => {
  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress(club.id);
  };

  const handleJoin = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onJoin?.(club.id);
  };

  return (
    <TouchableOpacity
      style={styles.clubCard}
      onPress={handlePress}
      activeOpacity={0.8}
    >
      <BlurView intensity={20} tint="dark" style={styles.blurView}>
        {/* Image with overlay */}
        <View style={styles.clubImageContainer}>
          <Image
            source={{ uri: club.imageUrl || 'https://pbs.twimg.com/profile_banners/372145971/1465540138/1500x500' }}
            style={styles.clubImage}
            contentFit="cover"
          />
          <LinearGradient
            colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0.7)', 'rgba(0,0,0,0.9)']}
            style={styles.clubGradient}
          />
        </View>

        {/* Card content */}
        <View style={styles.clubContent}>
          <Text style={styles.clubTitle} numberOfLines={1}>{club.name}</Text>

          {/* Members */}
          <View style={styles.membersContainer}>
            <Ionicons name="people-outline" size={14} color="#AAA" />
            <Text style={styles.membersText}>
              {club.memberCount.toLocaleString()} members
            </Text>
          </View>

          {/* Join button */}
          <TouchableOpacity
            style={styles.joinButton}
            onPress={handleJoin}
            activeOpacity={0.7}
          >
            <BlurView intensity={30} tint="dark" style={styles.joinBlur}>
              <Text style={styles.joinText}>Join</Text>
            </BlurView>
          </TouchableOpacity>
        </View>
      </BlurView>
    </TouchableOpacity>
  );
};

// Workout list component
export const WorkoutList: React.FC<{
  workouts: WorkoutSummary[];
  onWorkoutPress: (id: string) => void;
  onLike?: (id: string) => void;
  onBookmark?: (id: string) => void;
  ListEmptyComponent?: React.ReactElement;
}> = ({
  workouts,
  onWorkoutPress,
  onLike,
  onBookmark,
  ListEmptyComponent
}) => {
  return (
    <FlatList
      data={workouts}
      renderItem={({ item }) => (
        <WorkoutCard
          workout={item}
          onPress={onWorkoutPress}
          onLike={onLike}
          onBookmark={onBookmark}
        />
      )}
      keyExtractor={(item) => item.id}
      numColumns={2}
      columnWrapperStyle={styles.columnWrapper}
      contentContainerStyle={styles.listContainer}
      showsVerticalScrollIndicator={false}
      ListEmptyComponent={ListEmptyComponent}
    />
  );
};

// Program list component
export const ProgramList: React.FC<{
  programs: ProgramSummary[];
  onProgramPress: (id: string) => void;
  onSubscribe?: (id: string) => void;
  ListEmptyComponent?: React.ReactElement;
}> = ({
  programs,
  onProgramPress,
  onSubscribe,
  ListEmptyComponent
}) => {
  return (
    <FlatList
      data={programs}
      renderItem={({ item }) => (
        <ProgramCard
          program={item}
          onPress={onProgramPress}
          onSubscribe={onSubscribe}
        />
      )}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.listContainer}
      showsVerticalScrollIndicator={false}
      ListEmptyComponent={ListEmptyComponent}
    />
  );
};

// Club list component
export const ClubList: React.FC<{
  clubs: ClubSummary[];
  onClubPress: (id: string) => void;
  onJoin?: (id: string) => void;
  ListEmptyComponent?: React.ReactElement;
}> = ({
  clubs,
  onClubPress,
  onJoin,
  ListEmptyComponent
}) => {
  return (
    <FlatList
      data={clubs}
      renderItem={({ item }) => (
        <ClubCard
          club={item}
          onPress={onClubPress}
          onJoin={onJoin}
        />
      )}
      keyExtractor={(item) => item.id}
      numColumns={2}
      columnWrapperStyle={styles.columnWrapper}
      contentContainerStyle={styles.listContainer}
      showsVerticalScrollIndicator={false}
      ListEmptyComponent={ListEmptyComponent}
    />
  );
};

// Empty content component
export const EmptyContent: React.FC<{
  type: 'workouts' | 'programs' | 'clubs' | 'achievements';
  isOwnProfile: boolean;
}> = ({ type, isOwnProfile }) => {
  const router = useRouter();

  // Get message based on content type and whether it's own profile
  const getMessage = (): { title: string; description: string; action?: string } => {
    if (isOwnProfile) {
      switch (type) {
        case 'workouts':
          return {
            title: 'No Workouts Yet',
            description: 'You haven\'t tracked any workouts yet. Start working out to build your history.',
            action: 'Start Workout'
          };
        case 'programs':
          return {
            title: 'No Programs Yet',
            description: 'You haven\'t created any workout programs yet.',
            action: 'Create Program'
          };
        case 'clubs':
          return {
            title: 'No Clubs Yet',
            description: 'You haven\'t joined any clubs yet.',
            action: 'Browse Clubs'
          };
        case 'achievements':
          return {
            title: 'No Badges Yet',
            description: 'Complete workouts and challenges to earn badges.',
            action: 'View Challenges'
          };
      }
    } else {
      switch (type) {
        case 'workouts':
          return {
            title: 'No Workouts',
            description: 'This user hasn\'t shared any workouts yet.'
          };
        case 'programs':
          return {
            title: 'No Programs',
            description: 'This user hasn\'t created any workout programs yet.'
          };
        case 'clubs':
          return {
            title: 'No Clubs',
            description: 'This user hasn\'t joined any clubs yet.'
          };
        case 'achievements':
          return {
            title: 'No Badges',
            description: 'This user hasn\'t earned any badges yet.'
          };
      }
    }
  };

  const { title, description, action } = getMessage();

  const handleActionPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    switch (type) {
      case 'workouts':
      case 'programs':
        router.push({
          pathname: '/(tabs)/training'
        });
        break;
      case 'clubs':
        router.push({
          pathname: '/(tabs)/index',
          params: { screen: 'clubs' }
        });
        break;
      case 'achievements':
        router.push({
          pathname: '/(tabs)/profile'
        });
        break;
    }
  };

  return (
    <View style={styles.emptyContainer}>
      <Ionicons
        name={
          type === 'workouts' ? 'barbell-outline' :
          type === 'programs' ? 'calendar-outline' :
          type === 'clubs' ? 'people-outline' : 'ribbon-outline'
        }
        size={60}
        color="rgba(255,255,255,0.2)"
      />
      <Text style={styles.emptyTitle}>{title}</Text>
      <Text style={styles.emptyDescription}>{description}</Text>

      {isOwnProfile && action && (
        <TouchableOpacity
          style={styles.emptyActionButton}
          onPress={handleActionPress}
          activeOpacity={0.7}
        >
          <BlurView intensity={30} tint="dark" style={styles.emptyActionBlur}>
            <Text style={styles.emptyActionText}>{action}</Text>
          </BlurView>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  // Workout card styles
  workoutCard: {
    width: cardWidth,
    height: 220,
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
  },
  blurView: {
    flex: 1,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    overflow: 'hidden',
  },
  cardImageContainer: {
    height: 120,
    width: '100%',
    position: 'relative',
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  cardGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 60,
  },
  durationBadge: {
    position: 'absolute',
    right: 8,
    top: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  durationText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  setsBadge: {
    position: 'absolute',
    left: 8,
    top: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  setsText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  cardContent: {
    padding: 12,
  },
  cardTitle: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 4,
  },
  cardDate: {
    color: '#AAAAAA',
    fontSize: 13,
    marginBottom: 8,
  },
  socialStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
  },
  socialCount: {
    color: '#AAAAAA',
    fontSize: 13,
    marginLeft: 4,
  },
  bookmarkButton: {
    marginLeft: 'auto',
  },

  // Program card styles
  programCard: {
    width: '100%',
    height: 280,
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
  },
  programImageContainer: {
    height: 160,
    width: '100%',
    position: 'relative',
  },
  programImage: {
    width: '100%',
    height: '100%',
  },
  programGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 80,
  },
  priceBadge: {
    position: 'absolute',
    right: 8,
    top: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  freeBadge: {
    backgroundColor: 'rgba(10, 132, 255, 0.3)',
    borderColor: 'rgba(10, 132, 255, 0.5)',
  },
  priceText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
  programContent: {
    padding: 12,
  },
  programTitle: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '600',
    marginBottom: 4,
  },
  programDescription: {
    color: '#AAAAAA',
    fontSize: 13,
    marginBottom: 8,
    lineHeight: 18,
  },
  subscribersContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  subscribersText: {
    color: '#AAAAAA',
    fontSize: 13,
    marginLeft: 4,
  },
  subscribeButton: {
    height: 36,
    borderRadius: 18,
    overflow: 'hidden',
  },
  subscribeBlur: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(10, 132, 255, 0.5)',
    backgroundColor: 'rgba(10, 132, 255, 0.2)',
  },
  subscribeText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },

  // Club card styles
  clubCard: {
    width: cardWidth,
    height: 200,
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
  },
  clubImageContainer: {
    height: 110,
    width: '100%',
    position: 'relative',
  },
  clubImage: {
    width: '100%',
    height: '100%',
  },
  clubGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 60,
  },
  clubContent: {
    padding: 12,
  },
  clubTitle: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 4,
  },
  membersContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  membersText: {
    color: '#AAAAAA',
    fontSize: 13,
    marginLeft: 4,
  },
  joinButton: {
    height: 32,
    borderRadius: 16,
    overflow: 'hidden',
  },
  joinBlur: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(10, 132, 255, 0.5)',
    backgroundColor: 'rgba(10, 132, 255, 0.2)',
  },
  joinText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },

  // List styles
  columnWrapper: {
    justifyContent: 'space-between',
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },

  // Empty content styles
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    height: 300,
  },
  emptyTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyDescription: {
    color: '#AAAAAA',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  emptyActionButton: {
    height: 44,
    minWidth: 180,
    borderRadius: 22,
    overflow: 'hidden',
  },
  emptyActionBlur: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 22,
    borderWidth: 1,
    borderColor: 'rgba(10, 132, 255, 0.5)',
    backgroundColor: 'rgba(10, 132, 255, 0.2)',
  },
  emptyActionText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default {
  WorkoutCard,
  ProgramCard,
  ClubCard,
  WorkoutList,
  ProgramList,
  ClubList,
  EmptyContent,
};