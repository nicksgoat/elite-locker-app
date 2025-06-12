import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { useRouter } from 'expo-router';
import React from 'react';
import { ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

export default function WorkoutIndexScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const workoutOptions = [

    {
      title: 'Enhanced Workout Log',
      subtitle: 'Optimized offline workout logging with smart features',
      icon: 'fitness',
      route: '/workout/enhanced-log',
      color: '#0088BB',
    },
    {
      title: 'Quick Start Workout',
      subtitle: 'Start a workout with templates',
      icon: 'flash',
      route: '/workout/quick-start',
      color: '#32D74B',
    },
    {
      title: 'Active Workout',
      subtitle: 'Continue your current workout session',
      icon: 'play',
      route: '/workout/active',
      color: '#FF9500',
    },
    {
      title: 'Workout History',
      subtitle: 'View past workouts and progress',
      icon: 'time',
      route: '/workout/history',
      color: '#AF52DE',
    },
    {
      title: 'Create Workout',
      subtitle: 'Build a custom workout plan',
      icon: 'add-circle',
      route: '/workout/create',
      color: '#FF3B30',
    },
    {
      title: 'Test Enhanced System',
      subtitle: 'Verify offline workout optimization',
      icon: 'cog',
      route: '/workout/test-enhanced',
      color: '#AF52DE',
    },
  ];

  return (
    <SafeAreaView style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      <BlurView intensity={20} style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Workouts</Text>
          <Text style={styles.headerSubtitle}>Choose your training option</Text>
        </View>
      </BlurView>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {workoutOptions.map((option, index) => (
          <TouchableOpacity
            key={`workout-option-${option.title}-${index}`}
            style={styles.optionCard}
            onPress={() => router.push(option.route as any)}
            activeOpacity={0.8}
          >
            <BlurView intensity={10} style={styles.optionCardBlur}>
              <View style={styles.optionIcon}>
                <Ionicons name={option.icon as any} size={32} color={option.color} />
              </View>

              <View style={styles.optionContent}>
                <Text style={styles.optionTitle}>{option.title}</Text>
                <Text style={styles.optionSubtitle}>{option.subtitle}</Text>
              </View>

              <Ionicons name="chevron-forward" size={20} color="#666" />
            </BlurView>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  headerContent: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: '#FFF',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#888',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
  },
  optionCard: {
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden',
  },
  optionCardBlur: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  optionIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  optionContent: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFF',
    marginBottom: 4,
  },
  optionSubtitle: {
    fontSize: 14,
    color: '#888',
    lineHeight: 20,
  },
});