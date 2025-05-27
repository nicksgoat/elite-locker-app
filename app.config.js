export default {
  expo: {
    name: 'elite-locker',
    slug: 'elite-locker',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './assets/images/icon.png',
    scheme: 'elitelocker',
    userInterfaceStyle: 'automatic',
    newArchEnabled: true,
    ios: {
      supportsTablet: true,
      infoPlist: {
        NSLocationWhenInUseUsageDescription: 'This app needs access to your location to show event venues on maps and provide directions.',
        UIBackgroundModes: ['fetch'],
        NSMicrophoneUsageDescription: 'Allow Elite Locker to access your microphone for voice-controlled workout creation.',
        NSSpeechRecognitionUsageDescription: 'Allow Elite Locker to access speech recognition for voice-controlled workout creation.'
      }
    },
    android: {
      adaptiveIcon: {
        foregroundImage: './assets/images/adaptive-icon.png',
        backgroundColor: '#ffffff'
      },
      edgeToEdgeEnabled: true,
      permissions: [
        'ACCESS_FINE_LOCATION',
        'ACCESS_COARSE_LOCATION',
        'RECORD_AUDIO'
      ]
    },
    web: {
      bundler: 'metro',
      output: 'static',
      favicon: './assets/images/favicon.png'
    },
    plugins: [
      'expo-router',
      [
        'expo-splash-screen',
        {
          image: './assets/images/splash-icon.png',
          imageWidth: 200,
          resizeMode: 'contain',
          backgroundColor: '#ffffff'
        }
      ],
      [
        'expo-location',
        {
          locationAlwaysAndWhenInUsePermission: 'Allow Elite Locker to use your location to show nearby events and provide directions to event venues.'
        }
      ],
      [
        'expo-speech-recognition',
        {
          microphonePermission: 'Allow Elite Locker to access your microphone for voice-controlled workout creation.',
          speechRecognitionPermission: 'Allow Elite Locker to access speech recognition for voice-controlled workout creation.'
        }
      ],
      'expo-font',
      'expo-background-fetch',
      'expo-task-manager'
    ],
    experiments: {
      typedRoutes: true
    },
    extra: {
      // Provide fallback values for missing environment variables
      supabaseUrl: process.env.SUPABASE_URL || process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
      supabaseAnonKey: process.env.SUPABASE_ANON_KEY || process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key'
    }
  }
};
