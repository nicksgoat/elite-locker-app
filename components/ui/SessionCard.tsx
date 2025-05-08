import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { Image } from 'expo-image'; // Assuming Session uses expo-image

// Interface copied from club/[id].tsx
interface Session {
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

interface SessionCardProps {
  session: Session;
  onPress: (id: string) => void;
}

// Helper Functions (can be moved to a utils file later)
const formatSessionDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
};
const formatSessionTime = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', timeZoneName: 'short' });
};

const SessionCard: React.FC<SessionCardProps> = ({ session, onPress }) => {

  const handlePress = () => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onPress(session.id);
  };

   const handleRsvp = () => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      Alert.alert('RSVP Clicked', `RSVP for ${session.title}`);
  };

  return (
    <TouchableOpacity style={styles.sessionCard} onPress={handlePress} activeOpacity={0.8}>
       <BlurView intensity={20} tint="dark" style={styles.sessionCardBlur}>
          <View style={styles.sessionCardHeader}>
             <View style={styles.sessionDateTime}>
                <Ionicons name="calendar-outline" size={14} color="#0A84FF" style={{marginRight: 5}} />
                <Text style={styles.sessionDateText}>{formatSessionDate(session.dateTime)}</Text>
                <Text style={styles.sessionTimeText}>{formatSessionTime(session.dateTime)}</Text>
             </View>
             {session.isOnline ? (
                <View style={styles.sessionLocationOnline}>
                   <Ionicons name="videocam-outline" size={14} color="#30D158" />
                   <Text style={styles.sessionLocationTextOnline}>Online</Text>
                </View>
             ) : (
                <View style={styles.sessionLocationPhysical}>
                    <Ionicons name="location-outline" size={14} color="#FF9500" />
                   <Text style={styles.sessionLocationTextPhysical}>{session.location}</Text>
                </View>
             )}
          </View>
          <Text style={styles.sessionTitle}>{session.title}</Text>
          {session.description && <Text style={styles.sessionDescription}>{session.description}</Text>}
          <View style={styles.sessionFooter}>
             <View style={styles.sessionAttendees}>
                 <Ionicons name="people-outline" size={14} color="#AAA" />
                <Text style={styles.sessionAttendeeText}>{session.attendeeCount} attending</Text>
             </View>
             <TouchableOpacity style={[styles.rsvpButton, session.isAttending && styles.rsvpButtonAttending]} onPress={handleRsvp}>
                 <Text style={styles.rsvpButtonText}>{session.isAttending ? 'Attending' : 'RSVP'}</Text>
                 {session.isAttending && <Ionicons name="checkmark-circle" size={14} color="#FFF" style={{marginLeft: 4}}/>}
             </TouchableOpacity>
          </View>
       </BlurView>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
   sessionCard: {
     marginBottom: 16,
     borderRadius: 12,
     overflow: 'hidden',
     borderWidth: 1,
     borderColor: 'rgba(255, 255, 255, 0.1)', 
   },
   sessionCardBlur: {
       padding: 14,
       backgroundColor: 'rgba(30, 30, 30, 0.7)', 
   },
   sessionCardHeader: {
       flexDirection: 'row',
       justifyContent: 'space-between',
       alignItems: 'center',
       marginBottom: 10,
   },
   sessionDateTime: {
       flexDirection: 'row',
       alignItems: 'center',
   },
   sessionDateText: {
       color: '#E5E5EA',
       fontSize: 13,
       fontWeight: '500',
       marginRight: 6,
   },
   sessionTimeText: {
       color: '#8E8E93',
       fontSize: 13,
   },
   sessionLocationOnline: {
       flexDirection: 'row',
       alignItems: 'center',
       backgroundColor: 'rgba(48, 209, 88, 0.15)', 
       paddingHorizontal: 8,
       paddingVertical: 3,
       borderRadius: 6,
   },
   sessionLocationTextOnline: {
       color: '#30D158',
       fontSize: 12,
       fontWeight: '500',
       marginLeft: 4,
   },
   sessionLocationPhysical: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 149, 0, 0.15)', 
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 6,
   },
   sessionLocationTextPhysical: {
        color: '#FF9500',
        fontSize: 12,
        fontWeight: '500',
        marginLeft: 4,
   },
   sessionTitle: {
       fontSize: 17,
       fontWeight: '600',
       color: '#FFFFFF',
       marginBottom: 6,
   },
   sessionDescription: {
       fontSize: 14,
       color: '#AEAEB2',
       lineHeight: 20,
       marginBottom: 12,
   },
   sessionFooter: {
       flexDirection: 'row',
       justifyContent: 'space-between',
       alignItems: 'center',
       marginTop: 8,
       paddingTop: 8,
       borderTopWidth: 0.5,
       borderTopColor: 'rgba(255, 255, 255, 0.15)',
   },
   sessionAttendees: {
       flexDirection: 'row',
       alignItems: 'center',
   },
   sessionAttendeeText: {
       color: '#8E8E93',
       fontSize: 13,
       marginLeft: 5,
   },
   rsvpButton: {
       flexDirection: 'row',
       alignItems: 'center',
       backgroundColor: 'rgba(10, 132, 255, 0.2)',
       paddingHorizontal: 12,
       paddingVertical: 6,
       borderRadius: 15,
       borderWidth: 1,
       borderColor: 'rgba(10, 132, 255, 0.4)',
   },
    rsvpButtonAttending: {
       backgroundColor: 'rgba(48, 209, 88, 0.2)', 
       borderColor: 'rgba(48, 209, 88, 0.4)',
   },
   rsvpButtonText: {
       color: '#FFFFFF',
       fontSize: 13,
       fontWeight: '600',
   },
});

export default SessionCard; 