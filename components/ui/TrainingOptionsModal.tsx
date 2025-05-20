import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Dimensions,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';

const { width, height } = Dimensions.get('window');

interface TrainingOption {
  id: string;
  title: string;
  icon: string;
  color: string;
  route?: string;
  onPress?: () => void;
}

interface TrainingOptionsModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectAIWorkout: () => void;
}

const TrainingOptionsModal: React.FC<TrainingOptionsModalProps> = ({
  visible,
  onClose,
  onSelectAIWorkout,
}) => {
  const router = useRouter();

  // Define training options
  const trainingOptions: TrainingOption[] = [
    {
      id: 'new-workout',
      title: 'New Workout',
      icon: 'add-circle',
      color: '#FF2D55',
      route: '/workout/create',
    },
    {
      id: 'ai-workout',
      title: 'AI Workout Creator',
      icon: 'flash',
      color: '#FF9F0A',
      onPress: () => {
        console.log('AI Workout Creator selected');
        onSelectAIWorkout();
      },
    },
    {
      id: 'my-programs',
      title: 'My Programs',
      icon: 'calendar',
      color: '#5856D6',
      route: '/programs',
    },
    {
      id: 'exercise-library',
      title: 'Exercise Library',
      icon: 'barbell',
      color: '#FF9500',
      route: '/exercises',
    },
  ];

  // Handle option press
  const handleOptionPress = (option: TrainingOption) => {
    console.log(`Option pressed: ${option.id}`);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onClose();
    
    // Use setTimeout to allow the modal to close before navigation
    setTimeout(() => {
      if (option.onPress) {
        option.onPress();
      } else if (option.route) {
        router.push(option.route as any);
      }
    }, 300);
  };

  // Render an option item
  const renderOption = (option: TrainingOption) => (
    <TouchableOpacity
      key={option.id}
      style={styles.optionItem}
      onPress={() => handleOptionPress(option)}
      activeOpacity={0.8}
    >
      <View style={[styles.iconContainer, { backgroundColor: option.color }]}>
        <Ionicons name={option.icon as any} size={24} color="#FFFFFF" />
      </View>
      <Text style={styles.optionTitle}>{option.title}</Text>
    </TouchableOpacity>
  );

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={onClose}
        />
        
        <View style={styles.modalContent}>
          <BlurView intensity={80} tint="dark" style={styles.modalBlur}>
            <View style={styles.header}>
              <Text style={styles.headerTitle}>Training Options</Text>
            </View>
            
            <View style={styles.optionsContainer}>
              {trainingOptions.map(renderOption)}
            </View>
          </BlurView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: width * 0.85,
    maxHeight: height * 0.7,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  modalBlur: {
    width: '100%',
    height: '100%',
  },
  header: {
    padding: 16,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  optionsContainer: {
    padding: 12,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FFFFFF',
    flex: 1,
  },
});

export default TrainingOptionsModal; 