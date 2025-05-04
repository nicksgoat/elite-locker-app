import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Dimensions,
  StatusBar,
  Animated,
  Alert,
  Linking,
  Platform,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { SafeAreaView } from 'react-native-safe-area-context';
import GlobalHeader from '../../../components/ui/GlobalHeader';
import EventBookingModal from '../../../components/ui/EventBookingModal';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';

// Types
interface EventTier {
  id: string;
  name: string;
  price: number;
  capacity: number | null;
  sold: number;
}

interface EventLocation {
  name: string;
  address: string;
  latitude: number;
  longitude: number;
}

interface Event {
  id: string;
  clubId: string | null;
  hostId: string;
  title: string;
  description: string;
  bannerUrl: string;
  eventType: 'in_person' | 'virtual' | 'hybrid';
  location: EventLocation | null;
  startTime: string;
  endTime: string;
  capacity: number | null;
  hostName: string;
  hostAvatar: string;
  isVerified: boolean;
  tiers: EventTier[];
  attendees?: {
    id: string;
    name: string;
    avatar: string;
  }[];
}

// Mock events data - in a real app, this would come from an API
const mockEvents: Record<string, Event> = {
  'e1': {
    id: 'e1',
    clubId: 'c1',
    hostId: 'h1',
    title: 'Speed & Agility Fundamentals',
    description: 'Master the basics of speed and agility with this comprehensive workshop. Learn proper form, technique, and drills to enhance your athletic performance.\n\nThis workshop is designed for athletes of all levels who want to improve their speed, agility, and overall movement efficiency. Coach Mike will break down the fundamental mechanics of acceleration, deceleration, and change of direction.\n\nTopics covered:\n• Proper warm-up routines\n• Sprint mechanics and technique\n• Agility drills and progressions\n• Recovery strategies\n• Performance assessment',
    bannerUrl: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&auto=format&fit=crop',
    eventType: 'hybrid',
    location: {
      name: 'Elite Training Center', 
      address: '123 Fitness Blvd, Los Angeles, CA 90210',
      latitude: 34.0522,
      longitude: -118.2437
    },
    startTime: '2025-06-15T18:00:00',
    endTime: '2025-06-15T20:00:00',
    capacity: 30,
    hostName: 'Coach Mike Johnson',
    hostAvatar: 'https://i.pravatar.cc/150?img=1',
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
    ],
    attendees: [
      { id: 'u1', name: 'Alex Johnson', avatar: 'https://i.pravatar.cc/150?img=11' },
      { id: 'u2', name: 'Sarah Miller', avatar: 'https://i.pravatar.cc/150?img=5' },
      { id: 'u3', name: 'James Wilson', avatar: 'https://i.pravatar.cc/150?img=12' },
      { id: 'u4', name: 'Emma Davis', avatar: 'https://i.pravatar.cc/150?img=23' },
      { id: 'u5', name: 'Michael Brown', avatar: 'https://i.pravatar.cc/150?img=15' },
      { id: 'u6', name: 'Jessica Taylor', avatar: 'https://i.pravatar.cc/150?img=25' },
      { id: 'u7', name: 'David Clark', avatar: 'https://i.pravatar.cc/150?img=13' },
      { id: 'u8', name: 'Lisa White', avatar: 'https://i.pravatar.cc/150?img=32' },
      { id: 'u9', name: 'Robert Smith', avatar: 'https://i.pravatar.cc/150?img=17' },
      { id: 'u10', name: 'Jennifer Lee', avatar: 'https://i.pravatar.cc/150?img=29' },
      { id: 'u11', name: 'Andrew Moore', avatar: 'https://i.pravatar.cc/150?img=19' },
      { id: 'u12', name: 'Olivia Adams', avatar: 'https://i.pravatar.cc/150?img=31' },
    ]
  },
  'e2': {
    id: 'e2',
    clubId: 'c2',
    hostId: 'h2',
    title: 'Recovery & Mobility Workshop',
    description: 'Learn essential recovery techniques to optimize your performance and prevent injuries. This session is perfect for athletes who want to improve their recovery protocols and mobility work.',
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
    ],
    attendees: [
      { id: 'u1', name: 'Alex Johnson', avatar: 'https://i.pravatar.cc/150?img=11' },
      { id: 'u2', name: 'Sarah Miller', avatar: 'https://i.pravatar.cc/150?img=5' },
      { id: 'u3', name: 'James Wilson', avatar: 'https://i.pravatar.cc/150?img=12' },
      { id: 'u4', name: 'Emma Davis', avatar: 'https://i.pravatar.cc/150?img=23' },
    ]
  },
  'e3': {
    id: 'e3',
    clubId: 'c1',
    hostId: 'h1',
    title: 'Recovery & Mobility Session',
    description: 'Focus on recovery techniques and mobility work to improve performance and reduce injury risk. This session includes foam rolling, dynamic stretching, and targeted mobility exercises for athletes.',
    bannerUrl: 'https://images.unsplash.com/photo-1603287681836-b174ce5074c2?w=800&auto=format&fit=crop',
    eventType: 'virtual',
    location: null,
    startTime: '2025-05-20T09:00:00',
    endTime: '2025-05-20T09:45:00',
    capacity: 40,
    hostName: 'Coach Mike Johnson',
    hostAvatar: 'https://i.pravatar.cc/150?img=1',
    isVerified: true,
    tiers: [
      {
        id: 't4',
        name: 'Member',
        price: 0,
        capacity: 40,
        sold: 18
      }
    ],
    attendees: [
      { id: 'u5', name: 'Michael Brown', avatar: 'https://i.pravatar.cc/150?img=15' },
      { id: 'u6', name: 'Jessica Taylor', avatar: 'https://i.pravatar.cc/150?img=25' },
      { id: 'u7', name: 'David Clark', avatar: 'https://i.pravatar.cc/150?img=13' },
      { id: 'u8', name: 'Lisa White', avatar: 'https://i.pravatar.cc/150?img=32' },
    ]
  },
  'e4': {
    id: 'e4',
    clubId: 'c1',
    hostId: 'h1',
    title: 'Sprint Mechanics Workshop',
    description: 'Detailed breakdown of sprint mechanics with video analysis and personalized feedback. Improve your running form and efficiency with expert coaching.',
    bannerUrl: 'https://images.unsplash.com/photo-1541252260730-0412e8e2108e?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
    eventType: 'in_person',
    location: {
      name: 'City Sports Field',
      address: '456 Stadium Way, New York, NY 10001',
      latitude: 40.7128,
      longitude: -74.0060
    },
    startTime: '2025-05-25T16:00:00',
    endTime: '2025-05-25T18:00:00',
    capacity: 15,
    hostName: 'Coach Mike Johnson',
    hostAvatar: 'https://i.pravatar.cc/150?img=1',
    isVerified: true,
    tiers: [
      {
        id: 't5',
        name: 'Standard',
        price: 79.99,
        capacity: 10,
        sold: 5
      },
      {
        id: 't6',
        name: 'Premium',
        price: 99.99,
        capacity: 5,
        sold: 3
      }
    ],
    attendees: [
      { id: 'u9', name: 'Robert Smith', avatar: 'https://i.pravatar.cc/150?img=17' },
      { id: 'u10', name: 'Jennifer Lee', avatar: 'https://i.pravatar.cc/150?img=29' },
      { id: 'u11', name: 'Andrew Moore', avatar: 'https://i.pravatar.cc/150?img=19' },
      { id: 'u12', name: 'Olivia Adams', avatar: 'https://i.pravatar.cc/150?img=31' },
    ]
  }
};

const { width } = Dimensions.get('window');

export default function EventDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [selectedTier, setSelectedTier] = useState<string | null>(null);
  const [scrollY] = useState(new Animated.Value(0));
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [bookingComplete, setBookingComplete] = useState(false);
  const [mapLoaded, setMapLoaded] = useState(true);
  
  // In a real app, we'd fetch the event data based on the ID
  const event = mockEvents[id as string];
  
  if (!event) {
    return (
      <SafeAreaView style={styles.container}>
        <GlobalHeader title="Event Details" showBackButton={true} />
        <View style={styles.notFoundContainer}>
          <Ionicons name="calendar-outline" size={60} color="#8E8E93" />
          <Text style={styles.notFoundTitle}>Event not found</Text>
          <Text style={styles.notFoundMessage}>The event you're looking for doesn't exist or has been removed.</Text>
          <TouchableOpacity 
            style={styles.notFoundButton}
            onPress={() => router.back()}
          >
            <Text style={styles.notFoundButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }
  
  const handleScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
    { useNativeDriver: false }
  );
  
  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 150, 300],
    outputRange: [0, 0.5, 1],
    extrapolate: 'clamp',
  });
  
  const handleTierSelect = (tierId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedTier(tierId);
  };
  
  const handleBookEvent = () => {
    if (!selectedTier) {
      Alert.alert('Select a ticket tier', 'Please select a ticket tier to continue.');
      return;
    }
    
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setShowBookingModal(true);
  };
  
  const handleBookingClose = () => {
    setShowBookingModal(false);
  };
  
  const handleBookingComplete = () => {
    setShowBookingModal(false);
    setBookingComplete(true);
    
    // Show a confirmation after modal closes
    setTimeout(() => {
      Alert.alert(
        'Booking Confirmed',
        'Your spot has been reserved! Check your email for details.',
        [
          { 
            text: 'View My Bookings', 
            onPress: () => router.push('/events/bookings')
          },
          {
            text: 'OK',
            style: 'cancel'
          }
        ]
      );
    }, 500);
  };
  
  // Function to open maps app with directions
  const handleOpenMaps = (location: EventLocation) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    const scheme = Platform.select({ ios: 'maps:', android: 'geo:' });
    const latLng = `${location.latitude},${location.longitude}`;
    const label = location.name;
    const url = Platform.select({
      ios: `${scheme}ll=${latLng}&q=${label}`,
      android: `${scheme}0,0?q=${latLng}(${label})`
    });
    
    if (url) {
      Linking.openURL(url).catch(err => {
        Alert.alert('Error', 'Could not open maps application');
        console.error('Error opening maps:', err);
      });
    }
  };
  
  const formatEventDate = (startTime: string, endTime: string) => {
    const start = new Date(startTime);
    const end = new Date(endTime);
    
    const date = start.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric'
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
    
    return { date, time: `${startTimeStr} - ${endTimeStr}` };
  };
  
  const getEventTypeIcon = (type: string) => {
    switch (type) {
      case 'in_person': return 'location';
      case 'virtual': return 'videocam';
      case 'hybrid': return 'globe';
      default: return 'calendar';
    }
  };
  
  const { date, time } = formatEventDate(event.startTime, event.endTime);
  const eventTypeIcon = getEventTypeIcon(event.eventType);
  
  // Calculate remaining spots
  const totalCapacity = event.capacity || 0;
  const totalSold = event.tiers.reduce((sum, tier) => sum + tier.sold, 0);
  const remainingSpots = totalCapacity ? totalCapacity - totalSold : null;
  
  // Try to load map with error handling
  useEffect(() => {
    try {
      // Check if MapView is available
      if (MapView) {
        setMapLoaded(true);
      }
    } catch (error) {
      console.error('Error loading map:', error);
      setMapLoaded(false);
    }
  }, []);
  
  // Render map or fallback
  const renderLocationMap = () => {
    if (!event.location) return null;

    if (!mapLoaded) {
      return (
        <View style={styles.mapErrorContainer}>
          <Ionicons name="map-outline" size={28} color="#8E8E93" />
          <Text style={styles.mapErrorText}>
            Map cannot be displayed. Get directions below.
          </Text>
          <TouchableOpacity 
            style={styles.directionsButton}
            onPress={() => handleOpenMaps(event.location!)}
          >
            <Ionicons name="navigate" size={16} color="#FFFFFF" />
            <Text style={styles.directionsButtonText}>Get Directions</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <View style={styles.mapContainer}>
        <MapView
          style={styles.map}
          provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
          region={{
            latitude: event.location.latitude,
            longitude: event.location.longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          }}
          customMapStyle={darkMapStyle}
        >
          <Marker
            coordinate={{
              latitude: event.location.latitude,
              longitude: event.location.longitude,
            }}
            title={event.location.name}
          />
        </MapView>
        
        <TouchableOpacity 
          style={styles.directionsButton}
          onPress={() => handleOpenMaps(event.location!)}
        >
          <Ionicons name="navigate" size={16} color="#FFFFFF" />
          <Text style={styles.directionsButtonText}>Get Directions</Text>
        </TouchableOpacity>
      </View>
    );
  };
  
  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <StatusBar barStyle="light-content" />
      
      {/* Transparent header that becomes opaque on scroll */}
      <Animated.View 
        style={[
          styles.animatedHeader,
          { opacity: headerOpacity }
        ]}
      >
        <BlurView intensity={80} tint="dark" style={styles.headerBlur}>
          <Text style={styles.headerTitle} numberOfLines={1}>{event.title}</Text>
        </BlurView>
      </Animated.View>
      
      <GlobalHeader
        title=""
        showBackButton={true}
        transparent={true}
        rightAction={{
          icon: 'share-outline',
          onPress: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light),
        }}
      />
      
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        {/* Event Banner */}
        <View style={styles.bannerContainer}>
          <Image source={{ uri: event.bannerUrl }} style={styles.bannerImage} />
          <View style={styles.bannerOverlay} />
          
          <View style={styles.eventTypeContainer}>
            <View style={styles.eventType}>
              <Ionicons name={eventTypeIcon as any} size={14} color="#FFFFFF" />
              <Text style={styles.eventTypeText}>
                {event.eventType.charAt(0).toUpperCase() + event.eventType.slice(1)}
              </Text>
            </View>
          </View>
        </View>
        
        <View style={styles.contentContainer}>
          {/* Event Title and Host */}
          <Text style={styles.eventTitle}>{event.title}</Text>
          
          <View style={styles.hostContainer}>
            <Image source={{ uri: event.hostAvatar }} style={styles.hostAvatar} />
            <View style={styles.hostInfo}>
              <View style={styles.hostNameRow}>
                <Text style={styles.hostName}>{event.hostName}</Text>
                {event.isVerified && (
                  <Ionicons name="checkmark-circle" size={16} color="#0A84FF" />
                )}
              </View>
              <Text style={styles.hostRole}>Event Host</Text>
            </View>
          </View>
          
          {/* Event Details */}
          <View style={styles.detailsCard}>
            <View style={styles.detailRow}>
              <Ionicons name="calendar-outline" size={20} color="#CCCCCC" />
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>Date</Text>
                <Text style={styles.detailText}>{date}</Text>
              </View>
            </View>
            
            <View style={styles.detailRow}>
              <Ionicons name="time-outline" size={20} color="#CCCCCC" />
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>Time</Text>
                <Text style={styles.detailText}>{time}</Text>
              </View>
            </View>
            
            {event.location && (
              <View style={styles.detailRow}>
                <Ionicons name="location-outline" size={20} color="#CCCCCC" />
                <View style={styles.detailContent}>
                  <Text style={styles.detailLabel}>Location</Text>
                  <Text style={styles.detailText}>{event.location.name}</Text>
                  <Text style={styles.locationAddress}>{event.location.address}</Text>
                  
                  {renderLocationMap()}
                </View>
              </View>
            )}
            
            {remainingSpots !== null && (
              <View style={styles.detailRow}>
                <Ionicons name="people-outline" size={20} color="#CCCCCC" />
                <View style={styles.detailContent}>
                  <Text style={styles.detailLabel}>Capacity</Text>
                  <Text style={styles.detailText}>
                    {totalSold} / {totalCapacity} registered
                  </Text>
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
                </View>
              </View>
            )}
          </View>
          
          {/* Description */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>About This Event</Text>
            <Text style={styles.description}>{event.description}</Text>
          </View>
          
          {/* Attendees */}
          {event.attendees && event.attendees.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Attendees</Text>
                <Text style={styles.sectionSubtitle}>{totalSold} registered</Text>
              </View>
              
              <View style={styles.attendeesGrid}>
                {event.attendees.slice(0, 12).map(attendee => (
                  <View key={attendee.id} style={styles.attendeeItem}>
                    <Image source={{ uri: attendee.avatar }} style={styles.attendeeAvatar} />
                    <Text style={styles.attendeeName} numberOfLines={1}>{attendee.name}</Text>
                  </View>
                ))}
                {totalSold > 12 && (
                  <View style={styles.moreAttendeesContainer}>
                    <Text style={styles.moreAttendeesText}>+{totalSold - 12} more</Text>
                  </View>
                )}
              </View>
            </View>
          )}
          
          {/* Ticket Tiers */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Select a Ticket</Text>
            
            {event.tiers.map(tier => {
              const isSelected = selectedTier === tier.id;
              const isSoldOut = tier.capacity !== null && tier.sold >= tier.capacity;
              
              return (
                <TouchableOpacity
                  key={tier.id}
                  style={[
                    styles.tierCard,
                    isSelected && styles.tierCardSelected,
                    isSoldOut && styles.tierCardDisabled
                  ]}
                  onPress={() => !isSoldOut && handleTierSelect(tier.id)}
                  activeOpacity={isSoldOut ? 1 : 0.7}
                  disabled={isSoldOut}
                >
                  <View style={styles.tierInfo}>
                    <Text style={styles.tierName}>{tier.name}</Text>
                    {tier.capacity !== null && (
                      <Text style={styles.tierAvailability}>
                        {isSoldOut ? 'Sold Out' : `${tier.capacity - tier.sold} available`}
                      </Text>
                    )}
                  </View>
                  
                  <View style={styles.tierPrice}>
                    <Text style={styles.tierPriceText}>
                      {tier.price === 0 ? 'Free' : `$${tier.price.toFixed(2)}`}
                    </Text>
                    {isSelected && (
                      <Ionicons name="checkmark-circle" size={20} color="#0A84FF" />
                    )}
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </ScrollView>
      
      {/* Bottom booking bar */}
      <BlurView intensity={80} tint="dark" style={styles.bottomBar}>
        <TouchableOpacity
          style={[
            styles.bookButton,
            !selectedTier && styles.bookButtonDisabled
          ]}
          onPress={handleBookEvent}
          activeOpacity={0.7}
          disabled={!selectedTier || bookingComplete}
        >
          <Text style={styles.bookButtonText}>
            {bookingComplete 
              ? 'Booked' 
              : selectedTier 
                ? `Book ${event.tiers.find(t => t.id === selectedTier)?.price === 0 
                    ? 'Free Spot' 
                    : `for $${event.tiers.find(t => t.id === selectedTier)?.price.toFixed(2)}`}`
                : 'Select a Ticket'}
          </Text>
        </TouchableOpacity>
      </BlurView>
      
      {/* Event Booking Modal */}
      {selectedTier && (
        <EventBookingModal
          visible={showBookingModal}
          onClose={handleBookingClose}
          onComplete={handleBookingComplete}
          event={{
            id: event.id,
            title: event.title,
            startTime: event.startTime,
            endTime: event.endTime,
            location: event.location,
            eventType: event.eventType,
          }}
          selectedTier={{
            id: selectedTier,
            name: event.tiers.find(t => t.id === selectedTier)?.name || '',
            price: event.tiers.find(t => t.id === selectedTier)?.price || 0,
          }}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  scrollView: {
    flex: 1,
  },
  animatedHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    height: 100,
    paddingTop: 44,
  },
  headerBlur: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingBottom: 10,
    paddingHorizontal: 50,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
  bannerContainer: {
    height: 240,
    width: '100%',
    position: 'relative',
  },
  bannerImage: {
    height: '100%',
    width: '100%',
    position: 'absolute',
  },
  bannerOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  eventTypeContainer: {
    position: 'absolute',
    top: 16,
    right: 16,
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
  contentContainer: {
    padding: 20,
  },
  eventTitle: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 16,
  },
  hostContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  hostAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  hostInfo: {
    flex: 1,
  },
  hostNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  hostName: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
    marginRight: 4,
  },
  hostRole: {
    color: '#AAAAAA',
    fontSize: 14,
  },
  detailsCard: {
    backgroundColor: 'rgba(30, 30, 30, 0.6)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
  },
  detailRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  detailContent: {
    marginLeft: 12,
    flex: 1,
  },
  detailLabel: {
    color: '#AAAAAA',
    fontSize: 14,
    marginBottom: 2,
  },
  detailText: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  locationAddress: {
    color: '#AAAAAA',
    fontSize: 14,
    marginTop: 2,
  },
  mapContainer: {
    marginTop: 12,
    borderRadius: 12,
    overflow: 'hidden',
    height: 180,
  },
  map: {
    width: '100%',
    height: '100%',
  },
  directionsButton: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(10, 132, 255, 0.8)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  directionsButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  capacityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
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
    color: '#AAAAAA',
    fontSize: 12,
    width: 100,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  sectionSubtitle: {
    color: '#AAAAAA',
    fontSize: 14,
  },
  description: {
    color: '#DDDDDD',
    fontSize: 16,
    lineHeight: 24,
  },
  attendeesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
  },
  attendeeItem: {
    width: '25%',
    padding: 4,
    alignItems: 'center',
    marginBottom: 16,
  },
  attendeeAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginBottom: 4,
  },
  attendeeName: {
    color: '#CCCCCC',
    fontSize: 12,
    textAlign: 'center',
  },
  moreAttendeesContainer: {
    width: '25%',
    padding: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  moreAttendeesText: {
    color: '#0A84FF',
    fontSize: 14,
    fontWeight: '500',
  },
  tierCard: {
    backgroundColor: 'rgba(30, 30, 30, 0.6)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  tierCardSelected: {
    borderColor: '#0A84FF',
  },
  tierCardDisabled: {
    opacity: 0.5,
  },
  tierInfo: {
    flex: 1,
  },
  tierName: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  tierAvailability: {
    color: '#AAAAAA',
    fontSize: 14,
  },
  tierPrice: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tierPriceText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    marginRight: 8,
  },
  bottomBar: {
    backgroundColor: 'rgba(18, 18, 18, 0.7)',
    borderTopWidth: 0.5,
    borderTopColor: 'rgba(60, 60, 67, 0.29)',
    padding: 16,
  },
  bookButton: {
    backgroundColor: '#0A84FF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bookButtonDisabled: {
    backgroundColor: '#454545',
  },
  bookButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  notFoundContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  notFoundTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '600',
    marginTop: 16,
  },
  notFoundMessage: {
    color: '#AAAAAA',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 24,
  },
  notFoundButton: {
    backgroundColor: '#0A84FF',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
  },
  notFoundButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
  mapErrorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  mapErrorText: {
    color: '#FFFFFF',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 24,
  },
});

// Dark mode map style
const darkMapStyle = [
  {
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#212121"
      }
    ]
  },
  {
    "elementType": "labels.icon",
    "stylers": [
      {
        "visibility": "off"
      }
    ]
  },
  {
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#757575"
      }
    ]
  },
  {
    "elementType": "labels.text.stroke",
    "stylers": [
      {
        "color": "#212121"
      }
    ]
  },
  {
    "featureType": "administrative",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#757575"
      }
    ]
  },
  {
    "featureType": "administrative.country",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#9e9e9e"
      }
    ]
  },
  {
    "featureType": "administrative.land_parcel",
    "stylers": [
      {
        "visibility": "off"
      }
    ]
  },
  {
    "featureType": "administrative.locality",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#bdbdbd"
      }
    ]
  },
  {
    "featureType": "poi",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#757575"
      }
    ]
  },
  {
    "featureType": "poi.park",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#181818"
      }
    ]
  },
  {
    "featureType": "poi.park",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#616161"
      }
    ]
  },
  {
    "featureType": "poi.park",
    "elementType": "labels.text.stroke",
    "stylers": [
      {
        "color": "#1b1b1b"
      }
    ]
  },
  {
    "featureType": "road",
    "elementType": "geometry.fill",
    "stylers": [
      {
        "color": "#2c2c2c"
      }
    ]
  },
  {
    "featureType": "road",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#8a8a8a"
      }
    ]
  },
  {
    "featureType": "road.arterial",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#373737"
      }
    ]
  },
  {
    "featureType": "road.highway",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#3c3c3c"
      }
    ]
  },
  {
    "featureType": "road.highway.controlled_access",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#4e4e4e"
      }
    ]
  },
  {
    "featureType": "road.local",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#616161"
      }
    ]
  },
  {
    "featureType": "transit",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#757575"
      }
    ]
  },
  {
    "featureType": "water",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#000000"
      }
    ]
  },
  {
    "featureType": "water",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#3d3d3d"
      }
    ]
  }
]; 