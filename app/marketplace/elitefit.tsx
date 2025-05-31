/**
 * Elite Locker - EliteFit Marketplace Screen
 * Premium fitness experiences & exclusive content
 */

import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Dimensions,
    FlatList,
    ImageBackground,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import ClubCard from '../../components/cards/ClubCard';
import ProgramCard from '../../components/cards/ProgramCard';
import { SessionCard, WorkoutCard } from '../../components/design-system/cards';
import { clubService } from '../../services/clubService';
import { programService } from '../../services/programService';
import { sessionService } from '../../services/sessionService';
import { workoutService } from '../../services/workoutService';

const { width: screenWidth } = Dimensions.get('window');

// EliteFit content categories
const eliteFitCategories = [
  {
    id: 'premium-workouts',
    title: 'Premium Workouts',
    subtitle: 'Exclusive training sessions',
    color: '#FF2D55',
    icon: 'fitness',
  },
  {
    id: 'elite-programs',
    title: 'Elite Programs',
    subtitle: 'Professional training plans',
    color: '#30D158',
    icon: 'calendar',
  },
  {
    id: 'vip-sessions',
    title: 'VIP Sessions',
    subtitle: 'Private coaching sessions',
    color: '#64D2FF',
    icon: 'videocam',
  },
  {
    id: 'exclusive-clubs',
    title: 'Exclusive Clubs',
    subtitle: 'Premium communities',
    color: '#FF9F0A',
    icon: 'people',
  },
];

export default function EliteFitMarketplaceScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [premiumWorkouts, setPremiumWorkouts] = useState<any[]>([]);
  const [elitePrograms, setElitePrograms] = useState<any[]>([]);
  const [vipSessions, setVipSessions] = useState<any[]>([]);
  const [exclusiveClubs, setExclusiveClubs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadEliteFitContent = async () => {
    try {
      // Load premium content from all services
      const [workoutsData, programsData, sessionsData, clubsData] = await Promise.all([
        workoutService.getMarketplaceWorkouts({ limit: 10 }).catch(() => []),
        programService.getMarketplacePrograms({ limit: 10 }).catch(() => []),
        sessionService.getMarketplaceSessions({ limit: 10 }).catch(() => []),
        clubService.getMarketplaceClubs({ limit: 10 }).catch(() => []),
      ]);

      // Filter for premium/paid content only
      const premiumWorkoutsData = Array.isArray(workoutsData)
        ? workoutsData.filter(item => item.isPaid || item.is_paid || item.price > 0)
        : [];

      const eliteProgramsData = Array.isArray(programsData)
        ? programsData.filter(item => item.isPaid || item.is_paid || item.price > 0)
        : [];

      const vipSessionsData = Array.isArray(sessionsData)
        ? sessionsData.filter(item => item.isPaid || item.is_paid || item.price > 0)
        : [];

      const exclusiveClubsData = Array.isArray(clubsData)
        ? clubsData.filter(item => item.isPaid || item.is_paid || item.subscription_price > 0)
        : [];

      // Transform data for display
      const transformedWorkouts = premiumWorkoutsData.map(workout => ({
        ...workout,
        type: 'workout',
        imageUrl: workout.image_url || workout.thumbnail_url || '',
        duration: workout.duration || '30 min',
        difficulty: workout.difficulty || workout.level || 'Intermediate',
        rating: workout.rating || 4.5,
        price: workout.price || 0,
      }));

      const transformedPrograms = eliteProgramsData.map(program => ({
        ...program,
        type: 'program',
        imageUrl: program.image_url || program.thumbnail_url || '',
        duration: program.duration || '4 weeks',
        difficulty: program.difficulty || program.level || 'Intermediate',
        rating: program.rating || 4.5,
        price: program.price || 0,
      }));

      const transformedSessions = vipSessionsData.map(session => ({
        ...session,
        type: 'session',
        imageUrl: session.image_url || session.thumbnail_url || '',
        dateTime: session.dateTime || session.date_time || new Date().toISOString(),
        location: session.location || (session.isOnline ? 'Online' : 'TBD'),
        host: session.host || { id: session.host_id, name: session.host_name || 'Unknown Host' },
        attendeeCount: session.attendeeCount || session.attendee_count || 0,
        maxAttendees: session.maxAttendees || session.max_attendees,
        isAttending: session.isAttending || false,
        isPaid: session.isPaid || session.is_paid || false,
        price: session.price || 0,
      }));

      const transformedClubs = exclusiveClubsData.map(club => ({
        ...club,
        type: 'club',
        imageUrl: club.profile_image_url || club.image_url || '',
        memberCount: club.member_count || club.memberCount || 0,
        isJoined: club.isJoined || false,
        isPaid: club.isPaid || club.is_paid || false,
        price: club.subscription_price || club.price || 0,
      }));

      setPremiumWorkouts(transformedWorkouts);
      setElitePrograms(transformedPrograms);
      setVipSessions(transformedSessions);
      setExclusiveClubs(transformedClubs);
    } catch (error) {
      console.error('Error loading EliteFit content:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadEliteFitContent();
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadEliteFitContent();
    setRefreshing(false);
  }, []);

  const handleWorkoutPress = useCallback((workout: any) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(`/workout/detail/${workout.id}` as any);
  }, [router]);

  const handleProgramPress = useCallback((program: any) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(`/program/detail/${program.id}` as any);
  }, [router]);

  const handleSessionPress = useCallback((session: any) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(`/session/detail/${session.id}` as any);
  }, [router]);

  const handleClubPress = useCallback((club: any) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(`/club/${club.id}` as any);
  }, [router]);

  const handleCategoryPress = useCallback((category: any) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    // Navigate to specific category view
    switch (category.id) {
      case 'premium-workouts':
        router.push('/marketplace/workouts?filter=premium' as any);
        break;
      case 'elite-programs':
        router.push('/marketplace/programs?filter=premium' as any);
        break;
      case 'vip-sessions':
        router.push('/marketplace/sessions?filter=premium' as any);
        break;
      case 'exclusive-clubs':
        router.push('/marketplace/clubs?filter=premium' as any);
        break;
    }
  }, [router]);

  const renderCategoryCard = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={[styles.categoryCard, { backgroundColor: item.color }]}
      onPress={() => handleCategoryPress(item)}
      activeOpacity={0.8}
    >
      <LinearGradient
        colors={[item.color, `${item.color}CC`]}
        style={styles.categoryCardGradient}
      >
        <View style={styles.categoryCardContent}>
          <Ionicons name={item.icon as any} size={32} color="#FFFFFF" style={styles.categoryIcon} />
          <Text style={styles.categoryTitle}>{item.title}</Text>
          <Text style={styles.categorySubtitle}>{item.subtitle}</Text>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );

  const renderWorkout = ({ item }: { item: any }) => (
    <WorkoutCard
      workout={item}
      onPress={() => handleWorkoutPress(item)}
    />
  );

  const renderProgram = ({ item }: { item: any }) => (
    <ProgramCard
      id={item.id}
      title={item.title || item.name}
      description={item.description}
      authorName={item.author?.username || item.author_name || 'Unknown'}
      authorImageUrl={item.author?.avatar_url || item.author_image_url}
      imageUrl={item.imageUrl || item.image_url || item.thumbnail_url}
      duration={item.duration_weeks || item.duration}
      workoutCount={item.workout_count || item.workouts?.length}
      level={item.difficulty || item.level}
      price={item.price}
      onPress={() => handleProgramPress(item)}
    />
  );

  const renderSession = ({ item }: { item: any }) => (
    <SessionCard
      session={item}
      variant="compact"
      onPress={() => handleSessionPress(item)}
      onJoin={() => handleSessionPress(item)}
    />
  );

  const renderClub = ({ item }: { item: any }) => (
    <ClubCard
      id={item.id}
      name={item.name || item.title}
      description={item.description}
      ownerName={item.owner?.username || item.owner_name || 'Unknown'}
      ownerImageUrl={item.owner?.avatar_url || item.owner_image_url}
      profileImageUrl={item.imageUrl || item.profile_image_url}
      coverImageUrl={item.banner_image_url || item.cover_image_url}
      memberCount={item.memberCount || item.member_count}
      price={item.price || item.subscription_price}
      isSubscribed={item.isJoined || item.is_subscribed}
      onPress={() => handleClubPress(item)}
    />
  );

  const handleBackPress = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  }, [router]);

  if (isLoading) {
    return (
      <View style={styles.container}>
        {/* Extended background image that bleeds down */}
        <View style={styles.extendedBackground}>
          <ImageBackground
            source={require('../../assets/images/marketplace/elitefit.jpg')}
            style={styles.extendedBackgroundImage}
            imageStyle={{ resizeMode: 'cover' }}
          />
          <LinearGradient
            colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0.1)', 'rgba(0,0,0,0.5)', 'rgba(0,0,0,0.9)', 'rgba(0,0,0,1)']}
            locations={[0, 0.2, 0.4, 0.7, 1]}
            style={styles.extendedGradient}
          />
        </View>

        {/* Spotify-style Header with Background Image */}
        <View style={styles.headerContainer}>
          <ImageBackground
            source={require('../../assets/images/marketplace/elitefit.jpg')}
            style={styles.headerBackground}
            imageStyle={styles.headerBackgroundImage}
          >
            <LinearGradient
              colors={['rgba(0,0,0,0.1)', 'rgba(0,0,0,0.9)']}
              style={styles.headerGradient}
            >
              <View style={[styles.headerContent, { paddingTop: insets.top + 20 }]}>
                <TouchableOpacity
                  style={styles.backButton}
                  onPress={handleBackPress}
                  activeOpacity={0.8}
                >
                  <Text style={styles.backButtonText}>←</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>EliteFit</Text>
                <Text style={styles.headerSubtitle}>Loading premium content...</Text>
              </View>
            </LinearGradient>
          </ImageBackground>
        </View>

        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FFD700" />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Extended background image that bleeds down */}
      <View style={styles.extendedBackground}>
        <ImageBackground
          source={require('../../assets/images/marketplace/elitefit.jpg')}
          style={styles.extendedBackgroundImage}
          imageStyle={{ resizeMode: 'cover' }}
        />
        <LinearGradient
          colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0.1)', 'rgba(0,0,0,0.5)', 'rgba(0,0,0,0.9)', 'rgba(0,0,0,1)']}
          locations={[0, 0.2, 0.4, 0.7, 1]}
          style={styles.extendedGradient}
        />
      </View>

      {/* Spotify-style Header with Background Image */}
      <View style={styles.headerContainer}>
        <ImageBackground
          source={require('../../assets/images/marketplace/elitefit.jpg')}
          style={styles.headerBackground}
          imageStyle={styles.headerBackgroundImage}
        >
          <LinearGradient
            colors={['rgba(0,0,0,0.1)', 'rgba(0,0,0,0.9)']}
            style={styles.headerGradient}
          >
            <View style={[styles.headerContent, { paddingTop: insets.top + 20 }]}>
              <TouchableOpacity
                style={styles.backButton}
                onPress={handleBackPress}
                activeOpacity={0.8}
              >
                <Text style={styles.backButtonText}>←</Text>
              </TouchableOpacity>
              <Text style={styles.headerTitle}>EliteFit</Text>
              <Text style={styles.headerSubtitle}>Premium fitness experiences & exclusive content</Text>
            </View>
          </LinearGradient>
        </ImageBackground>
      </View>

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
          {/* Hero Section */}
          <View style={styles.heroSection}>
            <LinearGradient
              colors={['#FFD700', '#FFA500', '#FF8C00']}
              style={styles.heroGradient}
            >
              <View style={styles.heroContent}>
                <Ionicons name="star" size={48} color="#000000" style={styles.heroIcon} />
                <Text style={styles.heroTitle}>Welcome to EliteFit</Text>
                <Text style={styles.heroSubtitle}>
                  Unlock premium fitness experiences, exclusive content, and VIP access to the best trainers and communities.
                </Text>
              </View>
            </LinearGradient>
          </View>

          {/* Categories */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Explore Premium Categories</Text>
            <FlatList
              data={eliteFitCategories}
              renderItem={renderCategoryCard}
              keyExtractor={(item) => item.id}
              numColumns={2}
              scrollEnabled={false}
              contentContainerStyle={styles.categoriesGrid}
            />
          </View>

          {/* Premium Workouts */}
          {premiumWorkouts.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Premium Workouts</Text>
              <FlatList
                data={premiumWorkouts.slice(0, 5)}
                renderItem={renderWorkout}
                keyExtractor={(item) => item.id}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.horizontalList}
              />
            </View>
          )}

          {/* Elite Programs */}
          {elitePrograms.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Elite Programs</Text>
              <FlatList
                data={elitePrograms.slice(0, 5)}
                renderItem={renderProgram}
                keyExtractor={(item) => item.id}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.horizontalList}
              />
            </View>
          )}

          {/* VIP Sessions */}
          {vipSessions.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>VIP Sessions</Text>
              <FlatList
                data={vipSessions.slice(0, 3)}
                renderItem={renderSession}
                keyExtractor={(item) => item.id}
                scrollEnabled={false}
                contentContainerStyle={styles.sessionsList}
              />
            </View>
          )}

          {/* Exclusive Clubs */}
          {exclusiveClubs.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Exclusive Clubs</Text>
              <FlatList
                data={exclusiveClubs.slice(0, 5)}
                renderItem={renderClub}
                keyExtractor={(item) => item.id}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.horizontalList}
              />
            </View>
          )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  extendedBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 800,
  },
  extendedBackgroundImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.7,
  },
  extendedGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  headerContainer: {
    position: 'relative',
    zIndex: 2,
  },
  headerBackground: {
    height: 200,
    width: '100%',
  },
  headerBackgroundImage: {
    resizeMode: 'cover',
  },
  headerGradient: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  headerContent: {
    paddingHorizontal: 16,
    paddingBottom: 20,
    alignItems: 'flex-start',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  backButtonText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '500',
  },
  content: {
    flex: 1,
    backgroundColor: 'transparent',
    zIndex: 2,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 50,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 50,
  },
  heroSection: {
    marginBottom: 32,
  },
  heroGradient: {
    marginHorizontal: 16,
    borderRadius: 20,
    overflow: 'hidden',
  },
  heroContent: {
    padding: 24,
    alignItems: 'center',
    textAlign: 'center',
  },
  heroIcon: {
    marginBottom: 16,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#000000',
    marginBottom: 8,
    textAlign: 'center',
  },
  heroSubtitle: {
    fontSize: 16,
    color: 'rgba(0, 0, 0, 0.8)',
    textAlign: 'center',
    lineHeight: 22,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  categoriesGrid: {
    paddingHorizontal: 16,
  },
  categoryCard: {
    flex: 1,
    height: 120,
    borderRadius: 16,
    margin: 4,
    overflow: 'hidden',
  },
  categoryCardGradient: {
    flex: 1,
    padding: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryCardContent: {
    alignItems: 'center',
  },
  categoryIcon: {
    marginBottom: 8,
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
    textAlign: 'center',
  },
  categorySubtitle: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
  },
  horizontalList: {
    paddingHorizontal: 16,
  },
  sessionsList: {
    paddingHorizontal: 16,
  },
});
