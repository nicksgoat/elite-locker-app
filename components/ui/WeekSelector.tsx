import * as Haptics from 'expo-haptics';
import React, { useEffect } from 'react';
import {
    Dimensions,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSpring
} from 'react-native-reanimated';

interface WeekSelectorProps {
  totalWeeks: number;
  selectedWeek: number;
  onWeekPress: (week: number) => void;
}

export default function WeekSelector({
  totalWeeks,
  selectedWeek,
  onWeekPress
}: WeekSelectorProps) {
  // Animation values
  const buttonScale = useSharedValue(1);
  const selectedOpacity = useSharedValue(0);

  useEffect(() => {
    // Animate the selected week indicator
    selectedOpacity.value = withSpring(1, { damping: 15 });
  }, [selectedWeek]);

  const handleWeekPress = (week: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    // Animate button press
    buttonScale.value = withSpring(0.95, { damping: 10 }, () => {
      buttonScale.value = withSpring(1);
    });

    // Reset opacity for animation
    selectedOpacity.value = 0;

    onWeekPress(week);
  };

  // Animated style for the button
  const animatedButtonStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: buttonScale.value }],
    };
  });

  // Animated style for the selected indicator
  const animatedSelectedStyle = useAnimatedStyle(() => {
    return {
      opacity: selectedOpacity.value,
    };
  });

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {Array.from({ length: totalWeeks }, (_, i) => i + 1).map(week => {
          const isSelected = selectedWeek === week;

          return (
            <Animated.View
              key={week}
              style={isSelected ? animatedButtonStyle : undefined}
            >
              <TouchableOpacity
                style={[
                  styles.weekButton,
                  isSelected && styles.weekButtonSelected
                ]}
                onPress={() => handleWeekPress(week)}
                activeOpacity={0.7}
              >
                <Text style={[
                  styles.weekText,
                  isSelected && styles.weekTextSelected
                ]}>
                  WEEK {week}
                </Text>

                {isSelected && (
                  <Animated.View
                    style={[styles.selectedIndicator, animatedSelectedStyle]}
                  />
                )}
              </TouchableOpacity>
            </Animated.View>
          );
        })}
      </ScrollView>
    </View>
  );
}

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  scrollContent: {
    paddingHorizontal: 16,
  },
  weekButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginRight: 8,
    borderRadius: 20,
    backgroundColor: '#2C2C2E',
    minWidth: 80,
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  weekButtonSelected: {
    backgroundColor: '#000000',
    borderWidth: 1,
    borderColor: '#FFFFFF',
  },
  weekText: {
    color: '#8E8E93',
    fontSize: 12,
    fontWeight: '600',
  },
  weekTextSelected: {
    color: '#FFFFFF',
  },
  selectedIndicator: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: '#0A84FF',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
});
