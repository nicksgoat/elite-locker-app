import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  FlatList,
  Image,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import GlobalHeader from '../../components/ui/GlobalHeader';

// Booking interface
interface Booking {
  id: string;
  eventId: string;
  title: string;
  bannerUrl: string;
  date: string;
  time: string;
  location: string | null;
  eventType: 'in_person' | 'virtual' | 'hybrid';
  ticketTier: string;
  ticketPrice: number;
  status: 'upcoming' | 'past' | 'cancelled';
  joinUrl?: string;
}

// Mock bookings data
const mockBookings: Booking[] = [
  {
    id: 'b1',
    eventId: 'e1',
    title: 'Speed & Agility Fundamentals',
    bannerUrl: 'https://pbs.twimg.com/profile_banners/372145971/1465540138/1500x500',
    date: 'Jun 15, 2025',
    time: '6:00 PM - 8:00 PM',
    location: 'Elite Training Center & Virtual',
    eventType: 'hybrid',
    ticketTier: 'Early Bird',
    ticketPrice: 49.99,
    status: 'upcoming',
    joinUrl: 'https://zoom.us/j/123456789',
  },
  {
    id: 'b2',
    eventId: 'e2',
    title: 'Recovery & Mobility Workshop',
    bannerUrl: 'https://images.unsplash.com/photo-1603287681836-b174ce5074c2?w=800&auto=format&fit=crop',
    date: 'Jun 20, 2025',
    time: '5:30 PM - 7:00 PM',
    location: null,
    eventType: 'virtual',
    ticketTier: 'Member',
    ticketPrice: 0,
    status: 'upcoming',
    joinUrl: 'https://zoom.us/j/987654321',
  },
  {
    id: 'b3',
    eventId: 'e3',
    title: 'Strength Training Masterclass',
    bannerUrl: 'https://images.unsplash.com/photo-1535743686920-55e4145369b9?w=800&auto=format&fit=crop',
    date: 'Jun 25, 2025',
    time: '9:00 AM - 12:00 PM',
    location: 'PowerFit Gym, 123 Main St',
    eventType: 'in_person',
    ticketTier: 'Club Member',
    ticketPrice: 39.99,
    status: 'upcoming',
  },
  {
    id: 'b4',
    eventId: 'e4',
    title: 'Nutrition for Athletes Q&A',
    bannerUrl: 'https://images.unsplash.com/photo-1606757389667-45c2024f9fa4?w=800&auto=format&fit=crop',
    date: 'May 15, 2025',
    time: '7:00 PM - 8:30 PM',
    location: null,
    eventType: 'virtual',
    ticketTier: 'Standard',
    ticketPrice: 19.99,
    status: 'past',
    joinUrl: 'https://zoom.us/j/555555555',
  },
  {
    id: 'b5',
    eventId: 'e5',
    title: 'Form Technique Workshop',
    bannerUrl: 'https://images.unsplash.com/photo-1529516548873-9ce57c8f155e?w=800&auto=format&fit=crop',
    date: 'May 5, 2025',
    time: '6:30 PM - 8:00 PM',
    location: 'The Fitness Studio, 456 Oak Ave',
    eventType: 'in_person',
    ticketTier: 'Standard',
    ticketPrice: 59.99,
    status: 'cancelled',
  },
];

export default function BookingsScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming');
  
  const handleTabPress = (tab: 'upcoming' | 'past') => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setActiveTab(tab);
  };
  
  const handleEventPress = (eventId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push(`/events/detail/${eventId}`);
  };
  
  const handleJoinEvent = (joinUrl: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    // In a real app, we'd open the URL or integrate with a video conferencing platform
    console.log('Joining event:', joinUrl);
  };
  
  const getEventTypeIcon = (type: string) => {
    switch (type) {
      case 'in_person': return 'location';
      case 'virtual': return 'videocam';
      case 'hybrid': return 'globe';
      default: return 'calendar';
    }
  };
  
  const filteredBookings = mockBookings.filter(
    booking => 
      activeTab === 'upcoming' 
        ? (booking.status === 'upcoming')
        : (booking.status === 'past' || booking.status === 'cancelled')
  );
  
  const renderBookingCard = ({ item }: { item: Booking }) => {
    const eventTypeIcon = getEventTypeIcon(item.eventType);
    const isPastOrCancelled = item.status === 'past' || item.status === 'cancelled';
    const isJoinable = item.eventType !== 'in_person' && 
                      item.status === 'upcoming' && 
                      item.joinUrl;
    
    return (
      <TouchableOpacity
        style={[
          styles.bookingCard, 
          isPastOrCancelled && styles.pastBookingCard
        ]}
        onPress={() => handleEventPress(item.eventId)}
        activeOpacity={0.9}
      >
        <Image source={{ uri: item.bannerUrl }} style={styles.eventImage} />
        <View style={styles.cardContent}>
          <View style={styles.statusContainer}>
            <View style={[
              styles.statusBadge,
              item.status === 'upcoming' && styles.upcomingBadge,
              item.status === 'past' && styles.pastBadge,
              item.status === 'cancelled' && styles.cancelledBadge,
            ]}>
              <Text style={styles.statusText}>
                {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
              </Text>
            </View>
            
            <Text style={styles.ticketTier}>{item.ticketTier}</Text>
          </View>
          
          <Text style={styles.eventTitle} numberOfLines={2}>{item.title}</Text>
          
          <View style={styles.eventDetails}>
            <View style={styles.detailRow}>
              <Ionicons name="calendar-outline" size={16} color="#AAAAAA" />
              <Text style={styles.detailText}>{item.date}</Text>
            </View>
            
            <View style={styles.detailRow}>
              <Ionicons name="time-outline" size={16} color="#AAAAAA" />
              <Text style={styles.detailText}>{item.time}</Text>
            </View>
            
            <View style={styles.detailRow}>
              <Ionicons name={eventTypeIcon as any} size={16} color="#AAAAAA" />
              <Text style={styles.detailText}>
                {item.location || 'Virtual Event'}
              </Text>
            </View>
          </View>
          
          {isJoinable && (
            <TouchableOpacity
              style={styles.joinButton}
              onPress={() => item.joinUrl && handleJoinEvent(item.joinUrl)}
            >
              <Ionicons name="videocam" size={16} color="#FFFFFF" />
              <Text style={styles.joinButtonText}>Join Event</Text>
            </TouchableOpacity>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <StatusBar barStyle="light-content" />
      
      <GlobalHeader
        title="My Bookings"
        showBackButton={true}
      />
      
      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[
            styles.tabButton,
            activeTab === 'upcoming' && styles.activeTabButton
          ]}
          onPress={() => handleTabPress('upcoming')}
        >
          <Text style={[
            styles.tabText,
            activeTab === 'upcoming' && styles.activeTabText
          ]}>
            Upcoming
          </Text>
          {activeTab === 'upcoming' && <View style={styles.activeTabIndicator} />}
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.tabButton,
            activeTab === 'past' && styles.activeTabButton
          ]}
          onPress={() => handleTabPress('past')}
        >
          <Text style={[
            styles.tabText,
            activeTab === 'past' && styles.activeTabText
          ]}>
            Past & Cancelled
          </Text>
          {activeTab === 'past' && <View style={styles.activeTabIndicator} />}
        </TouchableOpacity>
      </View>
      
      <FlatList
        data={filteredBookings}
        renderItem={renderBookingCard}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.bookingsList}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="ticket-outline" size={60} color="#8E8E93" />
            <Text style={styles.emptyStateTitle}>No bookings found</Text>
            <Text style={styles.emptyStateMessage}>
              {activeTab === 'upcoming' 
                ? 'You don\'t have any upcoming events. Browse events to book your spot!'
                : 'You don\'t have any past events.'
              }
            </Text>
            {activeTab === 'upcoming' && (
              <TouchableOpacity 
                style={styles.emptyStateButton}
                onPress={() => router.push('/events')}
              >
                <Text style={styles.emptyStateButtonText}>Browse Events</Text>
              </TouchableOpacity>
            )}
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
  tabsContainer: {
    flexDirection: 'row',
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(60, 60, 67, 0.29)',
  },
  tabButton: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
    position: 'relative',
  },
  activeTabButton: {
    backgroundColor: 'rgba(60, 60, 67, 0.07)',
  },
  tabText: {
    color: '#8E8E93',
    fontSize: 16,
    fontWeight: '500',
  },
  activeTabText: {
    color: '#0A84FF',
  },
  activeTabIndicator: {
    position: 'absolute',
    bottom: 0,
    width: 60,
    height: 3,
    backgroundColor: '#0A84FF',
    borderTopLeftRadius: 3,
    borderTopRightRadius: 3,
  },
  bookingsList: {
    padding: 16,
  },
  bookingCard: {
    backgroundColor: 'rgba(30, 30, 30, 0.6)',
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  pastBookingCard: {
    opacity: 0.7,
  },
  eventImage: {
    width: '100%',
    height: 120,
    resizeMode: 'cover',
  },
  cardContent: {
    padding: 16,
  },
  statusContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  upcomingBadge: {
    backgroundColor: 'rgba(48, 209, 88, 0.2)',
  },
  pastBadge: {
    backgroundColor: 'rgba(142, 142, 147, 0.2)',
  },
  cancelledBadge: {
    backgroundColor: 'rgba(255, 69, 58, 0.2)',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  ticketTier: {
    fontSize: 12,
    color: '#8E8E93',
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  eventDetails: {
    gap: 6,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailText: {
    color: '#CCCCCC',
    fontSize: 14,
  },
  joinButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0A84FF',
    paddingVertical: 10,
    borderRadius: 12,
    marginTop: 16,
    gap: 8,
  },
  joinButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
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
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 24,
  },
  emptyStateButton: {
    backgroundColor: '#0A84FF',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
  },
  emptyStateButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
}); 