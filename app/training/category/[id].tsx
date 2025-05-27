import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useRef, useState } from 'react';
import {
    Animated,
    FlatList,
    Image,
    ImageBackground,
    StyleSheet,
    TouchableOpacity,
    View,
    Dimensions,
    Text,
    ScrollView,
    SafeAreaView
} from 'react-native';

// Define subcategories for enhanced filtering
const subcategories = {
  strength: [
    { id: 'powerlifting', label: 'Powerlifting' },
    { id: 'olympic', label: 'Olympic Lifting' },
    { id: 'functional', label: 'Functional Strength' },
    { id: 'calisthenics', label: 'Calisthenics' },
  ],
  hypertrophy: [
    { id: 'bodybuilding', label: 'Bodybuilding' },
    { id: 'volume', label: 'Volume Training' },
    { id: 'isolation', label: 'Isolation Work' },
  ],
  cardio: [
    { id: 'running', label: 'Running' },
    { id: 'cycling', label: 'Cycling' },
    { id: 'swimming', label: 'Swimming' },
    { id: 'rowing', label: 'Rowing' },
  ],
  hiit: [
    { id: 'tabata', label: 'Tabata' },
    { id: 'amrap', label: 'AMRAP' },
    { id: 'emom', label: 'EMOM' },
    { id: 'circuit', label: 'Circuit Training' },
  ],
  mobility: [
    { id: 'stretching', label: 'Stretching' },
    { id: 'yoga', label: 'Yoga' },
    { id: 'recovery', label: 'Recovery' },
  ],
  sports: [
    { id: 'basketball', label: 'Basketball' },
    { id: 'soccer', label: 'Soccer' },
    { id: 'tennis', label: 'Tennis' },
    { id: 'golf', label: 'Golf' },
  ],
};

// Category titles
const categoryTitles = {
  strength: 'Strength Training',
  hypertrophy: 'Hypertrophy',
  cardio: 'Cardio',
  hiit: 'HIIT',
  mobility: 'Mobility',
  sports: 'Sports',
  upper: 'Upper Body',
  lower: 'Lower Body',
  core: 'Core',
  programs: 'Programs',
  featured: 'Featured',
};

// Category colors
const categoryColors = {
  strength: '#0A84FF',
  hypertrophy: '#FF2D55',
  cardio: '#30D158',
  hiit: '#FF9F0A',
  mobility: '#5856D6',
  sports: '#64D2FF',
  upper: '#BF5AF2',
  lower: '#FF3B30',
  core: '#FFD60A',
  programs: '#5E5CE6',
  featured: '#0A84FF',
};

// Category icons
const categoryIcons = {
  strength: 'barbell-outline',
  hypertrophy: 'fitness-outline',
  cardio: 'heart-outline',
  hiit: 'timer-outline',
  mobility: 'body-outline',
  sports: 'basketball-outline',
  upper: 'body-outline',
  lower: 'body-outline',
  core: 'body-outline',
  programs: 'calendar-outline',
  featured: 'star-outline',
};

export default function CategoryDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const categoryId = id || 'featured';
  const scrollY = useRef(new Animated.Value(0)).current;
  const [activeSubcategory, setActiveSubcategory] = useState('all');
  const { width } = Dimensions.get('window');

  // Get category info
  const categoryColor = categoryColors[categoryId as keyof typeof categoryColors] || '#0A84FF';
  const categoryTitle = categoryTitles[categoryId as keyof typeof categoryTitles] || 'Category';
  const categoryIcon = categoryIcons[categoryId as keyof typeof categoryIcons] || 'star-outline';

  // Get subcategories for this category
  const categorySubcategories = subcategories[categoryId as keyof typeof subcategories] || [];
  const allSubcategories = [
    { id: 'all', label: 'All' },
    ...categorySubcategories,
  ];

  // Enhanced header animations
  const headerHeight = scrollY.interpolate({
    inputRange: [0, 150],
    outputRange: [280, 120],
    extrapolate: 'clamp',
  });

  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 100, 150],
    outputRange: [1, 0.8, 0.4],
    extrapolate: 'clamp',
  });

  const titleScale = scrollY.interpolate({
    inputRange: [0, 150],
    outputRange: [1, 0.8],
    extrapolate: 'clamp',
  });

  const parallaxOffset = scrollY.interpolate({
    inputRange: [0, 300],
    outputRange: [0, -150],
    extrapolate: 'clamp',
  });

  // Navigation handlers
  const handleWorkoutPress = (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    console.log('Navigate to workout:', id);
  };

  // Enhanced mock workouts data
  const mockWorkouts = [
    {
      id: '1',
      title: 'Olympic Hurdle Training',
      duration: 90,
      exercises: 8,
      difficulty: 'Advanced',
      image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&q=80',
    },
    {
      id: '2',
      title: 'NFL Route Running',
      duration: 70,
      exercises: 6,
      difficulty: 'Intermediate',
      image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&q=80',
    },
    {
      id: '3',
      title: 'Power Session',
      duration: 80,
      exercises: 7,
      difficulty: 'Advanced',
      image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&q=80',
    },
    {
      id: '4',
      title: 'HIIT Cardio Blast',
      duration: 45,
      exercises: 5,
      difficulty: 'Beginner',
      image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&q=80',
    },
    {
      id: '5',
      title: 'Core Strengthening',
      duration: 60,
      exercises: 6,
      difficulty: 'Intermediate',
      image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&q=80',
    },
    {
      id: '6',
      title: 'Full Body Blast',
      duration: 75,
      exercises: 9,
      difficulty: 'Advanced',
      image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&q=80',
    },
  ];

  // Filter workouts based on active subcategory
  const filteredWorkouts = activeSubcategory === 'all' 
    ? mockWorkouts 
    : mockWorkouts.filter(workout => 
        workout.title.toLowerCase().includes(activeSubcategory.toLowerCase())
      );

  // Enhanced subcategory tab renderer
  const renderSubcategoryTabs = () => (
    <View style={styles.subcategoryContainer}>
      <BlurView intensity={40} tint="dark" style={styles.subcategoryBlur}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.subcategoryScrollContent}
        >
          {allSubcategories.map((subcategory, index) => {
            const isActive = subcategory.id === activeSubcategory;
            return (
              <TouchableOpacity
                key={subcategory.id}
                style={[
                  styles.subcategoryTab,
                  isActive && [styles.activeSubcategoryTab, { borderColor: categoryColor }],
                  index === 0 && styles.firstSubcategoryTab,
                ]}
                onPress={() => {
                  setActiveSubcategory(subcategory.id);
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }}
                activeOpacity={0.8}
              >
                {isActive && (
                  <LinearGradient
                    colors={[`${categoryColor}40`, `${categoryColor}20`]}
                    style={styles.activeSubcategoryBackground}
                  />
                )}
                <Text style={[
                  styles.subcategoryTabText,
                  isActive && [styles.activeSubcategoryTabText, { color: categoryColor }]
                ]}>
                  {subcategory.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </BlurView>
    </View>
  );

  // Enhanced stats card renderer
  const renderStatsCard = () => (
    <BlurView intensity={20} tint="dark" style={styles.statsCard}>
      <LinearGradient
        colors={['rgba(255, 255, 255, 0.1)', 'rgba(255, 255, 255, 0.05)']}
        style={styles.statsGradient}
      >
        <View style={styles.statsContent}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{filteredWorkouts.length}</Text>
            <Text style={styles.statLabel}>Workouts</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>
              {Math.round(filteredWorkouts.reduce((acc, w) => acc + (w.duration || 0), 0) / 60)}
            </Text>
            <Text style={styles.statLabel}>Total Hours</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>
              {filteredWorkouts.reduce((acc, w) => acc + (w.exercises || 0), 0)}
            </Text>
            <Text style={styles.statLabel}>Exercises</Text>
          </View>
        </View>
      </LinearGradient>
    </BlurView>
  );

  // Enhanced featured workout renderer
  const renderFeaturedWorkout = () => {
    const featuredWorkout = filteredWorkouts[0];
    if (!featuredWorkout) return null;

    return (
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Featured {categoryTitle}</Text>
          <TouchableOpacity style={styles.seeAllButton}>
            <Text style={[styles.seeAllText, { color: categoryColor }]}>See All</Text>
            <Ionicons name="chevron-forward" size={12} color={categoryColor} />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.featuredCard}
          onPress={() => handleWorkoutPress(featuredWorkout.id)}
          activeOpacity={0.9}
        >
          <ImageBackground
            source={{ uri: featuredWorkout.image }}
            style={styles.featuredImage}
            imageStyle={styles.featuredImageStyle}
          >
            <LinearGradient
              colors={['rgba(0,0,0,0.2)', 'rgba(0,0,0,0.8)']}
              style={styles.featuredGradient}
            >
              <BlurView intensity={15} tint="dark" style={styles.featuredBlur}>
                <View style={styles.featuredContent}>
                  <View style={styles.featuredHeader}>
                    <View style={[styles.categoryBadge, { backgroundColor: categoryColor }]}>
                      <Ionicons name={categoryIcon as any} size={14} color="#FFFFFF" />
                      <Text style={styles.categoryBadgeText}>{categoryTitle}</Text>
                    </View>
                    <TouchableOpacity style={styles.favoriteButton}>
                      <Ionicons name="heart-outline" size={18} color="#FFFFFF" />
                    </TouchableOpacity>
                  </View>
                  
                  <View style={styles.featuredDetails}>
                    <Text style={styles.featuredTitle}>{featuredWorkout.title}</Text>
                    <Text style={styles.featuredDescription}>
                      High-intensity workout for maximum results
                    </Text>
                    
                    <View style={styles.featuredStats}>
                      <View style={styles.featuredStat}>
                        <Ionicons name="time-outline" size={14} color="#8E8E93" />
                        <Text style={styles.featuredStatText}>{featuredWorkout.duration} min</Text>
                      </View>
                      <View style={styles.featuredStat}>
                        <Ionicons name="barbell-outline" size={14} color="#8E8E93" />
                        <Text style={styles.featuredStatText}>{featuredWorkout.exercises} exercises</Text>
                      </View>
                      <View style={styles.featuredStat}>
                        <Ionicons name="flash-outline" size={14} color="#8E8E93" />
                        <Text style={styles.featuredStatText}>{featuredWorkout.difficulty}</Text>
                      </View>
                    </View>

                    <TouchableOpacity style={[styles.startButton, { backgroundColor: categoryColor }]}>
                      <Ionicons name="play" size={16} color="#FFFFFF" />
                      <Text style={styles.startButtonText}>Start Workout</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </BlurView>
            </LinearGradient>
          </ImageBackground>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Enhanced Header with parallax */}
      <Animated.View style={[styles.header, { height: headerHeight, transform: [{ translateY: parallaxOffset }] }]}>
        <ImageBackground
          source={{ uri: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&q=80' }}
          style={styles.headerImage}
          imageStyle={styles.headerImageStyle}
        >
          <LinearGradient
            colors={[`${categoryColor}80`, 'rgba(0,0,0,0.9)']}
            style={styles.headerGradient}
          >
            <BlurView intensity={20} tint="dark" style={styles.headerBlur}>
              <Animated.View style={[styles.headerContent, { opacity: headerOpacity, transform: [{ scale: titleScale }] }]}>
                <View style={[styles.categoryIconContainer, { borderColor: categoryColor }]}>
                  <LinearGradient
                    colors={[categoryColor, `${categoryColor}80`]}
                    style={styles.categoryIconGradient}
                  >
                    <Ionicons name={categoryIcon as any} size={32} color="#FFFFFF" />
                  </LinearGradient>
                </View>
                <Text style={styles.headerTitle}>{categoryTitle}</Text>
                <Text style={styles.headerSubtitle}>Discover workouts tailored for your goals</Text>
              </Animated.View>
            </BlurView>
          </LinearGradient>
        </ImageBackground>

        {/* Navigation buttons with glassmorphism */}
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          activeOpacity={0.8}
        >
          <BlurView intensity={20} tint="dark" style={styles.navButton}>
            <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
          </BlurView>
        </TouchableOpacity>

        <TouchableOpacity style={styles.searchButton} activeOpacity={0.8}>
          <BlurView intensity={20} tint="dark" style={styles.navButton}>
            <Ionicons name="search" size={18} color="#FFFFFF" />
          </BlurView>
        </TouchableOpacity>
      </Animated.View>

      {/* Subcategory tabs */}
      <Animated.View style={[styles.tabsContainer, { transform: [{ translateY: headerHeight }] }]}>
        {renderSubcategoryTabs()}
      </Animated.View>

      {/* Main content */}
      <Animated.ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
        contentContainerStyle={{ paddingTop: 340 }}
      >
        <View style={styles.contentContainer}>
          {/* Stats overview */}
          {renderStatsCard()}

          {/* Featured workout */}
          {renderFeaturedWorkout()}

          {/* Workouts grid */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>
                {activeSubcategory === 'all' ? 'All' : allSubcategories.find(s => s.id === activeSubcategory)?.label} Workouts
              </Text>
              <TouchableOpacity style={styles.filterButton}>
                <Ionicons name="filter" size={14} color="#8E8E93" />
                <Text style={styles.filterText}>Filter</Text>
              </TouchableOpacity>
            </View>

            <FlatList
              data={filteredWorkouts.slice(1, 7)}
              renderItem={({ item, index }) => (
                <View style={[styles.workoutCardWrapper, { marginRight: (index % 2 === 0) ? 8 : 0 }]}>
                  <TouchableOpacity
                    style={styles.enhancedWorkoutCard}
                    onPress={() => handleWorkoutPress(item.id)}
                    activeOpacity={0.9}
                  >
                    <ImageBackground
                      source={{ uri: item.image }}
                      style={styles.workoutCardImage}
                      imageStyle={styles.workoutCardImageStyle}
                    >
                      <LinearGradient
                        colors={['transparent', 'rgba(0,0,0,0.8)']}
                        style={styles.workoutCardGradient}
                      >
                        <BlurView intensity={10} tint="dark" style={styles.workoutCardBlur}>
                          <View style={styles.workoutCardContent}>
                            <View style={styles.workoutCardHeader}>
                              <View style={[styles.workoutTypeBadge, { backgroundColor: categoryColor }]}>
                                <Ionicons name={categoryIcon as any} size={12} color="#FFFFFF" />
                              </View>
                              <TouchableOpacity style={styles.workoutMenuButton}>
                                <Ionicons name="ellipsis-horizontal" size={14} color="#FFFFFF" />
                              </TouchableOpacity>
                            </View>
                            
                            <View style={styles.workoutCardDetails}>
                              <Text style={styles.workoutCardTitle} numberOfLines={2}>
                                {item.title}
                              </Text>
                              
                              <View style={styles.workoutCardStats}>
                                <View style={styles.workoutCardStat}>
                                  <Ionicons name="time-outline" size={12} color="#8E8E93" />
                                  <Text style={styles.workoutCardStatText}>
                                    {item.duration}m
                                  </Text>
                                </View>
                                <View style={styles.workoutCardStat}>
                                  <Ionicons name="barbell-outline" size={12} color="#8E8E93" />
                                  <Text style={styles.workoutCardStatText}>
                                    {item.exercises}
                                  </Text>
                                </View>
                              </View>
                            </View>
                          </View>
                        </BlurView>
                      </LinearGradient>
                    </ImageBackground>
                  </TouchableOpacity>
                </View>
              )}
              keyExtractor={(item) => item.id}
              numColumns={2}
              scrollEnabled={false}
              contentContainerStyle={styles.workoutsGrid}
            />
          </View>

          {/* Bottom spacing */}
          <View style={styles.bottomSpacing} />
        </View>
      </Animated.ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    width: '100%',
    position: 'absolute',
    top: 0,
    zIndex: 10,
  },
  headerImage: {
    width: '100%',
    height: '100%',
  },
  headerImageStyle: {
    resizeMode: 'cover',
  },
  headerGradient: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  headerBlur: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  headerContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    alignItems: 'center',
  },
  categoryIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    overflow: 'hidden',
  },
  categoryIconGradient: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 4,
  },
  headerSubtitle: {
    color: '#FFFFFF',
    fontSize: 16,
    textAlign: 'center',
    opacity: 0.8,
  },
  backButton: {
    position: 'absolute',
    top: 60,
    left: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: 'hidden',
  },
  searchButton: {
    position: 'absolute',
    top: 60,
    right: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: 'hidden',
  },
  navButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabsContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 5,
  },
  subcategoryContainer: {
    height: 56,
    marginBottom: 8,
  },
  subcategoryBlur: {
    flex: 1,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  subcategoryScrollContent: {
    paddingHorizontal: 16,
    alignItems: 'center',
    height: '100%',
    paddingVertical: 8,
  },
  subcategoryTab: {
    paddingHorizontal: 18,
    paddingVertical: 8,
    marginRight: 12,
    borderRadius: 20,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  firstSubcategoryTab: {
    marginLeft: 0,
  },
  activeSubcategoryTab: {
    borderColor: 'rgba(255, 255, 255, 0.3)',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  activeSubcategoryBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 20,
  },
  subcategoryTabText: {
    color: '#8E8E93',
    fontWeight: '600',
    fontSize: 14,
  },
  activeSubcategoryTabText: {
    color: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  statsCard: {
    marginBottom: 24,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  statsGradient: {
    flex: 1,
  },
  statsContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    padding: 20,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    color: '#8E8E93',
    fontSize: 14,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '600',
    flex: 1,
  },
  seeAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  seeAllText: {
    marginRight: 4,
    fontSize: 14,
    fontWeight: '500',
  },
  featuredCard: {
    height: 280,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  featuredImage: {
    width: '100%',
    height: '100%',
  },
  featuredImageStyle: {
    resizeMode: 'cover',
  },
  featuredGradient: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  featuredBlur: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  featuredContent: {
    padding: 20,
  },
  featuredHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  categoryBadgeText: {
    marginLeft: 4,
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  favoriteButton: {
    padding: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  featuredDetails: {
    flex: 1,
  },
  featuredTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  featuredDescription: {
    color: '#FFFFFF',
    fontSize: 14,
    opacity: 0.8,
    marginBottom: 16,
  },
  featuredStats: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  featuredStat: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
  },
  featuredStatText: {
    marginLeft: 6,
    color: '#8E8E93',
    fontSize: 12,
  },
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
    alignSelf: 'flex-start',
  },
  startButtonText: {
    marginLeft: 6,
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  filterText: {
    marginLeft: 4,
    color: '#8E8E93',
    fontSize: 12,
  },
  workoutsGrid: {
    gap: 12,
  },
  workoutCardWrapper: {
    flex: 1,
    height: 200,
    marginBottom: 12,
  },
  enhancedWorkoutCard: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  workoutCardImage: {
    flex: 1,
  },
  workoutCardImageStyle: {
    resizeMode: 'cover',
  },
  workoutCardGradient: {
    flex: 1,
    justifyContent: 'space-between',
  },
  workoutCardBlur: {
    flex: 1,
    justifyContent: 'space-between',
  },
  workoutCardContent: {
    flex: 1,
    padding: 16,
    justifyContent: 'space-between',
  },
  workoutCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  workoutTypeBadge: {
    padding: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  workoutMenuButton: {
    padding: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  workoutCardDetails: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  workoutCardTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  workoutCardStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  workoutCardStat: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  workoutCardStatText: {
    marginLeft: 4,
    color: '#8E8E93',
    fontSize: 11,
  },
  bottomSpacing: {
    height: 120,
  },
});
