import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity,
  Dimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { ProgramPhase } from '../../contexts/ProgramContext';

interface ProgramWeekViewProps {
  phases: ProgramPhase[];
  currentWeek: number;
  totalWeeks: number;
  onWeekPress: (week: number) => void;
  selectedWeek: number;
}

export default function ProgramWeekView({
  phases,
  currentWeek,
  totalWeeks,
  onWeekPress,
  selectedWeek
}: ProgramWeekViewProps) {
  // Calculate which week belongs to which phase
  const getPhaseForWeek = (weekNum: number): ProgramPhase | null => {
    let weekCount = 0;
    for (const phase of phases) {
      weekCount += phase.weeks;
      if (weekNum <= weekCount) {
        return phase;
      }
    }
    return null;
  };
  
  // Get week status (completed, current, future)
  const getWeekStatus = (weekNum: number): 'completed' | 'current' | 'future' => {
    if (weekNum < currentWeek) {
      return 'completed';
    } else if (weekNum === currentWeek) {
      return 'current';
    } else {
      return 'future';
    }
  };
  
  // Handle week button press
  const handleWeekPress = (weekNum: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onWeekPress(weekNum);
  };

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {Array.from({ length: totalWeeks }, (_, i) => i + 1).map(weekNum => {
          const phase = getPhaseForWeek(weekNum);
          const status = getWeekStatus(weekNum);
          const isSelected = selectedWeek === weekNum;
          
          return (
            <TouchableOpacity
              key={weekNum}
              style={[
                styles.weekButton,
                isSelected && styles.weekButtonSelected,
                status === 'current' && styles.weekButtonCurrent,
                phase?.deload && styles.weekButtonDeload
              ]}
              onPress={() => handleWeekPress(weekNum)}
              activeOpacity={0.7}
            >
              <View style={styles.weekNumberContainer}>
                <Text style={[
                  styles.weekNumber,
                  isSelected && styles.weekNumberSelected,
                  phase?.deload && styles.weekNumberDeload
                ]}>
                  {weekNum}
                </Text>
                
                {status === 'completed' && (
                  <View style={styles.completedBadge}>
                    <Ionicons name="checkmark" size={10} color="#FFF" />
                  </View>
                )}
              </View>
              
              <Text style={[
                styles.weekLabel,
                isSelected && styles.weekLabelSelected,
                phase?.deload && styles.weekLabelDeload
              ]}>
                {phase?.deload ? 'Deload' : 'Week'}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    marginVertical: 12,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  weekButton: {
    width: 60,
    height: 70,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    borderRadius: 12,
    backgroundColor: '#1C1C1E',
    borderWidth: 1,
    borderColor: '#2C2C2E',
  },
  weekButtonSelected: {
    backgroundColor: 'rgba(10, 132, 255, 0.2)',
    borderColor: '#0A84FF',
  },
  weekButtonCurrent: {
    borderColor: '#0A84FF',
  },
  weekButtonDeload: {
    backgroundColor: 'rgba(255, 149, 0, 0.2)',
    borderColor: '#FF9500',
  },
  weekNumberContainer: {
    position: 'relative',
    marginBottom: 6,
  },
  weekNumber: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  weekNumberSelected: {
    color: '#0A84FF',
  },
  weekNumberDeload: {
    color: '#FF9500',
  },
  completedBadge: {
    position: 'absolute',
    top: -4,
    right: -12,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#0A84FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  weekLabel: {
    fontSize: 12,
    color: '#A0A0A0',
  },
  weekLabelSelected: {
    color: '#0A84FF',
    fontWeight: '600',
  },
  weekLabelDeload: {
    color: '#FF9500',
    fontWeight: '600',
  },
}); 