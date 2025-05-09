import IMessagePageWrapper from '@/components/layout/iMessagePageWrapper';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function WorkoutsScreen() {
  const router = useRouter();

  const handleWorkoutPress = (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(`/workout/detail/${id}` as any);
  };

  const handleCreateTemplate = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push('/workout/template/create' as any);
  };

  return (
    <IMessagePageWrapper
      title="Workouts"
      subtitle="Track your fitness routine"
      showHeader={false}
    >
      <View style={styles.mainTitleContainer}>
        <Text style={styles.mainTitle}>Workouts</Text>
        <Text style={styles.mainSubtitle}>Track your fitness routine</Text>
      </View>

      <View style={styles.actionsContainer}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => router.push('/workout/active' as any)}
          activeOpacity={0.8}
        >
          <Ionicons name="play" size={22} color="#FFFFFF" />
          <Text style={styles.actionButtonText}>Start Workout</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={handleCreateTemplate}
          activeOpacity={0.8}
        >
          <Ionicons name="add" size={22} color="#FFFFFF" />
          <Text style={styles.actionButtonText}>Create Template</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Recent Workouts</Text>
        <TouchableOpacity onPress={() => router.push('/workout/history' as any)}>
          <Text style={styles.viewAllText}>View All</Text>
        </TouchableOpacity>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.recentWorkoutsContainer}>
        {/* Import at the top of the file is not working, so importing here */}
        {(() => {
          const { WorkoutCard } = require('@/components/design-system/cards');
          return (
            <>
              <WorkoutCard
                workout={{
                  id: "1",
                  title: "Upper Body",
                  exerciseCount: 7,
                  duration: 45 * 60, // 45 minutes in seconds
                  date: "Today",
                }}
                variant="default"
                onPress={handleWorkoutPress}
              />
              <WorkoutCard
                workout={{
                  id: "2",
                  title: "Leg Day",
                  exerciseCount: 6,
                  duration: 50 * 60, // 50 minutes in seconds
                  date: "Yesterday",
                }}
                variant="default"
                onPress={handleWorkoutPress}
              />
              <WorkoutCard
                workout={{
                  id: "3",
                  title: "Core Focus",
                  exerciseCount: 5,
                  duration: 30 * 60, // 30 minutes in seconds
                  date: "2 days ago",
                }}
                variant="default"
                onPress={handleWorkoutPress}
              />
            </>
          );
        })()}
      </ScrollView>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>My Templates</Text>
        <TouchableOpacity onPress={() => router.push('/workout/template' as any)}>
          <Text style={styles.viewAllText}>View All</Text>
        </TouchableOpacity>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.templatesContainer}>
        <TemplateCard
          title="Push-Pull-Legs"
          exercises={12}
          id="t1"
          onPress={handleWorkoutPress}
        />
        <TemplateCard
          title="5x5 Strength"
          exercises={5}
          id="t2"
          onPress={handleWorkoutPress}
        />
        <TemplateCard
          title="HIIT Circuit"
          exercises={8}
          id="t3"
          onPress={handleWorkoutPress}
        />
      </ScrollView>
    </IMessagePageWrapper>
  );
}

// Using the design system WorkoutCard component now
// This component is kept for reference but no longer used

interface TemplateCardProps {
  title: string;
  exercises: number;
  id: string;
  onPress: (id: string) => void;
}

const TemplateCard: React.FC<TemplateCardProps> = ({ title, exercises, id, onPress }) => {
  // Import design system tokens
  const { colors } = require('@/components/design-system/tokens');

  // Get template icon color based on workout name
  const getTemplateIconColor = () => {
    if (title.toLowerCase().includes('push-pull-legs') ||
        title.toLowerCase().includes('ppl')) {
      return colors.palette.purple500; // Purple
    } else if (title.toLowerCase().includes('strength') ||
              title.toLowerCase().includes('5x5')) {
      return colors.palette.blue500; // Blue
    } else if (title.toLowerCase().includes('hiit') ||
              title.toLowerCase().includes('circuit') ||
              title.toLowerCase().includes('cardio')) {
      return colors.palette.orange500; // Orange
    }
    return colors.palette.green500; // Green default for templates
  };

  return (
    <TouchableOpacity
      style={styles.darkCard}
      onPress={() => onPress(id)}
      activeOpacity={0.8}
    >
      <View style={styles.cardContent}>
        {/* Card header with template name and icon */}
        <View style={styles.darkCardHeader}>
          <View style={[styles.workoutIcon, { backgroundColor: getTemplateIconColor() }]} />
          <Text style={styles.darkCardTitle}>{title}</Text>
        </View>

        {/* Stats row with exercises and start button */}
        <View style={styles.darkStatsRow}>
          <View style={styles.darkStatItem}>
            <Ionicons name="barbell-outline" size={16} color={colors.light.icon.secondary} />
            <Text style={styles.darkStatValue}>{exercises} exercises</Text>
          </View>

          <View style={styles.darkStartContainer}>
            <Ionicons name="play-circle" size={16} color={colors.palette.blue500} />
            <Text style={styles.darkStartText}>Start</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create(() => {
  // Import design system tokens
  const { colors, typography, spacing } = require('@/components/design-system/tokens');

  return {
    mainTitleContainer: {
      paddingHorizontal: spacing.spacing.lg,
      paddingTop: spacing.spacing.md,
      paddingBottom: spacing.spacing.sm,
    },
    mainTitle: {
      ...typography.textVariants.h1,
      color: colors.light.text.primary,
    },
    mainSubtitle: {
      ...typography.textVariants.body,
      color: colors.light.text.secondary,
      marginTop: spacing.spacing.xs,
    },
    actionsContainer: {
      flexDirection: 'row',
      marginTop: spacing.spacing.sm,
      marginBottom: spacing.spacing.xxl,
      gap: spacing.spacing.sm,
    },
    actionButton: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.light.brand.primary,
      borderRadius: spacing.layout.borderRadius.md,
      paddingVertical: spacing.spacing.md,
      paddingHorizontal: spacing.spacing.lg,
    },
    actionButtonText: {
      ...typography.textVariants.button,
      color: colors.light.text.inverse,
      marginLeft: spacing.spacing.sm,
    },
    sectionHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: spacing.spacing.lg,
    },
    sectionTitle: {
      ...typography.textVariants.h3,
      color: colors.light.text.primary,
    },
    viewAllText: {
      ...typography.textVariants.link,
      color: colors.light.brand.primary,
    },
    recentWorkoutsContainer: {
      marginBottom: spacing.spacing.xxl,
    },
    templatesContainer: {
      marginBottom: spacing.spacing.xxl,
    },
    cardContent: {
      padding: spacing.spacing.md,
    },
    workoutIcon: {
      width: 32,
      height: 32,
      borderRadius: spacing.layout.borderRadius.sm,
      marginRight: spacing.spacing.md,
    },

    // Dark card styles
    darkCard: {
      width: 240,
      marginRight: spacing.spacing.md,
      borderRadius: spacing.layout.borderRadius.md,
      marginBottom: spacing.spacing.md,
      backgroundColor: colors.dark.background.card,
      overflow: 'hidden',
      borderWidth: spacing.layout.borderWidth.thin,
      borderColor: colors.dark.border.primary,
    },
    darkCardHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: spacing.spacing.xs,
    },
    darkCardTitle: {
      ...typography.textVariants.bodySemiBold,
      color: colors.dark.text.primary,
      flex: 1,
    },
    darkDateText: {
      ...typography.textVariants.bodySmall,
      color: colors.dark.text.secondary,
      marginBottom: spacing.spacing.sm,
    },
    darkStatsRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: spacing.spacing.xs,
      flexWrap: 'wrap',
      justifyContent: 'space-between',
    },
    darkStatItem: {
      flexDirection: 'row',
      alignItems: 'center',
      marginRight: spacing.spacing.lg,
      marginBottom: spacing.spacing.xs,
    },
    darkStatValue: {
      ...typography.textVariants.bodySmall,
      color: colors.dark.text.primary,
      marginLeft: spacing.spacing.xs,
      fontWeight: typography.fontWeights.medium,
    },
    darkStartContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginLeft: 'auto',
    },
    darkStartText: {
      ...typography.textVariants.bodySmallSemiBold,
      color: colors.dark.brand.primary,
      marginLeft: spacing.spacing.xs,
    },
  };
})();