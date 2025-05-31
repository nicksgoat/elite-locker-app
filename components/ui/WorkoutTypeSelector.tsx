import { useWorkout } from '@/contexts/WorkoutContext';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

interface WorkoutTypeOption {
  id: string;
  type: 'template' | 'repeat' | 'quick_start';
  title: string;
  subtitle: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  badge?: string;
}

export default function WorkoutTypeSelector() {
  const router = useRouter();
  const { startTemplateWorkout, startRepeatWorkout, startQuickWorkout } = useWorkout();
  const [selectedType, setSelectedType] = useState<string | null>(null);

  const workoutTypes: WorkoutTypeOption[] = [
    {
      id: 'template',
      type: 'template',
      title: 'From Template',
      subtitle: 'Percentage-based programming',
      description: 'Uses your training max data to automatically calculate weights based on percentages. Perfect for structured periodization.',
      icon: 'calculator-outline',
      color: '#0A84FF',
      badge: 'SMART'
    },
    {
      id: 'repeat',
      type: 'repeat',
      title: 'Repeat Workout',
      subtitle: 'Exact copy of previous session',
      description: 'Repeats the exact weights, sets, and reps from a previous workout. Great for tracking consistency and progress.',
      icon: 'repeat-outline',
      color: '#32D74B',
      badge: 'CONSISTENT'
    },
    {
      id: 'quick_start',
      type: 'quick_start',
      title: 'Quick Start',
      subtitle: 'Build from scratch',
      description: 'Start with a blank workout and manually enter all weights. Maximum flexibility for custom training.',
      icon: 'flash-outline',
      color: '#FF9500',
      badge: 'FLEXIBLE'
    }
  ];

  const handleSelectType = (option: WorkoutTypeOption) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedType(option.id);
  };

  const handleStartWorkout = async () => {
    if (!selectedType) {
      Alert.alert('Select Type', 'Please select a workout type to continue.');
      return;
    }

    const option = workoutTypes.find(t => t.id === selectedType);
    if (!option) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      switch (option.type) {
        case 'template':
          // Navigate to template selection screen
          router.push('/workout/template-select');
          break;
        case 'repeat':
          // Navigate to workout history selection screen
          router.push('/workout/repeat-select');
          break;
        case 'quick_start':
          // Go directly to active workout for quick start
          await startQuickWorkout([]);
          router.push('/workout/active');
          break;
      }
    } catch (error) {
      console.error('Error starting workout:', error);
      Alert.alert('Error', 'Failed to start workout. Please try again.');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Choose Workout Type</Text>
        <Text style={styles.subtitle}>
          Select how you want to log your workout
        </Text>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {workoutTypes.map((option) => (
          <TouchableOpacity
            key={option.id}
            style={styles.optionContainer}
            onPress={() => handleSelectType(option)}
            activeOpacity={0.8}
          >
            <BlurView
              intensity={selectedType === option.id ? 80 : 50}
              tint="dark"
              style={[
                styles.optionBlur,
                selectedType === option.id && styles.selectedOption
              ]}
            >
              <View style={styles.optionContent}>
                <View style={styles.optionHeader}>
                  <View style={[styles.iconContainer, { backgroundColor: option.color }]}>
                    <Ionicons name={option.icon} size={24} color="#FFFFFF" />
                  </View>

                  <View style={styles.optionInfo}>
                    <View style={styles.titleRow}>
                      <Text style={styles.optionTitle}>{option.title}</Text>
                      {option.badge && (
                        <View style={[styles.badge, { backgroundColor: option.color }]}>
                          <Text style={styles.badgeText}>{option.badge}</Text>
                        </View>
                      )}
                    </View>
                    <Text style={styles.optionSubtitle}>{option.subtitle}</Text>
                  </View>

                  {selectedType === option.id && (
                    <View style={styles.checkmark}>
                      <Ionicons name="checkmark-circle" size={24} color={option.color} />
                    </View>
                  )}
                </View>

                <Text style={styles.optionDescription}>{option.description}</Text>
              </View>
            </BlurView>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.startButton,
            !selectedType && styles.startButtonDisabled
          ]}
          onPress={handleStartWorkout}
          disabled={!selectedType}
          activeOpacity={0.8}
        >
          <Text style={[
            styles.startButtonText,
            !selectedType && styles.startButtonTextDisabled
          ]}>
            Start Workout
          </Text>
          <Ionicons
            name="arrow-forward"
            size={20}
            color={selectedType ? "#FFFFFF" : "#666666"}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#8E8E93',
    lineHeight: 22,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  optionContainer: {
    marginBottom: 16,
  },
  optionBlur: {
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  selectedOption: {
    borderColor: 'rgba(10, 132, 255, 0.5)',
    borderWidth: 2,
  },
  optionContent: {
    padding: 20,
  },
  optionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  optionInfo: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  optionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginRight: 8,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  optionSubtitle: {
    fontSize: 14,
    color: '#8E8E93',
  },
  checkmark: {
    marginLeft: 12,
  },
  optionDescription: {
    fontSize: 14,
    color: '#AEAEB2',
    lineHeight: 20,
  },
  footer: {
    padding: 20,
    paddingBottom: 40,
  },
  startButton: {
    backgroundColor: '#0A84FF',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  startButtonDisabled: {
    backgroundColor: '#1C1C1E',
  },
  startButtonText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#FFFFFF',
    marginRight: 8,
  },
  startButtonTextDisabled: {
    color: '#666666',
  },
});
