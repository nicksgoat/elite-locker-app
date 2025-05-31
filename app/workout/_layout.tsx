import { Stack } from 'expo-router';

export default function WorkoutLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        gestureEnabled: true,
        animation: 'slide_from_right',
        contentStyle: {
          backgroundColor: '#000000',
        },
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: 'Workouts',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="start"
        options={{
          title: 'Start Workout',
          presentation: 'modal',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="template-select"
        options={{
          title: 'Select Template',
          presentation: 'modal',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="repeat-select"
        options={{
          title: 'Repeat Workout',
          presentation: 'modal',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="training-max-setup"
        options={{
          title: 'Set Training Maxes',
          presentation: 'modal',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="quick-start"
        options={{
          title: 'Quick Start',
          presentation: 'modal',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="active"
        options={{
          title: 'Active Workout',
          gestureEnabled: false,
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="log"
        options={{
          title: 'Log Workout',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="complete"
        options={{
          title: 'Workout Complete',
          gestureEnabled: false,
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="create"
        options={{
          title: 'Create Workout',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="history"
        options={{
          title: 'Workout History',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="run"
        options={{
          title: 'Run Workout',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="share-workout"
        options={{
          title: 'Share Workout',
          presentation: 'modal',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="detail/[id]"
        options={{
          title: 'Workout Details',
          headerShown: false,
        }}
      />
    </Stack>
  );
}
