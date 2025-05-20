import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, ScrollView, Alert } from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { ExpoSpeechRecognitionModule, useSpeechRecognitionEvent } from 'expo-speech-recognition';
import { processWorkoutInput } from '@/services/api/aiService';
import { EXERCISE_LIBRARY } from '../ui/ExerciseLibraryModal';

// Define workout and exercise types for TypeScript
interface AIExercise {
  id?: string;
  name: string;
  sets: number;
  targetReps: string;
  restTime?: number;
  category?: string;
  equipment?: string;
}

interface AIWorkout {
  name: string;
  exercises: AIExercise[];
  date: string;
  duration: number;
  categories: string[];
}

interface VoiceWorkoutCreatorProps {
  onClose: () => void;
  onWorkoutCreated: (workout: AIWorkout) => void;
}

const VoiceWorkoutCreator: React.FC<VoiceWorkoutCreatorProps> = ({ 
  onClose, 
  onWorkoutCreated 
}) => {
  const [recognizing, setRecognizing] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [textInput, setTextInput] = useState('');
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | undefined>();
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [usingOpenAI, setUsingOpenAI] = useState(!!process.env.EXPO_PUBLIC_OPENAI_API_KEY);
  const scrollViewRef = useRef<ScrollView>(null);
  const router = useRouter();

  // Check for permissions when component mounts
  useEffect(() => {
    checkPermissions();
  }, []);

  const checkPermissions = async () => {
    try {
      const result = await ExpoSpeechRecognitionModule.getPermissionsAsync();
      setPermissionGranted(result.granted);
    } catch (err) {
      console.error('Error checking permissions:', err);
    }
  };

  const requestPermissions = async () => {
    try {
      const result = await ExpoSpeechRecognitionModule.requestPermissionsAsync();
      setPermissionGranted(result.granted);
      return result.granted;
    } catch (err) {
      console.error('Error requesting permissions:', err);
      return false;
    }
  };

  // Speech recognition event handlers
  useSpeechRecognitionEvent("start", () => {
    setRecognizing(true);
    setError(undefined);
  });

  useSpeechRecognitionEvent("end", () => {
    setRecognizing(false);
  });

  useSpeechRecognitionEvent("error", (event) => {
    console.log("Speech recognition error:", event.error, event.message);
    setError(event.message || "An error occurred during speech recognition");
    setRecognizing(false);
  });

  useSpeechRecognitionEvent("result", (event) => {
    if (event.results && event.results.length > 0) {
      setTranscript(event.results[0]?.transcript || '');
      
      // Auto-scroll to bottom of text
      if (scrollViewRef.current) {
        scrollViewRef.current.scrollToEnd({ animated: true });
      }
    }
  });

  const handleStartListening = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    // Check/request permissions if needed
    if (!permissionGranted) {
      const granted = await requestPermissions();
      if (!granted) {
        Alert.alert(
          "Permission Required",
          "Microphone permission is needed to use voice input. Please enable it in your settings.",
          [{ text: "OK" }]
        );
        return;
      }
    }
    
    // Clear previous results
    setTranscript('');
    
    // Start speech recognition
    ExpoSpeechRecognitionModule.start({
      lang: "en-US",
      interimResults: true,
      continuous: true,
    });
  };

  const handleStopListening = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    ExpoSpeechRecognitionModule.stop();
  };

  const handleSubmit = async (inputText: string) => {
    if (!inputText.trim()) {
      Alert.alert("Error", "Please provide a workout description");
      return;
    }
    
    try {
      setProcessing(true);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      
      // Process the workout description
      const workout = await processWorkoutInput(inputText) as AIWorkout;
      
      if (workout.exercises.length === 0) {
        Alert.alert(
          "No Exercises Found",
          "Could not identify any exercises in your description. Please try again with exercise names from our library.",
          [
            { 
              text: "Show Exercise Library", 
              onPress: () => {
                // Here you could show the exercise library
                Alert.alert("Exercise Library", 
                  "Some common exercises include: " + 
                  EXERCISE_LIBRARY.slice(0, 5).map(e => e.name).join(", ") + 
                  " and more."
                );
              } 
            },
            { text: "OK" }
          ]
        );
        setProcessing(false);
        return;
      }
      
      // Call the callback with the created workout
      onWorkoutCreated(workout);
      
      // Reset state and close
      setTranscript('');
      setTextInput('');
      onClose();
      
    } catch (err) {
      console.error('Error processing workout:', err);
      Alert.alert("Error", "Failed to create workout. Please try again.");
    } finally {
      setProcessing(false);
    }
  };

  const handleCancel = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    // If currently recognizing, stop it
    if (recognizing) {
      ExpoSpeechRecognitionModule.stop();
    }
    
    onClose();
  };

  return (
    <BlurView intensity={30} tint="dark" style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Create Workout with AI</Text>
        <TouchableOpacity onPress={handleCancel} style={styles.closeButton}>
          <Ionicons name="close-circle" size={28} color="#8E8E93" />
        </TouchableOpacity>
      </View>
      
      <Text style={styles.instructions}>
        Describe your workout using voice or text. Include exercise names, sets, and reps.
        {usingOpenAI && (
          <Text style={styles.openaiLabel}> Powered by OpenAI</Text>
        )}
      </Text>
      
      {/* Voice input section */}
      <BlurView intensity={15} tint="dark" style={styles.voiceContainer}>
        <ScrollView 
          ref={scrollViewRef} 
          style={styles.transcriptContainer} 
          contentContainerStyle={styles.transcriptContent}
        >
          <Text style={styles.transcriptText}>
            {transcript || textInput || "Your workout will appear here..."}
          </Text>
        </ScrollView>
        
        <View style={styles.voiceButtonContainer}>
          {!recognizing ? (
            <TouchableOpacity
              style={styles.voiceButton}
              onPress={handleStartListening}
              disabled={processing}
            >
              <Ionicons name="mic" size={32} color="#FFFFFF" />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[styles.voiceButton, styles.voiceButtonActive]}
              onPress={handleStopListening}
            >
              <Ionicons name="stop" size={32} color="#FFFFFF" />
            </TouchableOpacity>
          )}
        </View>
      </BlurView>
      
      {/* Text input section */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.textInput}
          value={textInput}
          onChangeText={setTextInput}
          placeholder="Or type your workout here..."
          placeholderTextColor="#8E8E93"
          multiline
          numberOfLines={3}
          editable={!processing}
        />
      </View>
      
      {/* Example section */}
      <BlurView intensity={10} tint="dark" style={styles.exampleContainer}>
        <Text style={styles.exampleTitle}>Example:</Text>
        <Text style={styles.exampleText}>
          "Upper body workout with 4 sets of bench press at 8-10 reps, 3 sets of pull-ups, and barbell rows for 3 sets of 12 reps."
        </Text>
      </BlurView>
      
      {/* Action buttons */}
      <View style={styles.actionsContainer}>
        {error && <Text style={styles.errorText}>{error}</Text>}
        
        <TouchableOpacity
          style={styles.createButton}
          onPress={() => handleSubmit(transcript || textInput)}
          disabled={processing || (!transcript && !textInput)}
        >
          {processing ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <>
              <Ionicons name="fitness" size={20} color="#FFFFFF" style={styles.buttonIcon} />
              <Text style={styles.createButtonText}>Create Workout</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </BlurView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  closeButton: {
    padding: 5,
  },
  instructions: {
    fontSize: 16,
    color: '#CCCCCC',
    marginBottom: 20,
    lineHeight: 22,
  },
  openaiLabel: {
    fontSize: 14,
    color: '#10A37F',
    fontWeight: '600',
  },
  voiceContainer: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  transcriptContainer: {
    height: 150,
    padding: 16,
  },
  transcriptContent: {
    paddingBottom: 16,
  },
  transcriptText: {
    fontSize: 18,
    color: '#FFFFFF',
    lineHeight: 24,
  },
  voiceButtonContainer: {
    alignItems: 'center',
    paddingBottom: 16,
  },
  voiceButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(0, 122, 255, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  voiceButtonActive: {
    backgroundColor: 'rgba(255, 59, 48, 0.4)',
  },
  inputContainer: {
    marginBottom: 20,
  },
  textInput: {
    height: 100,
    backgroundColor: 'rgba(30, 30, 30, 0.8)',
    borderRadius: 12,
    padding: 16,
    color: '#FFFFFF',
    fontSize: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  exampleContainer: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  exampleTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  exampleText: {
    fontSize: 14,
    color: '#CCCCCC',
    fontStyle: 'italic',
    lineHeight: 20,
  },
  actionsContainer: {
    alignItems: 'center',
  },
  errorText: {
    color: '#FF3B30',
    marginBottom: 16,
    textAlign: 'center',
  },
  createButton: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0, 122, 255, 0.8)',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  buttonIcon: {
    marginRight: 8,
  },
  createButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
});

export default VoiceWorkoutCreator; 