import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Alert,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { Image } from 'expo-image';

const { width: screenWidth } = Dimensions.get('window');

interface Session {
  id: string;
  title: string;
  description?: string;
  dateTime: string;
  location: string;
  attendeeCount: number;
  host: {
    name: string;
    avatar?: string;
  };
  isAttending?: boolean;
  isOnline: boolean;
  meetingUrl?: string;
  category?: 'workout' | 'workshop' | 'competition' | 'social';
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  isPaid?: boolean;
  price?: number;
}

interface SessionsTabProps {
  sessions: Session[];
  onSessionPress: (sessionId: string) => void;
}

const SessionsTab: React.FC<SessionsTabProps> = ({ sessions, onSessionPress }) => {
  const [activeFilter, setActiveFilter] = useState<'all' | 'upcoming' | 'live' | 'past'>('upcoming');
  const [activeCategory, setActiveCategory] = useState<'all' | 'workout' | 'workshop' | 'competition' | 'social'>('all');

  // Enhanced mock sessions with categories
  const enhancedSessions: Session[] = sessions.map((session, index) => ({
    ...session,
    category: (['workout', 'workshop', 'competition', 'social'] as const)[index % 4],
    difficulty: (['beginner', 'intermediate', 'advanced'] as const)[index % 3],
    isPaid: index % 3 === 0,
    price: index % 3 === 0 ? Math.floor(Math.random() * 50) + 10 : 0,
  }));

  const filterSessions = () => {
    let filtered = enhancedSessions;

    // Filter by category
    if (activeCategory !== 'all') {
      filtered = filtered.filter(session => session.category === activeCategory);
    }

    // Filter by time
    const now = new Date();
    filtered = filtered.filter(session => {
      const sessionDate = new Date(session.dateTime);
      
      switch (activeFilter) {
        case 'upcoming':
          return sessionDate > now;
        case 'live':
          // Sessions happening in the next 30 minutes
          const diffMs = sessionDate.getTime() - now.getTime();
          const diffMinutes = diffMs / 1000 / 60;
          return diffMinutes >= -15 && diffMinutes <= 30;
        case 'past':
          return sessionDate < now;
        default:
          return true;
      }
    });

    return filtered;
  };

  const formatSessionDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const formatSessionTime = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const isLiveNow = (dateString: string): boolean => {
    const sessionDate = new Date(dateString);
    const now = new Date();
    const diffMs = Math.abs(sessionDate.getTime() - now.getTime());
    const diffMinutes = Math.floor(diffMs / 1000 / 60);
    return diffMinutes < 30;
  };

  const getCategoryIcon = (category: string): keyof typeof Ionicons.glyphMap => {
    switch (category) {
      case 'workout': return 'fitness';
      case 'workshop': return 'school';
      case 'competition': return 'trophy';
      case 'social': return 'people';
      default: return 'calendar';
    }
  };

  const getCategoryColor = (category: string): string => {
    switch (category) {
      case 'workout': return '#FF6B6B';
      case 'workshop': return '#4ECDC4';
      case 'competition': return '#FFD93D';
      case 'social': return '#6BCF7F';
      default: return '#0A84FF';
    }
  };

  const getDifficultyColor = (difficulty: string): string => {
    switch (difficulty) {
      case 'beginner': return '#30D158';
      case 'intermediate': return '#FF9F0A';
      case 'advanced': return '#FF453A';
      default: return '#8E8E93';
    }
  };

  const handleFilterChange = (filter: 'all' | 'upcoming' | 'live' | 'past') => {
    Haptics.selectionAsync();
    setActiveFilter(filter);
  };

  const handleCategoryChange = (category: 'all' | 'workout' | 'workshop' | 'competition' | 'social') => {
    Haptics.selectionAsync();
    setActiveCategory(category);
  };

  const handleSessionPress = (session: Session) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onSessionPress(session.id);
  };

  const handleRSVP = (session: Session) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert('RSVP', `RSVP for ${session.title}`);
  };

  const handleJoinLive = (session: Session) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    Alert.alert('Join Live', `Joining ${session.title}...`);
  };

  const renderSessionCard = ({ item }: { item: Session }) => {
    const isLive = isLiveNow(item.dateTime);
    const categoryColor = getCategoryColor(item.category || 'workout');
    const difficultyColor = getDifficultyColor(item.difficulty || 'beginner');

    return (
      <TouchableOpacity
        style={styles.sessionCard}
        onPress={() => handleSessionPress(item)}
        activeOpacity={0.9}
      >
        <BlurView intensity={30} tint="dark" style={styles.sessionCardBlur}>
          <View style={styles.sessionCardContent}>
            {/* Header with category and live indicator */}
            <View style={styles.sessionHeader}>
              <View style={styles.sessionCategory}>
                <View style={[styles.categoryIcon, { backgroundColor: categoryColor }]}>
                  <Ionicons
                    name={getCategoryIcon(item.category || 'workout')}
                    size={16}
                    color="#FFFFFF"
                  />
                </View>
                <Text style={styles.categoryText}>
                  {(item.category || 'workout').charAt(0).toUpperCase() + (item.category || 'workout').slice(1)}
                </Text>
              </View>

              {isLive && (
                <View style={styles.liveBadge}>
                  <View style={styles.liveDot} />
                  <Text style={styles.liveText}>LIVE</Text>
                </View>
              )}

              {item.isPaid && (
                <View style={styles.paidBadge}>
                  <Text style={styles.paidText}>${item.price}</Text>
                </View>
              )}
            </View>

            {/* Session title and description */}
            <Text style={styles.sessionTitle} numberOfLines={2}>
              {item.title}
            </Text>
            
            {item.description && (
              <Text style={styles.sessionDescription} numberOfLines={2}>
                {item.description}
              </Text>
            )}

            {/* Date, time, and location */}
            <View style={styles.sessionDateTime}>
              <View style={styles.dateTimeItem}>
                <Ionicons name="calendar-outline" size={16} color="#0A84FF" />
                <Text style={styles.dateTimeText}>
                  {formatSessionDate(item.dateTime)}
                </Text>
              </View>
              <View style={styles.dateTimeItem}>
                <Ionicons name="time-outline" size={16} color="#8E8E93" />
                <Text style={styles.dateTimeText}>
                  {formatSessionTime(item.dateTime)}
                </Text>
              </View>
            </View>

            {/* Location and difficulty */}
            <View style={styles.sessionMetadata}>
              <View style={styles.locationContainer}>
                <Ionicons
                  name={item.isOnline ? "videocam" : "location"}
                  size={14}
                  color={item.isOnline ? "#30D158" : "#FF9F0A"}
                />
                <Text style={[
                  styles.locationText,
                  { color: item.isOnline ? "#30D158" : "#FF9F0A" }
                ]}>
                  {item.isOnline ? "Online" : item.location}
                </Text>
              </View>

              {item.difficulty && (
                <View style={[styles.difficultyBadge, { backgroundColor: difficultyColor }]}>
                  <Text style={styles.difficultyText}>
                    {item.difficulty.charAt(0).toUpperCase() + item.difficulty.slice(1)}
                  </Text>
                </View>
              )}
            </View>

            {/* Footer with host and actions */}
            <View style={styles.sessionFooter}>
              <View style={styles.hostInfo}>
                {item.host.avatar ? (
                  <Image source={{ uri: item.host.avatar }} style={styles.hostAvatar} />
                ) : (
                  <View style={styles.hostAvatarPlaceholder}>
                    <Text style={styles.hostInitial}>
                      {item.host.name.charAt(0)}
                    </Text>
                  </View>
                )}
                <View style={styles.hostDetails}>
                  <Text style={styles.hostName}>{item.host.name}</Text>
                  <View style={styles.attendeesInfo}>
                    <Ionicons name="people-outline" size={12} color="#8E8E93" />
                    <Text style={styles.attendeesText}>
                      {item.attendeeCount} attending
                    </Text>
                  </View>
                </View>
              </View>

              {/* Action buttons */}
              <View style={styles.sessionActions}>
                {isLive && item.isOnline ? (
                  <TouchableOpacity
                    style={styles.joinLiveButton}
                    onPress={() => handleJoinLive(item)}
                  >
                    <Text style={styles.joinLiveText}>Join</Text>
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity
                    style={[
                      styles.rsvpButton,
                      item.isAttending && styles.rsvpButtonAttending
                    ]}
                    onPress={() => handleRSVP(item)}
                  >
                    <Text style={styles.rsvpText}>
                      {item.isAttending ? "Going" : "RSVP"}
                    </Text>
                    {item.isAttending && (
                      <Ionicons name="checkmark" size={14} color="#FFFFFF" />
                    )}
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </View>
        </BlurView>
      </TouchableOpacity>
    );
  };

  const filteredSessions = filterSessions();

  return (
    <View style={styles.container}>
      {/* Filter Tabs */}
      <View style={styles.filterContainer}>
        <BlurView intensity={20} tint="dark" style={styles.filterBlur}>
          <View style={styles.filterTabs}>
            {(['upcoming', 'live', 'past'] as const).map((filter) => (
              <TouchableOpacity
                key={filter}
                style={[
                  styles.filterTab,
                  activeFilter === filter && styles.activeFilterTab
                ]}
                onPress={() => handleFilterChange(filter)}
              >
                <Text style={[
                  styles.filterTabText,
                  activeFilter === filter && styles.activeFilterTabText
                ]}>
                  {filter.charAt(0).toUpperCase() + filter.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </BlurView>
      </View>

      {/* Category Pills */}
      <View style={styles.categoryContainer}>
        <FlatList
          horizontal
          data={['all', 'workout', 'workshop', 'competition', 'social']}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.categoryPill,
                activeCategory === item && styles.activeCategoryPill,
                { backgroundColor: activeCategory === item ? getCategoryColor(item) : 'rgba(255,255,255,0.1)' }
              ]}
              onPress={() => handleCategoryChange(item as any)}
            >
              <Ionicons
                name={getCategoryIcon(item)}
                size={16}
                color={activeCategory === item ? "#FFFFFF" : "#8E8E93"}
              />
              <Text style={[
                styles.categoryPillText,
                { color: activeCategory === item ? "#FFFFFF" : "#8E8E93" }
              ]}>
                {item.charAt(0).toUpperCase() + item.slice(1)}
              </Text>
            </TouchableOpacity>
          )}
          keyExtractor={(item) => item}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryList}
        />
      </View>

      {/* Sessions List */}
      <FlatList
        data={filteredSessions}
        renderItem={renderSessionCard}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.sessionsList}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No sessions found</Text>
            <Text style={styles.emptySubtext}>
              Try adjusting your filters or check back later
            </Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  // Filter styles
  filterContainer: {
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },
  filterBlur: {
    paddingHorizontal: 4,
    paddingVertical: 4,
  },
  filterTabs: {
    flexDirection: 'row',
  },
  filterTab: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignItems: 'center',
    borderRadius: 8,
  },
  activeFilterTab: {
    backgroundColor: '#0A84FF',
  },
  filterTabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8E8E93',
  },
  activeFilterTabText: {
    color: '#FFFFFF',
  },

  // Category styles
  categoryContainer: {
    marginBottom: 16,
  },
  categoryList: {
    paddingHorizontal: 16,
  },
  categoryPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginRight: 8,
  },
  activeCategoryPill: {
    // Color handled dynamically
  },
  categoryPillText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 6,
  },

  // Session card styles
  sessionsList: {
    paddingBottom: 20,
  },
  sessionCard: {
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden',
  },
  sessionCardBlur: {
    // BlurView handles the blur
  },
  sessionCardContent: {
    padding: 16,
  },
  sessionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sessionCategory: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  categoryIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF3B30',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginLeft: 8,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FFFFFF',
    marginRight: 4,
  },
  liveText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  paidBadge: {
    backgroundColor: '#FF9F0A',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginLeft: 8,
  },
  paidText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  sessionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  sessionDescription: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 12,
    lineHeight: 20,
  },
  sessionDateTime: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  dateTimeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
  },
  dateTimeText: {
    fontSize: 14,
    color: '#FFFFFF',
    marginLeft: 6,
    fontWeight: '500',
  },
  sessionMetadata: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  difficultyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  difficultyText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  sessionFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  hostInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  hostAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 10,
  },
  hostAvatarPlaceholder: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#0A84FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  hostInitial: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  hostDetails: {
    flex: 1,
  },
  hostName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  attendeesInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  attendeesText: {
    fontSize: 12,
    color: '#8E8E93',
    marginLeft: 4,
  },
  sessionActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  joinLiveButton: {
    backgroundColor: '#30D158',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  joinLiveText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  rsvpButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(10, 132, 255, 0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(10, 132, 255, 0.4)',
  },
  rsvpButtonAttending: {
    backgroundColor: 'rgba(48, 209, 88, 0.2)',
    borderColor: 'rgba(48, 209, 88, 0.4)',
  },
  rsvpText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    marginRight: 4,
  },

  // Empty state
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#8E8E93',
    textAlign: 'center',
  },
});

export default SessionsTab; 