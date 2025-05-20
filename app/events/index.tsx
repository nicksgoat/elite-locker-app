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
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import GlobalHeader from '../../components/ui/GlobalHeader';

const { width } = Dimensions.get('window');

// Event type interfaces
interface EventTier {
  id: string;
  name: string;
  price: number;
  capacity: number | null;
  sold: number;
}

interface Event {
  id: string;
  clubId: string | null;
  hostId: string;
  title: string;
  description: string;
  bannerUrl: string;
  eventType: 'in_person' | 'virtual' | 'hybrid';
  location: string | null;
  startTime: string;
  endTime: string;
  capacity: number | null;
  hostName: string;
  hostAvatar: string;
  isVerified: boolean;
  tiers: EventTier[];
}

// Mock events data
const mockEvents: Event[] = [
  {
    id: 'e1',
    clubId: 'c1',
    hostId: 'h1',
    title: 'Speed & Agility Fundamentals',
    description: 'Master the basics of speed and agility with this comprehensive workshop. Learn proper form, technique, and drills to enhance your athletic performance.',
    bannerUrl: 'https://pbs.twimg.com/profile_banners/372145971/1465540138/1500x500',
    eventType: 'hybrid',
    location: 'Elite Training Center & Virtual',
    startTime: '2025-06-15T18:00:00',
    endTime: '2025-06-15T20:00:00',
    capacity: 30,
    hostName: 'Coach Devon Allen',
    hostAvatar: 'https://pbs.twimg.com/profile_images/1745305109008154624/oO6jSpTf_400x400.jpg',
    isVerified: true,
    tiers: [
      {
        id: 't1',
        name: 'Early Bird',
        price: 49.99,
        capacity: 10,
        sold: 7
      },
      {
        id: 't2',
        name: 'Standard',
        price: 69.99,
        capacity: 20,
        sold: 5
      }
    ]
  },
  {
    id: 'e2',
    clubId: 'c2',
    hostId: 'h2',
    title: 'Recovery & Mobility Workshop',
    description: 'Learn essential recovery techniques to optimize your performance and prevent injuries.',
    bannerUrl: 'https://images.unsplash.com/photo-1603287681836-b174ce5074c2?w=800&auto=format&fit=crop',
    eventType: 'virtual',
    location: null,
    startTime: '2025-06-20T17:30:00',
    endTime: '2025-06-20T19:00:00',
    capacity: 50,
    hostName: 'Dr. Sarah Williams',
    hostAvatar: 'https://i.pravatar.cc/150?img=5',
    isVerified: true,
    tiers: [
      {
        id: 't3',
        name: 'Member',
        price: 0,
        capacity: 50,
        sold: 23
      }
    ]
  },
  {
    id: 'e3',
    clubId: 'c3',
    hostId: 'h3',
    title: 'Strength Training Masterclass',
    description: 'Advanced techniques for building functional strength with professional guidance.',
    bannerUrl: 'https://images.unsplash.com/photo-1535743686920-55e4145369b9?w=800&auto=format&fit=crop',
    eventType: 'in_person',
    location: 'PowerFit Gym, 123 Main St',
    startTime: '2025-06-25T09:00:00',
    endTime: '2025-06-25T12:00:00',
    capacity: 15,
    hostName: 'Alex Chen',
    hostAvatar: 'https://i.pravatar.cc/150?img=3',
    isVerified: false,
    tiers: [
      {
        id: 't4',
        name: 'Club Member',
        price: 39.99,
        capacity: 10,
        sold: 8
      },
      {
        id: 't5',
        name: 'Guest',
        price: 59.99,
        capacity: 5,
        sold: 2
      }
    ]
  },
  {
    id: 'e4',
    clubId: 'c1',
    hostId: 'h1',
    title: 'Nutrition for Athletes Q&A',
    description: 'Live interactive session addressing your nutrition questions for optimal performance.',
    bannerUrl: 'https://images.unsplash.com/photo-1606757389667-45c2024f9fa4?w=800&auto=format&fit=crop',
    eventType: 'virtual',
    location: null,
    startTime: '2025-07-02T19:00:00',
    endTime: '2025-07-02T20:30:00',
    capacity: null,
    hostName: 'Coach Devon Allen',
    hostAvatar: 'https://pbs.twimg.com/profile_images/1745305109008154624/oO6jSpTf_400x400.jpg',
    isVerified: true,
    tiers: [
      {
        id: 't6',
        name: 'Standard',
        price: 19.99,
        capacity: null,
        sold: 42
      }
    ]
  },
  {
    id: 'e5',
    clubId: 'c3',
    hostId: 'h4',
    title: 'October PR Challenge Kickoff',
    description: 'Join this community challenge to smash your personal records during October.',
    bannerUrl: 'https://images.unsplash.com/photo-1519311965067-36d3e5f33d39?w=800&auto=format&fit=crop',
    eventType: 'hybrid',
    location: 'Multiple Locations',
    startTime: '2025-10-01T10:00:00',
    endTime: '2025-10-01T11:30:00',
    capacity: 200,
    hostName: 'Jamie Silva',
    hostAvatar: 'https://i.pravatar.cc/150?img=4',
    isVerified: true,
    tiers: [
      {
        id: 't7',
        name: 'Free Entry',
        price: 0,
        capacity: 200,
        sold: 65
      }
    ]
  }
];

export default function EventsScreen() {
  const router = useRouter();
  const [events, setEvents] = useState<Event[]>(mockEvents);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [scrollY] = useState(new Animated.Value(0));

  const filters = [
    { id: 'all', label: 'All', icon: 'calendar' },
    { id: 'in_person', label: 'In-Person', icon: 'location' },
    { id: 'virtual', label: 'Virtual', icon: 'videocam' },
    { id: 'hybrid', label: 'Hybrid', icon: 'globe' },
    { id: 'free', label: 'Free', icon: 'ticket' },
  ];

  const handleScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
    { useNativeDriver: false }
  );

  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 50, 100],
    outputRange: [0, 0.5, 1],
    extrapolate: 'clamp',
  });

  useEffect(() => {
    filterEvents(activeFilter, searchQuery);
  }, [activeFilter, searchQuery]);

  const filterEvents = (filter: string | null, query: string) => {
    let filteredEvents = [...mockEvents];
    
    // Apply type filter
    if (filter === 'in_person') {
      filteredEvents = filteredEvents.filter(event => event.eventType === 'in_person');
    } else if (filter === 'virtual') {
      filteredEvents = filteredEvents.filter(event => event.eventType === 'virtual');
    } else if (filter === 'hybrid') {
      filteredEvents = filteredEvents.filter(event => event.eventType === 'hybrid');
    } else if (filter === 'free') {
      filteredEvents = filteredEvents.filter(event => 
        event.tiers.some(tier => tier.price === 0)
      );
    }
    
    // Apply search query
    if (query) {
      const lowercaseQuery = query.toLowerCase();
      filteredEvents = filteredEvents.filter(event => 
        event.title.toLowerCase().includes(lowercaseQuery) ||
        event.description.toLowerCase().includes(lowercaseQuery) ||
        event.hostName.toLowerCase().includes(lowercaseQuery)
      );
    }
    
    setEvents(filteredEvents);
  };

  const handleFilterPress = (filterId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setActiveFilter(activeFilter === filterId ? null : filterId);
  };

  const handleEventPress = (eventId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push(`/events/detail/${eventId}`);
  };

  const formatEventDate = (startTime: string, endTime: string) => {
    const start = new Date(startTime);
    const end = new Date(endTime);
    
    const date = start.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
    
    const startTimeStr = start.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
    
    const endTimeStr = end.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
    
    return `${date} · ${startTimeStr} - ${endTimeStr}`;
  };

  const getLowestPrice = (tiers: EventTier[]) => {
    if (tiers.length === 0) return null;
    
    const freeTier = tiers.find(tier => tier.price === 0);
    if (freeTier) return 'Free';
    
    const lowestPrice = Math.min(...tiers.map(tier => tier.price));
    return `$${lowestPrice.toFixed(2)}`;
  };

  const getEventTypeIcon = (type: string) => {
    switch (type) {
      case 'in_person': return 'location';
      case 'virtual': return 'videocam';
      case 'hybrid': return 'globe';
      default: return 'calendar';
    }
  };

  const renderEventCard = ({ item }: { item: Event }) => {
    const eventTypeIcon = getEventTypeIcon(item.eventType);
    const lowestPrice = getLowestPrice(item.tiers);
    const dateTime = formatEventDate(item.startTime, item.endTime);
    
    // Calculate remaining spots
    const totalCapacity = item.capacity || 0;
    const totalSold = item.tiers.reduce((sum, tier) => sum + tier.sold, 0);
    const remainingSpots = totalCapacity ? totalCapacity - totalSold : null;
    
    return (
      <TouchableOpacity
        style={styles.eventCard}
        onPress={() => handleEventPress(item.id)}
        activeOpacity={0.9}
      >
        <Image source={{ uri: item.bannerUrl }} style={styles.eventImage} />
        
        {/* Event details overlay */}
        <BlurView intensity={20} tint="dark" style={styles.eventDetails}>
          <View style={styles.eventHeader}>
            <View style={styles.eventType}>
              <Ionicons name={eventTypeIcon as any} size={14} color="#FFFFFF" />
              <Text style={styles.eventTypeText}>
                {item.eventType.charAt(0).toUpperCase() + item.eventType.slice(1)}
              </Text>
            </View>
            {lowestPrice && (
              <View style={[styles.pricePill, lowestPrice === 'Free' && styles.freePricePill]}>
                <Text style={styles.priceText}>{lowestPrice}</Text>
              </View>
            )}
          </View>
          
          <Text style={styles.eventTitle} numberOfLines={2}>{item.title}</Text>
          <Text style={styles.eventDateTime}>{dateTime}</Text>
          
          <View style={styles.hostContainer}>
            <Image source={{ uri: item.hostAvatar }} style={styles.hostAvatar} />
            <Text style={styles.hostName}>{item.hostName}</Text>
            {item.isVerified && (
              <Ionicons name="checkmark-circle" size={14} color="#0A84FF" style={styles.verifiedIcon} />
            )}
          </View>
          
          {remainingSpots !== null && (
            <View style={styles.capacityContainer}>
              <View style={styles.capacityBar}>
                <View 
                  style={[
                    styles.capacityFill, 
                    { width: `${Math.min(100, (totalSold / totalCapacity) * 100)}%` }
                  ]} 
                />
              </View>
              <Text style={styles.capacityText}>
                {remainingSpots === 0 ? 'Sold out' : `${remainingSpots} spots left`}
              </Text>
            </View>
          )}
        </BlurView>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <StatusBar barStyle="light-content" />
      
      <GlobalHeader
        title="Events"
        rightAction={{
          icon: 'add-circle',
          onPress: () => router.push('/events/create'),
        }}
      />
      
      <Animated.View 
        style={[
          styles.searchBarContainer,
          { opacity: headerOpacity }
        ]}
      >
        <BlurView intensity={50} tint="dark" style={styles.blurView}>
          <View style={styles.searchBar}>
            <Ionicons name="search" size={20} color="#8E8E93" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search events..."
              placeholderTextColor="#8E8E93"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Ionicons name="close-circle" size={20} color="#8E8E93" />
              </TouchableOpacity>
            )}
          </View>
        </BlurView>
      </Animated.View>
      
      <FlatList
        data={events}
        renderItem={renderEventCard}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.eventsList}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filtersContainer}
          >
            {filters.map(filter => (
              <TouchableOpacity
                key={filter.id}
                style={[
                  styles.filterPill,
                  activeFilter === filter.id && styles.filterPillActive
                ]}
                onPress={() => handleFilterPress(filter.id)}
                activeOpacity={0.8}
              >
                <Ionicons 
                  name={filter.icon as any} 
                  size={16} 
                  color={activeFilter === filter.id ? '#FFFFFF' : '#A0A0A0'} 
                />
                <Text 
                  style={[
                    styles.filterText,
                    activeFilter === filter.id && styles.filterTextActive
                  ]}
                >
                  {filter.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        }
        onScroll={handleScroll}
        scrollEventThrottle={16}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="calendar-outline" size={60} color="#8E8E93" />
            <Text style={styles.emptyStateTitle}>No events found</Text>
            <Text style={styles.emptyStateMessage}>
              Try changing your search or filter settings
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  searchBarContainer: {
    backgroundColor: 'rgba(18, 18, 18, 0.7)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(60, 60, 67, 0.29)',
  },
  blurView: {
    overflow: 'hidden',
    borderRadius: 12,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(30, 30, 30, 0.8)',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  searchInput: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 16,
    marginLeft: 8,
    padding: 0,
  },
  filtersContainer: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 12,
  },
  filterPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(60, 60, 67, 0.18)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
  },
  filterPillActive: {
    backgroundColor: '#0A84FF',
  },
  filterText: {
    color: '#A0A0A0',
    marginLeft: 6,
    fontSize: 14,
    fontWeight: '500',
  },
  filterTextActive: {
    color: '#FFFFFF',
  },
  eventsList: {
    paddingBottom: 24,
  },
  eventCard: {
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 16,
    overflow: 'hidden',
    height: 220,
    backgroundColor: '#1C1C1E',
  },
  eventImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  eventDetails: {
    flex: 1,
    padding: 16,
    justifyContent: 'flex-end',
  },
  eventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  eventType: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  eventTypeText: {
    color: '#FFFFFF',
    fontSize: 12,
    marginLeft: 4,
    fontWeight: '500',
  },
  pricePill: {
    backgroundColor: 'rgba(10, 132, 255, 0.8)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  freePricePill: {
    backgroundColor: 'rgba(48, 209, 88, 0.8)',
  },
  priceText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  eventTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  eventDateTime: {
    color: '#CCCCCC',
    fontSize: 14,
    marginBottom: 12,
  },
  hostContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  hostAvatar: {
    width: 20,
    height: 20,
    borderRadius: 10,
    marginRight: 6,
  },
  hostName: {
    color: '#CCCCCC',
    fontSize: 14,
  },
  verifiedIcon: {
    marginLeft: 4,
  },
  capacityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  capacityBar: {
    flex: 1,
    height: 4,
    backgroundColor: 'rgba(120, 120, 128, 0.2)',
    borderRadius: 2,
    marginRight: 8,
    overflow: 'hidden',
  },
  capacityFill: {
    height: '100%',
    backgroundColor: '#0A84FF',
    borderRadius: 2,
  },
  capacityText: {
    color: '#CCCCCC',
    fontSize: 12,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 60,
  },
  emptyStateTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
  },
  emptyStateMessage: {
    color: '#8E8E93',
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
    paddingHorizontal: 32,
  },
}); 