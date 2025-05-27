/**
 * Elite Locker Design System - SessionCard Component
 * 
 * A unified card component for displaying session information.
 * This component consolidates the functionality of multiple session card components.
 */

import React from 'react';
import { 
  StyleSheet, 
  View, 
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { Image } from 'expo-image';

import { Card } from '../primitives/Card';
import { Text } from '../primitives/Text';
import { useTheme } from '../ThemeProvider';

// Session data interface
export interface SessionCardData {
  id: string;
  title: string;
  description?: string;
  dateTime: string; // ISO string format
  location?: string;
  isOnline: boolean;
  meetingUrl?: string;
  host?: {
    id: string;
    name: string;
    avatarUrl?: string;
  };
  attendeeCount?: number;
  maxAttendees?: number;
  isAttending?: boolean;
  isPaid?: boolean;
  price?: number;
  clubId?: string;
  clubName?: string;
  clubImageUrl?: string;
}

// Card variants
export type SessionCardVariant = 
  | 'default'    // Standard card
  | 'compact'    // Smaller card for lists
  | 'upcoming';  // Card for upcoming sessions

// Props
export interface SessionCardProps {
  session: SessionCardData;
  variant?: SessionCardVariant;
  onPress?: (session: SessionCardData) => void;
  onJoin?: (session: SessionCardData) => void;
  onRSVP?: (session: SessionCardData) => void;
  onCancelRSVP?: (session: SessionCardData) => void;
}

/**
 * SessionCard component
 *
 * A unified card component for displaying session information.
 *
 * @example
 * ```tsx
 * <SessionCard
 *   session={sessionData}
 *   onPress={(session) => console.log(`Session ${session.id} pressed`)}
 * />
 * ```
 */
export const SessionCard: React.FC<SessionCardProps> = ({
  session,
  variant = 'default',
  onPress,
  onJoin,
  onRSVP,
  onCancelRSVP,
}) => {
  const { colors, spacing } = useTheme();
  
  // Safely access session properties with fallbacks
  const {
    id = '',
    title = 'Untitled Session',
    description = '',
    dateTime = new Date().toISOString(),
    location = '',
    isOnline = false,
    meetingUrl = '',
    host = { id: '', name: '' },
    attendeeCount = 0,
    maxAttendees,
    isAttending = false,
    isPaid = false,
    price = 0,
    clubId = '',
    clubName = '',
    clubImageUrl = '',
  } = session || {};
  
  // Handle card press
  const handlePress = () => {
    if (onPress) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onPress(session);
    }
  };
  
  // Handle join button press
  const handleJoin = () => {
    if (onJoin) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      onJoin(session);
    }
  };
  
  // Handle RSVP button press
  const handleRSVP = () => {
    if (isAttending && onCancelRSVP) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      onCancelRSVP(session);
    } else if (!isAttending && onRSVP) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      onRSVP(session);
    }
  };
  
  // Format session date (e.g., "Mon, Jan 1")
  const formatSessionDate = (dateTimeString: string): string => {
    try {
      const date = new Date(dateTimeString);
      return date.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
      });
    } catch (error) {
      return 'Invalid date';
    }
  };
  
  // Format session time (e.g., "7:00 PM")
  const formatSessionTime = (dateTimeString: string): string => {
    try {
      const date = new Date(dateTimeString);
      return date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      });
    } catch (error) {
      return 'Invalid time';
    }
  };
  
  // Check if session is happening now
  const isHappeningNow = (): boolean => {
    try {
      const sessionDate = new Date(dateTime);
      const now = new Date();
      
      // Session is happening now if it's within 30 minutes of the start time
      const diffMs = Math.abs(sessionDate.getTime() - now.getTime());
      const diffMinutes = Math.floor(diffMs / 1000 / 60);
      
      return diffMinutes < 30;
    } catch (error) {
      return false;
    }
  };
  
  // Check if session is in the past
  const isPast = (): boolean => {
    try {
      const sessionDate = new Date(dateTime);
      const now = new Date();
      
      return sessionDate < now;
    } catch (error) {
      return false;
    }
  };
  
  // Render compact variant
  if (variant === 'compact') {
    return (
      <TouchableOpacity
        style={styles.compactCard}
        onPress={handlePress}
        activeOpacity={0.8}
      >
        <BlurView intensity={20} tint="dark" style={styles.compactCardBlur}>
          <View style={styles.compactCardContent}>
            <View style={styles.compactCardHeader}>
              <View style={styles.dateTimeContainer}>
                <Ionicons name="calendar-outline" size={14} color="#0A84FF" style={styles.dateTimeIcon} />
                <Text variant="bodySmall" color="secondary" style={styles.dateText}>
                  {formatSessionDate(dateTime)}
                </Text>
                <Text variant="bodySmall" color="inverse" style={styles.timeText}>
                  {formatSessionTime(dateTime)}
                </Text>
              </View>
              
              {isOnline ? (
                <View style={styles.onlineIndicator}>
                  <Ionicons name="videocam-outline" size={14} color="#30D158" />
                  <Text variant="bodySmall" color="success" style={styles.onlineTextCompact}>
                    Online
                  </Text>
                </View>
              ) : (
                <View style={styles.locationIndicator}>
                  <Ionicons name="location-outline" size={14} color="#FF9F0A" />
                  <Text variant="bodySmall" color="warning" style={styles.locationTextCompact} numberOfLines={1}>
                    {location || 'No location'}
                  </Text>
                </View>
              )}
            </View>
            
            <Text variant="bodySemiBold" color="inverse" style={styles.compactTitle} numberOfLines={1}>
              {title}
            </Text>
            
            <View style={styles.compactFooter}>
              {host?.name && (
                <View style={styles.hostContainer}>
                  {host.avatarUrl ? (
                    <Image
                      source={{ uri: host.avatarUrl }}
                      style={styles.hostAvatar}
                      contentFit="cover"
                    />
                  ) : (
                    <View style={styles.hostAvatarPlaceholder}>
                      <Text variant="bodySmall" color="inverse">
                        {host.name.charAt(0)}
                      </Text>
                    </View>
                  )}
                  <Text variant="bodySmall" color="secondary" style={styles.hostName}>
                    {host.name}
                  </Text>
                </View>
              )}
              
              {isHappeningNow() && isOnline && (
                <TouchableOpacity
                  style={styles.joinButton}
                  onPress={handleJoin}
                >
                  <Text variant="labelSmall" color="inverse">
                    Join Now
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </BlurView>
      </TouchableOpacity>
    );
  }
  
  // Render upcoming variant
  if (variant === 'upcoming') {
    return (
      <Card
        variant="blur"
        blurIntensity={15}
        blurTint="dark"
        style={styles.upcomingCard}
        onPress={handlePress}
      >
        <View style={styles.upcomingCardContent}>
          <View style={styles.upcomingCardHeader}>
            <View style={styles.upcomingDateContainer}>
              <Text variant="h3" color="inverse" style={styles.upcomingDay}>
                {new Date(dateTime).getDate()}
              </Text>
              <Text variant="bodySmall" color="secondary" style={styles.upcomingMonth}>
                {new Date(dateTime).toLocaleDateString('en-US', { month: 'short' })}
              </Text>
            </View>
            
            <View style={styles.upcomingDetails}>
              <Text variant="bodySemiBold" color="inverse" style={styles.upcomingTitle} numberOfLines={1}>
                {title}
              </Text>
              
              <View style={styles.upcomingTimeLocation}>
                <View style={styles.upcomingTime}>
                  <Ionicons name="time-outline" size={14} color={colors.icon.secondary} />
                  <Text variant="bodySmall" color="secondary" style={styles.upcomingTimeText}>
                    {formatSessionTime(dateTime)}
                  </Text>
                </View>
                
                {isOnline ? (
                  <View style={styles.upcomingOnline}>
                    <Ionicons name="videocam-outline" size={14} color="#30D158" />
                    <Text variant="bodySmall" color="success" style={styles.upcomingOnlineText}>
                      Online
                    </Text>
                  </View>
                ) : (
                  <View style={styles.upcomingLocation}>
                    <Ionicons name="location-outline" size={14} color="#FF9F0A" />
                    <Text variant="bodySmall" color="warning" style={styles.upcomingLocationText} numberOfLines={1}>
                      {location || 'No location'}
                    </Text>
                  </View>
                )}
              </View>
            </View>
            
            {isAttending ? (
              <TouchableOpacity
                style={styles.cancelRSVPButton}
                onPress={handleRSVP}
              >
                <Text variant="labelSmall" color="inverse">
                  Cancel
                </Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={styles.rsvpButton}
                onPress={handleRSVP}
              >
                <Text variant="labelSmall" color="inverse">
                  RSVP
                </Text>
              </TouchableOpacity>
            )}
          </View>
          
          {clubName && (
            <View style={styles.upcomingClub}>
              {clubImageUrl ? (
                <Image
                  source={{ uri: clubImageUrl }}
                  style={styles.clubImage}
                  contentFit="cover"
                />
              ) : (
                <View style={styles.clubImagePlaceholder}>
                  <Text variant="bodySmall" color="inverse">
                    {clubName.charAt(0)}
                  </Text>
                </View>
              )}
              <Text variant="bodySmall" color="secondary" style={styles.clubName}>
                {clubName}
              </Text>
            </View>
          )}
        </View>
      </Card>
    );
  }
  
  // Render default variant
  return (
    <Card
      variant="blur"
      blurIntensity={20}
      blurTint="dark"
      style={styles.card}
      onPress={handlePress}
    >
      <View style={styles.cardContent}>
        <View style={styles.cardHeader}>
          <Text variant="bodySemiBold" color="inverse" style={styles.cardTitle}>
            {title}
          </Text>
          
          {isPaid && (
            <View style={styles.paidBadge}>
              <Text variant="labelSmall" color="inverse">
                ${price.toFixed(2)}
              </Text>
            </View>
          )}
        </View>
        
        {description && (
          <Text variant="bodySmall" color="secondary" style={styles.description} numberOfLines={2}>
            {description}
          </Text>
        )}
        
        <View style={styles.dateTimeRow}>
          <View style={styles.dateContainer}>
            <Ionicons name="calendar-outline" size={16} color={colors.icon.secondary} />
            <Text variant="bodySmall" color="secondary" style={styles.dateText}>
              {formatSessionDate(dateTime)}
            </Text>
          </View>
          
          <View style={styles.timeContainer}>
            <Ionicons name="time-outline" size={16} color={colors.icon.secondary} />
            <Text variant="bodySmall" color="secondary" style={styles.timeText}>
              {formatSessionTime(dateTime)}
            </Text>
          </View>
        </View>
        
        <View style={styles.locationRow}>
          {isOnline ? (
            <View style={styles.onlineContainer}>
              <Ionicons name="videocam-outline" size={16} color="#30D158" />
              <Text variant="bodySmall" color="success" style={styles.onlineText}>
                Online Session
              </Text>
            </View>
          ) : (
            <View style={styles.locationContainer}>
              <Ionicons name="location-outline" size={16} color="#FF9F0A" />
              <Text variant="bodySmall" color="warning" style={styles.locationText} numberOfLines={1}>
                {location || 'No location specified'}
              </Text>
            </View>
          )}
        </View>
        
        <View style={styles.cardFooter}>
          <View style={styles.attendeesContainer}>
            <Ionicons name="people-outline" size={16} color={colors.icon.secondary} />
            <Text variant="bodySmall" color="secondary" style={styles.attendeesText}>
              {attendeeCount} {maxAttendees ? `/ ${maxAttendees}` : ''} attending
            </Text>
          </View>
          
          {isHappeningNow() && isOnline ? (
            <TouchableOpacity
              style={styles.joinNowButton}
              onPress={handleJoin}
            >
              <Text variant="labelSmall" color="inverse">
                Join Now
              </Text>
            </TouchableOpacity>
          ) : !isPast() ? (
            isAttending ? (
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={handleRSVP}
              >
                <Text variant="labelSmall" color="inverse">
                  Cancel RSVP
                </Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={styles.rsvpButton}
                onPress={handleRSVP}
              >
                <Text variant="labelSmall" color="inverse">
                  RSVP
                </Text>
              </TouchableOpacity>
            )
          ) : (
            <View style={styles.pastBadge}>
              <Text variant="labelSmall" color="secondary">
                Ended
              </Text>
            </View>
          )}
        </View>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  // Default card styles
  card: {
    width: '100%',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
  },
  cardContent: {
    padding: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardTitle: {
    flex: 1,
    marginRight: 8,
  },
  paidBadge: {
    backgroundColor: '#FF9F0A',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  description: {
    marginBottom: 12,
  },
  dateTimeRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  dateText: {
    marginLeft: 6,
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeText: {
    marginLeft: 6,
  },
  locationRow: {
    marginBottom: 16,
  },
  onlineContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  onlineText: {
    fontSize: 14,
    color: '#30D158',
    fontWeight: '600',
    marginLeft: 6,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationText: {
    fontSize: 14,
    color: '#FF9F0A',
    fontWeight: '600',
    marginLeft: 6,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  attendeesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  attendeesText: {
    marginLeft: 6,
  },
  joinNowButton: {
    backgroundColor: '#30D158',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
  },
  rsvpButton: {
    backgroundColor: '#0A84FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
  },
  cancelButton: {
    backgroundColor: '#FF453A',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
  },
  pastBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
  },
  
  // Compact card styles
  compactCard: {
    width: '100%',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 12,
  },
  compactCardBlur: {
    borderRadius: 12,
  },
  compactCardContent: {
    padding: 12,
  },
  compactCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  dateTimeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateTimeIcon: {
    marginRight: 4,
  },
  onlineIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(48, 209, 88, 0.1)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  onlineTextCompact: {
    marginLeft: 4,
  },
  locationIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    maxWidth: '50%',
  },
  locationTextCompact: {
    marginLeft: 4,
  },
  compactTitle: {
    marginBottom: 8,
  },
  compactFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  hostContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  hostAvatar: {
    width: 20,
    height: 20,
    borderRadius: 10,
    marginRight: 6,
  },
  hostAvatarPlaceholder: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#0A84FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 6,
  },
  hostName: {
    marginLeft: 4,
  },
  joinButton: {
    backgroundColor: '#30D158',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 4,
  },
  
  // Upcoming card styles
  upcomingCard: {
    width: '100%',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 12,
  },
  upcomingCardContent: {
    padding: 12,
  },
  upcomingCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  upcomingDateContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 40,
    marginRight: 12,
  },
  upcomingDay: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  upcomingMonth: {
    textTransform: 'uppercase',
  },
  upcomingDetails: {
    flex: 1,
  },
  upcomingTitle: {
    marginBottom: 4,
  },
  upcomingTimeLocation: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  upcomingTime: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
  },
  upcomingTimeText: {
    marginLeft: 4,
  },
  upcomingOnline: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  upcomingOnlineText: {
    marginLeft: 4,
  },
  upcomingLocation: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  upcomingLocationText: {
    marginLeft: 4,
    flex: 1,
  },
  cancelRSVPButton: {
    backgroundColor: 'rgba(255, 69, 58, 0.8)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 4,
  },
  upcomingClub: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  clubImage: {
    width: 20,
    height: 20,
    borderRadius: 10,
    marginRight: 6,
  },
  clubImagePlaceholder: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#0A84FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 6,
  },
  clubName: {
    marginLeft: 4,
  },
});

export default SessionCard;
