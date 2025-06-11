import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    Animated,
    Dimensions,
    FlatList,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    RefreshControl
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { libraryService, UserLibrary, LibraryContent } from '../../services/libraryService';
import { useWorkoutPurchase } from '../../contexts/WorkoutPurchaseContext';

const { width: screenWidth } = Dimensions.get('window');

type LibraryTab = 'all' | 'workouts' | 'programs' | 'exercises' | 'favorites';

export default function LibraryScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { refreshPurchaseHistory } = useWorkoutPurchase();
  
  const [activeTab, setActiveTab] = useState<LibraryTab>('all');
  const [library, setLibrary] = useState<UserLibrary | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    loadLibrary();
    startFadeAnimation();
  }, []);

  const startFadeAnimation = () => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  };

  const loadLibrary = async () => {
    try {
      setLoading(true);
      const userLibrary = await libraryService.getUserLibrary();
      setLibrary(userLibrary);
    } catch (error) {
      console.error('Error loading library:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        loadLibrary(),
        refreshPurchaseHistory()
      ]);
    } catch (error) {
      console.error('Error refreshing library:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const handleTabPress = (tab: LibraryTab) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setActiveTab(tab);
  };

  const handleContentPress = (content: LibraryContent) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    switch (content.contentType) {
      case 'workout':
        router.push(`/workout/detail/${content.contentId}` as any);
        break;
      case 'program':
        router.push(`/programs/detail/${content.contentId}` as any);
        break;
      case 'exercise':
        router.push(`/exercise/detail/${content.contentId}` as any);
        break;
    }
  };

  const getFilteredContent = (): LibraryContent[] => {
    if (!library) return [];
    
    switch (activeTab) {
      case 'workouts':
        return library.workouts;
      case 'programs':
        return library.programs;
      case 'exercises':
        return library.exercises;
      case 'favorites':
        return library.favorites;
      case 'all':
      default:
        return [
          ...library.workouts,
          ...library.programs,
          ...library.exercises,
          ...library.collections
        ].sort((a, b) => new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime());
    }
  };

  const formatDate = (date: Date): string => {
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'Today';
    if (diffDays === 2) return 'Yesterday';
    if (diffDays <= 7) return `${diffDays - 1} days ago`;
    return date.toLocaleDateString();
  };

  const getAccessTypeColor = (accessType: string): string => {
    switch (accessType) {
      case 'purchased': return '#30D158';
      case 'created': return '#0A84FF';
      case 'subscribed': return '#FF9F0A';
      case 'free': return '#8E8E93';
      default: return '#8E8E93';
    }
  };

  const getAccessTypeIcon = (accessType: string): string => {
    switch (accessType) {
      case 'purchased': return 'checkmark-circle';
      case 'created': return 'create';
      case 'subscribed': return 'time';
      case 'free': return 'gift';
      default: return 'help-circle';
    }
  };

  const renderLibraryItem = ({ item }: { item: LibraryContent }) => (
    <TouchableOpacity
      style={styles.libraryItem}
      onPress={() => handleContentPress(item)}
      activeOpacity={0.8}
    >
      <BlurView intensity={20} style={styles.libraryItemBlur}>
        <View style={styles.libraryItemContent}>
          <View style={styles.libraryItemIcon}>
            <Ionicons 
              name={
                item.contentType === 'workout' ? 'fitness-outline' :
                item.contentType === 'program' ? 'list-outline' :
                item.contentType === 'exercise' ? 'barbell-outline' : 'folder-outline'
              } 
              size={24} 
              color="#0A84FF" 
            />
          </View>
          
          <View style={styles.libraryItemInfo}>
            <Text style={styles.libraryItemTitle} numberOfLines={1}>
              {item.contentId} {/* In real app, would fetch actual title */}
            </Text>
            <Text style={styles.libraryItemSubtitle}>
              {item.contentType.charAt(0).toUpperCase() + item.contentType.slice(1)} • {formatDate(item.addedAt)}
            </Text>
          </View>
          
          <View style={styles.libraryItemMeta}>
            <View style={[styles.accessTypeBadge, { backgroundColor: getAccessTypeColor(item.accessType) + '20' }]}>
              <Ionicons 
                name={getAccessTypeIcon(item.accessType) as any} 
                size={12} 
                color={getAccessTypeColor(item.accessType)} 
              />
              <Text style={[styles.accessTypeText, { color: getAccessTypeColor(item.accessType) }]}>
                {item.accessType}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color="#8E8E93" />
          </View>
        </View>
      </BlurView>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="library-outline" size={64} color="#8E8E93" />
      <Text style={styles.emptyStateTitle}>Your Library is Empty</Text>
      <Text style={styles.emptyStateSubtitle}>
        Purchase workouts and programs from the marketplace to build your personal library
      </Text>
      <TouchableOpacity
        style={styles.emptyStateButton}
        onPress={() => router.push('/marketplace')}
      >
        <Text style={styles.emptyStateButtonText}>Browse Marketplace</Text>
      </TouchableOpacity>
    </View>
  );

  const tabs: { id: LibraryTab; title: string; count?: number }[] = [
    { id: 'all', title: 'All', count: library?.totalItems },
    { id: 'workouts', title: 'Workouts', count: library?.workouts.length },
    { id: 'programs', title: 'Programs', count: library?.programs.length },
    { id: 'exercises', title: 'Exercises', count: library?.exercises.length },
    { id: 'favorites', title: 'Favorites', count: library?.favorites.length },
  ];

  const filteredContent = getFilteredContent();

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 20 }]}>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>My Library</Text>
          <Text style={styles.headerSubtitle}>
            {library ? `${library.totalItems} items` : 'Loading...'}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.refreshButton}
          onPress={onRefresh}
        >
          <Ionicons name="refresh" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        {/* Tabs */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.tabsContainer}
          contentContainerStyle={styles.tabsContent}
        >
          {tabs.map((tab) => (
            <TouchableOpacity
              key={tab.id}
              style={[
                styles.tab,
                activeTab === tab.id && styles.activeTab
              ]}
              onPress={() => handleTabPress(tab.id)}
            >
              <Text style={[
                styles.tabText,
                activeTab === tab.id && styles.activeTabText
              ]}>
                {tab.title}
                {tab.count !== undefined && tab.count > 0 && ` (${tab.count})`}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Content */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading your library...</Text>
          </View>
        ) : filteredContent.length === 0 ? (
          renderEmptyState()
        ) : (
          <FlatList
            data={filteredContent}
            renderItem={renderLibraryItem}
            keyExtractor={(item) => `${item.contentType}-${item.contentId}`}
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor="#FFFFFF"
              />
            }
          />
        )}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  headerSubtitle: {
    color: '#8E8E93',
    fontSize: 16,
  },
  refreshButton: {
    padding: 8,
  },
  content: {
    flex: 1,
  },

  // Tabs
  tabsContainer: {
    maxHeight: 50,
    marginBottom: 20,
  },
  tabsContent: {
    paddingHorizontal: 20,
    gap: 12,
  },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  activeTab: {
    backgroundColor: '#0A84FF',
    borderColor: '#0A84FF',
  },
  tabText: {
    color: '#8E8E93',
    fontSize: 14,
    fontWeight: '500',
  },
  activeTabText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },

  // Library Items
  listContainer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  libraryItem: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 12,
  },
  libraryItemBlur: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  libraryItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  libraryItemIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(10, 132, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    borderWidth: 1,
    borderColor: 'rgba(10, 132, 255, 0.3)',
  },
  libraryItemInfo: {
    flex: 1,
  },
  libraryItemTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  libraryItemSubtitle: {
    color: '#8E8E93',
    fontSize: 14,
  },
  libraryItemMeta: {
    alignItems: 'center',
    gap: 8,
  },
  accessTypeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  accessTypeText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },

  // Empty State
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyStateTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyStateSubtitle: {
    color: '#8E8E93',
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
  },
  emptyStateButton: {
    backgroundColor: '#0A84FF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  emptyStateButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },

  // Loading
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#8E8E93',
    fontSize: 16,
  },
});
