import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Animated,
  TextInput,
  Switch,
  Alert,
  Platform,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import * as Calendar from 'expo-calendar';
import { SafeAreaView } from 'react-native-safe-area-context';

// Types
interface EventLocation {
  name: string;
  address: string;
  latitude: number;
  longitude: number;
}

interface EventBookingModalProps {
  visible: boolean;
  onClose: () => void;
  onComplete: () => void;
  event: {
    id: string;
    title: string;
    startTime: string;
    endTime: string;
    location: EventLocation | null;
    eventType: string;
  };
  selectedTier: {
    id: string;
    name: string;
    price: number;
  };
}

export default function EventBookingModal({
  visible,
  onClose,
  onComplete,
  event,
  selectedTier,
}: EventBookingModalProps) {
  const [scaleAnim] = useState(new Animated.Value(0.9));
  const [opacityAnim] = useState(new Animated.Value(0));
  const [email, setEmail] = useState('');
  const [addToCalendar, setAddToCalendar] = useState(true);
  const [savePaymentInfo, setSavePaymentInfo] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  
  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(scaleAnim, {
          toValue: 0.9,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);
  
  const handleClose = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onClose();
  };
  
  const handleToggleCalendar = () => {
    setAddToCalendar(previous => !previous);
  };
  
  const handleTogglePaymentSave = () => {
    setSavePaymentInfo(previous => !previous);
  };
  
  const addEventToCalendar = async () => {
    try {
      // Request calendar permissions first
      const { status } = await Calendar.requestCalendarPermissionsAsync();
      
      if (status === 'granted') {
        // Get default calendar
        const calendars = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);
        const defaultCalendar = calendars.find(
          cal => cal.source.name === (Platform.OS === 'ios' ? 'iCloud' : 'Google')
        );
        
        if (defaultCalendar) {
          await Calendar.createEventAsync(defaultCalendar.id, {
            title: event.title,
            startDate: new Date(event.startTime),
            endDate: new Date(event.endTime),
            location: event.location ? `${event.location.name}, ${event.location.address}` : undefined,
            notes: `${event.eventType.charAt(0).toUpperCase() + event.eventType.slice(1)} event booked through Elite Locker`,
            alarms: [{ relativeOffset: -60 }],  // 1 hour reminder
          });
          return true;
        }
      }
      return false;
    } catch (error) {
      console.error("Error adding event to calendar:", error);
      return false;
    }
  };
  
  const handleCompleteBooking = async () => {
    if (!email) {
      Alert.alert('Email Required', 'Please enter your email to receive booking confirmation');
      return;
    }
    
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsProcessing(true);
    
    // Simulate processing delay
    setTimeout(async () => {
      // Add to calendar if option is selected
      if (addToCalendar) {
        const success = await addEventToCalendar();
        if (!success) {
          Alert.alert(
            'Calendar Issue',
            'Could not add event to your calendar. Your booking is still confirmed.',
            [{ text: 'OK' }]
          );
        }
      }
      
      setIsProcessing(false);
      onComplete();
    }, 1500);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };
  
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };
  
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="none"
      onRequestClose={handleClose}
    >
      <SafeAreaView style={styles.modalContainer} edges={['top', 'bottom']}>
        <BlurView intensity={80} tint="dark" style={styles.blurBackground}>
          <Animated.View
            style={[
              styles.modalContent,
              {
                transform: [{ scale: scaleAnim }],
                opacity: opacityAnim,
              },
            ]}
          >
            <View style={styles.headerContainer}>
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={handleClose}
              >
                <Ionicons name="close" size={24} color="#FFFFFF" />
              </TouchableOpacity>
              <Text style={styles.headerTitle}>Complete Booking</Text>
              <View style={styles.headerRight} />
            </View>
            
            <ScrollView style={styles.scrollContent}>
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Event Details</Text>
                <View style={styles.eventCard}>
                  <Text style={styles.eventTitle}>{event.title}</Text>
                  <View style={styles.eventDetails}>
                    <View style={styles.detailRow}>
                      <Ionicons name="calendar-outline" size={18} color="#AAAAAA" />
                      <Text style={styles.detailText}>{formatDate(event.startTime)}</Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Ionicons name="time-outline" size={18} color="#AAAAAA" />
                      <Text style={styles.detailText}>
                        {formatTime(event.startTime)} - {formatTime(event.endTime)}
                      </Text>
                    </View>
                    {event.location && (
                      <View style={styles.detailRow}>
                        <Ionicons name="location-outline" size={18} color="#AAAAAA" />
                        <View style={styles.locationInfo}>
                          <Text style={styles.detailText}>{event.location.name}</Text>
                          <Text style={styles.addressText}>{event.location.address}</Text>
                        </View>
                      </View>
                    )}
                    <View style={styles.detailRow}>
                      <Ionicons name={
                        event.eventType === 'virtual' ? 'videocam-outline' :
                        event.eventType === 'in_person' ? 'location-outline' : 'globe-outline'
                      } size={18} color="#AAAAAA" />
                      <Text style={styles.detailText}>
                        {event.eventType.charAt(0).toUpperCase() + event.eventType.slice(1)} Event
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
              
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Selected Ticket</Text>
                <View style={styles.ticketCard}>
                  <View style={styles.ticketHeader}>
                    <Text style={styles.ticketName}>{selectedTier.name}</Text>
                    <Text style={styles.ticketPrice}>
                      {selectedTier.price === 0 ? 'Free' : `$${selectedTier.price.toFixed(2)}`}
                    </Text>
                  </View>
                  
                  <View style={styles.ticketDetails}>
                    <View style={styles.ticketBadge}>
                      <Text style={styles.ticketBadgeText}>
                        {selectedTier.price === 0 ? 'FREE' : 'PAID'}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
              
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Contact Information</Text>
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Email</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="Enter your email"
                    placeholderTextColor="#777777"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </View>
              </View>
              
              <View style={styles.section}>
                <View style={styles.toggleRow}>
                  <View style={styles.toggleInfo}>
                    <Text style={styles.toggleLabel}>Add to Calendar</Text>
                    <Text style={styles.toggleSubtext}>
                      Automatically add this event to your device's calendar
                    </Text>
                  </View>
                  <Switch
                    value={addToCalendar}
                    onValueChange={handleToggleCalendar}
                    trackColor={{ false: '#222', true: '#0A84FF' }}
                    thumbColor="#FFFFFF"
                    ios_backgroundColor="#222"
                  />
                </View>
                
                {selectedTier.price > 0 && (
                  <View style={styles.toggleRow}>
                    <View style={styles.toggleInfo}>
                      <Text style={styles.toggleLabel}>Save Payment Info</Text>
                      <Text style={styles.toggleSubtext}>
                        Securely save your payment method for future events
                      </Text>
                    </View>
                    <Switch
                      value={savePaymentInfo}
                      onValueChange={handleTogglePaymentSave}
                      trackColor={{ false: '#222', true: '#0A84FF' }}
                      thumbColor="#FFFFFF"
                      ios_backgroundColor="#222"
                    />
                  </View>
                )}
              </View>
              
              {selectedTier.price > 0 && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Payment Summary</Text>
                  <View style={styles.summaryCard}>
                    <View style={styles.summaryRow}>
                      <Text style={styles.summaryItem}>Ticket ({selectedTier.name})</Text>
                      <Text style={styles.summaryValue}>${selectedTier.price.toFixed(2)}</Text>
                    </View>
                    <View style={styles.summaryRow}>
                      <Text style={styles.summaryItem}>Service Fee</Text>
                      <Text style={styles.summaryValue}>$0.00</Text>
                    </View>
                    <View style={styles.divider} />
                    <View style={styles.summaryRow}>
                      <Text style={styles.totalLabel}>Total</Text>
                      <Text style={styles.totalValue}>${selectedTier.price.toFixed(2)}</Text>
                    </View>
                  </View>
                </View>
              )}
            </ScrollView>
            
            <View style={styles.footer}>
              <TouchableOpacity
                style={[
                  styles.completeButton,
                  isProcessing && styles.processingButton
                ]}
                onPress={handleCompleteBooking}
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <Text style={styles.buttonText}>Processing...</Text>
                ) : (
                  <Text style={styles.buttonText}>
                    {selectedTier.price === 0 
                      ? 'Complete Registration'
                      : `Pay $${selectedTier.price.toFixed(2)}`}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </Animated.View>
        </BlurView>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  blurBackground: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalContent: {
    width: '100%',
    maxWidth: 500,
    backgroundColor: '#1C1C1E',
    borderRadius: 20,
    overflow: 'hidden',
    maxHeight: '90%',
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(60, 60, 67, 0.29)',
  },
  closeButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  headerRight: {
    width: 40,
  },
  scrollContent: {
    maxHeight: 500,
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  eventCard: {
    backgroundColor: 'rgba(30, 30, 30, 0.6)',
    borderRadius: 16,
    padding: 16,
  },
  eventTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  eventDetails: {
    gap: 8,
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
  ticketCard: {
    backgroundColor: 'rgba(30, 30, 30, 0.6)',
    borderRadius: 16,
    padding: 16,
  },
  ticketHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  ticketName: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  ticketPrice: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  ticketDetails: {
    flexDirection: 'row',
  },
  ticketBadge: {
    backgroundColor: 'rgba(10, 132, 255, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  ticketBadgeText: {
    color: '#0A84FF',
    fontSize: 12,
    fontWeight: '600',
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    color: '#AAAAAA',
    fontSize: 14,
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: 'rgba(30, 30, 30, 0.6)',
    color: '#FFFFFF',
    fontSize: 16,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(60, 60, 67, 0.29)',
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  toggleInfo: {
    flex: 1,
    marginRight: 16,
  },
  toggleLabel: {
    color: '#FFFFFF',
    fontSize: 16,
    marginBottom: 4,
  },
  toggleSubtext: {
    color: '#AAAAAA',
    fontSize: 14,
  },
  summaryCard: {
    backgroundColor: 'rgba(30, 30, 30, 0.6)',
    borderRadius: 16,
    padding: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  summaryItem: {
    color: '#CCCCCC',
    fontSize: 16,
  },
  summaryValue: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(60, 60, 67, 0.29)',
    marginVertical: 8,
  },
  totalLabel: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  totalValue: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(60, 60, 67, 0.29)',
  },
  completeButton: {
    backgroundColor: '#0A84FF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  processingButton: {
    backgroundColor: '#454545',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  locationInfo: {
    flex: 1,
  },
  addressText: {
    color: '#AAAAAA',
    fontSize: 12,
  },
}); 