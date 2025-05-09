/**
 * Elite Locker Design System - SessionCard Component
 * 
 * A card component for displaying session information.
 */

import React from 'react';
import { 
  StyleSheet, 
  View, 
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

import { Card } from '../primitives/Card';
import { Text } from '../primitives/Text';
import { Button } from '../primitives/Button';
import { useTheme } from '../ThemeProvider';

// Session data interface
export interface SessionCardData {
  id: string;
  title: string;
  description?: string;
  dateTime: string; // ISO string format
  location: string; // Could be "Online" or a physical address
  attendeeCount: number;
  host: {
    name: string;
    avatar?: string;
  };
  isAttending?: boolean; // For the current user
  isOnline: boolean;
  meetingUrl?: string; // If online
}

// SessionCard props
export interface SessionCardProps {
  session: SessionCardData;
  onPress?: (sessionId: string) => void;
  onRsvp?: (sessionId: string, attending: boolean) => void;
}

/**
 * SessionCard component
 * 
 * A card component for displaying session information.
 * 
 * @example
 * ```tsx
 * <SessionCard 
 *   session={sessionData} 
 *   onPress={(id) => console.log(`Session ${id} pressed`)} 
 *   onRsvp={(id, attending) => console.log(`RSVP ${attending ? 'yes' : 'no'} for session ${id}`)} 
 * />
 * ```
 */
export const SessionCard: React.FC<SessionCardProps> = ({
  session,
  onPress,
  onRsvp,
}) => {
  const { colors, spacing } = useTheme();
  
  // Format session date (e.g., "Mon, Jan 1")
  const formatSessionDate = (dateTimeString: string) => {
    const date = new Date(dateTimeString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };
  
  // Format session time (e.g., "3:00 PM")
  const formatSessionTime = (dateTimeString: string) => {
    const date = new Date(dateTimeString);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };
  
  // Handle card press
  const handlePress = () => {
    if (onPress) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onPress(session.id);
    }
  };
  
  // Handle RSVP button press
  const handleRsvp = () => {
    if (onRsvp) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onRsvp(session.id, !session.isAttending);
    }
  };
  
  return (
    <Card
      variant="blur"
      blurIntensity={20}
      blurTint="dark"
      style={styles.sessionCard}
      onPress={handlePress}
    >
      <View style={styles.sessionCardHeader}>
        <View style={styles.sessionDateTime}>
          <Ionicons 
            name="calendar-outline" 
            size={14} 
            color="#0A84FF" 
            style={styles.dateIcon} 
          />
          <Text variant="bodySmall" color="inverse">
            {formatSessionDate(session.dateTime)}
          </Text>
          <Text variant="bodySmall" color="secondary">
            {formatSessionTime(session.dateTime)}
          </Text>
        </View>
        
        {session.isOnline ? (
          <View style={styles.sessionLocationOnline}>
            <Ionicons name="videocam-outline" size={14} color="#30D158" />
            <Text variant="bodySmall" color="success" style={styles.locationText}>
              Online
            </Text>
          </View>
        ) : (
          <View style={styles.sessionLocationPhysical}>
            <Ionicons name="location-outline" size={14} color="#FF9500" />
            <Text variant="bodySmall" color="warning" style={styles.locationText}>
              In Person
            </Text>
          </View>
        )}
      </View>
      
      <Text variant="bodySemiBold" color="inverse">
        {session.title}
      </Text>
      
      {session.description && (
        <Text variant="bodySmall" color="secondary" style={styles.sessionDescription}>
          {session.description}
        </Text>
      )}
      
      <View style={styles.sessionFooter}>
        <View style={styles.sessionAttendees}>
          <Ionicons name="people-outline" size={14} color={colors.icon.secondary} />
          <Text variant="bodySmall" color="secondary" style={styles.attendeeText}>
            {session.attendeeCount} attending
          </Text>
        </View>
        
        <Button
          variant={session.isAttending ? 'primary' : 'outline'}
          size="sm"
          label={session.isAttending ? 'Attending' : 'RSVP'}
          rightIcon={session.isAttending ? 'checkmark-circle' : undefined}
          onPress={handleRsvp}
          style={styles.rsvpButton}
        />
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  sessionCard: {
    marginBottom: 16,
  },
  sessionCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  sessionDateTime: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateIcon: {
    marginRight: 5,
  },
  sessionLocationOnline: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(48, 209, 88, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  sessionLocationPhysical: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 149, 0, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  locationText: {
    marginLeft: 4,
  },
  sessionDescription: {
    marginTop: 4,
    marginBottom: 12,
  },
  sessionFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
  },
  sessionAttendees: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  attendeeText: {
    marginLeft: 4,
  },
  rsvpButton: {
    minWidth: 100,
  },
});

export default SessionCard;
