import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View, ScrollView } from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';

interface DaySelectorProps {
  selectedDay: number;
  onDayPress: (day: number) => void;
  totalDays?: number;
}

const DAYS_OF_WEEK = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export default function DaySelector({ 
  selectedDay, 
  onDayPress,
  totalDays = 7
}: DaySelectorProps) {
  // Generate days array (1-based for easier understanding)
  const days = Array.from({ length: totalDays }, (_, i) => i + 1);

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Day</Text>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {days.map((day) => {
          const isSelected = day === selectedDay;
          
          return (
            <TouchableOpacity
              key={day}
              style={[
                styles.dayButton,
                isSelected && styles.selectedDayButton
              ]}
              onPress={() => onDayPress(day)}
              activeOpacity={0.7}
            >
              {isSelected ? (
                <BlurView intensity={30} tint="dark" style={styles.selectedBlur}>
                  <Text style={[styles.dayText, styles.selectedDayText]}>
                    {DAYS_OF_WEEK[day - 1]}
                  </Text>
                </BlurView>
              ) : (
                <Text style={styles.dayText}>{DAYS_OF_WEEK[day - 1]}</Text>
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  scrollContent: {
    paddingRight: 16,
  },
  dayButton: {
    width: 60,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  selectedDayButton: {
    borderColor: '#0A84FF',
    overflow: 'hidden',
  },
  selectedBlur: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 18,
  },
  dayText: {
    fontSize: 14,
    color: '#FFFFFF',
  },
  selectedDayText: {
    color: '#0A84FF',
    fontWeight: '600',
  },
});
