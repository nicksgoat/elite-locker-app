import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Image,
  Dimensions,
  Platform,
  Switch
} from 'react-native';
import { BlurView } from 'expo-blur';
import { Stack, useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

// Types for subscriptions
interface ProgramSubscriptionOptions {
  startDate: Date;
  addToCalendar: boolean;
  receiveReminders: boolean;
  adaptToProgress: boolean;
  autoScheduleDeloads: boolean;
}

interface Program {
  id: string;
  title: string;
  duration_weeks: number;
  thumbnail?: string;
}

// Mock programs data for the subscription screen
const mockPrograms: { [key: string]: Program } = {
  'p1': {
    id: 'p1',
    title: 'ELITE Power Building',
    duration_weeks: 8,
    thumbnail: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e',
  },
  'p2': {
    id: 'p2',
    title: '12-Week Transformation',
    duration_weeks: 12,
    thumbnail: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438',
  }
};

export default function ProgramSubscribeScreen() {
  const router = useRouter();
  const { programId } = useLocalSearchParams();
  const programIdStr = Array.isArray(programId) ? programId[0] : programId;
  const [program, setProgram] = useState<Program | null>(null);
  
  // Subscription options with defaults
  const [subscriptionOptions, setSubscriptionOptions] = useState<ProgramSubscriptionOptions>({
    startDate: new Date(),
    addToCalendar: true,
    receiveReminders: true,
    adaptToProgress: true,
    autoScheduleDeloads: true
  });

  // Format dates in a readable way
  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  // Calculate end date based on start date and program duration
  const calculateEndDate = (startDate: Date, durationWeeks: number): Date => {
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + (durationWeeks * 7));
    return endDate;
  };

  useEffect(() => {
    // In a real app, this would be an API call to get the program details
    if (programIdStr && mockPrograms[programIdStr]) {
      setProgram(mockPrograms[programIdStr]);
    }
  }, [programIdStr]);

  const handleBackPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };

  const handleStartDatePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    // In a real app, this would open a date picker
    // For now, we'll just add 1 day to simulate selecting a different date
    setSubscriptionOptions({
      ...subscriptionOptions,
      startDate: new Date(subscriptionOptions.startDate.getTime() + 86400000)
    });
  };

  const handleToggleSwitch = (option: keyof ProgramSubscriptionOptions) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSubscriptionOptions({
      ...subscriptionOptions,
      [option]: !subscriptionOptions[option]
    });
  };

  const handleSubscribe = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    // In a real app, this would create the subscription and add workouts to the calendar
    // Then navigate to the program detail page with active subscription
    router.push('/programs');
  };

  if (!program) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading program...</Text>
      </View>
    );
  }

  const endDate = calculateEndDate(subscriptionOptions.startDate, program.duration_weeks);

  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{
          headerShown: false,
        }}
      />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={handleBackPress}
        >
          <BlurView intensity={60} tint="dark" style={styles.backButtonBlur}>
            <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
          </BlurView>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Subscribe to Program</Text>
        <View style={styles.placeholderButton} />
      </View>

      <ScrollView 
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Program Card */}
        <View style={styles.programCard}>
          {program.thumbnail && (
            <Image 
              source={{ uri: program.thumbnail }} 
              style={styles.programThumbnail}
            />
          )}
          <View style={styles.programInfo}>
            <Text style={styles.programTitle}>{program.title}</Text>
            <Text style={styles.programDuration}>{program.duration_weeks} weeks</Text>
          </View>
        </View>

        {/* Schedule Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Schedule</Text>
          
          <TouchableOpacity 
            style={styles.dateOption}
            onPress={handleStartDatePress}
          >
            <View style={styles.dateOptionText}>
              <Text style={styles.optionLabel}>Start Date</Text>
              <Text style={styles.dateValue}>{formatDate(subscriptionOptions.startDate)}</Text>
            </View>
            <Ionicons name="calendar-outline" size={22} color="#0A84FF" />
          </TouchableOpacity>
          
          <View style={styles.dateOption}>
            <View style={styles.dateOptionText}>
              <Text style={styles.optionLabel}>End Date</Text>
              <Text style={styles.dateValue}>{formatDate(endDate)}</Text>
            </View>
            <Ionicons name="calendar-outline" size={22} color="#A0A0A0" />
          </View>
        </View>

        {/* Options Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Options</Text>

          <View style={styles.toggleOption}>
            <View style={styles.toggleOptionText}>
              <Text style={styles.optionLabel}>Add to Calendar</Text>
              <Text style={styles.optionDescription}>Sync workouts with your device calendar</Text>
            </View>
            <Switch
              trackColor={{ false: '#2C2C2E', true: 'rgba(10, 132, 255, 0.3)' }}
              thumbColor={subscriptionOptions.addToCalendar ? '#0A84FF' : '#F4F3F4'}
              ios_backgroundColor="#2C2C2E"
              onValueChange={() => handleToggleSwitch('addToCalendar')}
              value={subscriptionOptions.addToCalendar}
            />
          </View>

          <View style={styles.toggleOption}>
            <View style={styles.toggleOptionText}>
              <Text style={styles.optionLabel}>Receive Reminders</Text>
              <Text style={styles.optionDescription}>Get notifications when workouts are scheduled</Text>
            </View>
            <Switch
              trackColor={{ false: '#2C2C2E', true: 'rgba(10, 132, 255, 0.3)' }}
              thumbColor={subscriptionOptions.receiveReminders ? '#0A84FF' : '#F4F3F4'}
              ios_backgroundColor="#2C2C2E"
              onValueChange={() => handleToggleSwitch('receiveReminders')}
              value={subscriptionOptions.receiveReminders}
            />
          </View>

          <View style={styles.toggleOption}>
            <View style={styles.toggleOptionText}>
              <Text style={styles.optionLabel}>Auto-Adapt to Progress</Text>
              <Text style={styles.optionDescription}>Automatically adjust weights based on performance</Text>
            </View>
            <Switch
              trackColor={{ false: '#2C2C2E', true: 'rgba(10, 132, 255, 0.3)' }}
              thumbColor={subscriptionOptions.adaptToProgress ? '#0A84FF' : '#F4F3F4'}
              ios_backgroundColor="#2C2C2E"
              onValueChange={() => handleToggleSwitch('adaptToProgress')}
              value={subscriptionOptions.adaptToProgress}
            />
          </View>

          <View style={styles.toggleOption}>
            <View style={styles.toggleOptionText}>
              <Text style={styles.optionLabel}>Auto-Schedule Deloads</Text>
              <Text style={styles.optionDescription}>Schedule deload weeks based on program phases</Text>
            </View>
            <Switch
              trackColor={{ false: '#2C2C2E', true: 'rgba(10, 132, 255, 0.3)' }}
              thumbColor={subscriptionOptions.autoScheduleDeloads ? '#0A84FF' : '#F4F3F4'}
              ios_backgroundColor="#2C2C2E"
              onValueChange={() => handleToggleSwitch('autoScheduleDeloads')}
              value={subscriptionOptions.autoScheduleDeloads}
            />
          </View>
        </View>

        {/* Further Information */}
        <View style={styles.infoBox}>
          <Ionicons name="information-circle-outline" size={22} color="#0A84FF" style={styles.infoIcon} />
          <Text style={styles.infoText}>
            You can modify workouts, skip sessions, or pause the program at any time. All program data will be saved to your account.
          </Text>
        </View>
      </ScrollView>

      {/* Subscribe Button */}
      <View style={styles.subscribeContainer}>
        <BlurView intensity={80} tint="dark" style={styles.subscribeBlur}>
          <TouchableOpacity
            style={styles.subscribeButton}
            onPress={handleSubscribe}
            activeOpacity={0.8}
          >
            <Text style={styles.subscribeText}>Confirm & Subscribe</Text>
          </TouchableOpacity>
        </BlurView>
      </View>
    </View>
  );
}

const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000000',
  },
  loadingText: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 55 : 20,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    overflow: 'hidden',
  },
  backButtonBlur: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderButton: {
    width: 36,
    height: 36,
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  programCard: {
    margin: 16,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#1C1C1E',
    borderWidth: 1,
    borderColor: '#2C2C2E',
  },
  programThumbnail: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
  },
  programInfo: {
    flex: 1,
  },
  programTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  programDuration: {
    fontSize: 14,
    color: '#A0A0A0',
  },
  section: {
    margin: 16,
    marginTop: 0,
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#1C1C1E',
    borderWidth: 1,
    borderColor: '#2C2C2E',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  dateOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  dateOptionText: {
    flex: 1,
  },
  optionLabel: {
    fontSize: 16,
    color: '#FFFFFF',
    marginBottom: 4,
  },
  dateValue: {
    fontSize: 14,
    color: '#0A84FF',
  },
  toggleOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  toggleOptionText: {
    flex: 1,
    marginRight: 12,
  },
  optionDescription: {
    fontSize: 14,
    color: '#A0A0A0',
  },
  infoBox: {
    margin: 16,
    padding: 16,
    borderRadius: 12,
    backgroundColor: 'rgba(10, 132, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(10, 132, 255, 0.3)',
    flexDirection: 'row',
  },
  infoIcon: {
    marginRight: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: '#A0A0A0',
    lineHeight: 20,
  },
  subscribeContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    overflow: 'hidden',
  },
  subscribeBlur: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    paddingBottom: Platform.OS === 'ios' ? 34 : 16,
  },
  subscribeButton: {
    backgroundColor: '#0A84FF',
    height: 50,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  subscribeText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
}); 