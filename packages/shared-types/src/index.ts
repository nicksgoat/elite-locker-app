// Shared types for Elite Locker Streaming Integration

// User and Authentication Types
export interface StreamingUser {
  id: string;
  username: string;
  displayName: string;
  profileImage?: string;
  streamingEnabled: boolean;
  overlayUrl: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface StreamingSettings {
  userId: string;
  theme: OverlayTheme;
  dataSharing: DataSharingSettings;
  overlayPosition: OverlayPosition;
  customColors?: CustomColors;
  showPersonalStats: boolean;
  showGoals: boolean;
  showCurrentExercise: boolean;
  showSessionStats: boolean;
}

// Workout Data Types
export interface WorkoutUpdate {
  sessionId: string;
  userId: string;
  currentExercise: {
    name: string;
    category: string;
    muscleGroups: string[];
  };
  currentSet: {
    setNumber: number;
    reps: number;
    weight: number;
    restTime?: number;
    completed: boolean;
  };
  sessionProgress: {
    exercisesCompleted: number;
    totalExercises: number;
    timeElapsed: number; // in seconds
    estimatedTimeRemaining?: number;
  };
  timestamp: Date;
}

export interface SessionStats {
  sessionId: string;
  userId: string;
  totalTime: number; // in seconds
  exercisesCompleted: number;
  totalSets: number;
  totalReps: number;
  totalVolume: number; // weight * reps
  caloriesBurned?: number;
  averageRestTime?: number;
  personalRecords: PersonalRecord[];
  timestamp: Date;
}

export interface PersonalRecord {
  exerciseName: string;
  type: 'weight' | 'reps' | 'volume' | 'time';
  value: number;
  previousValue?: number;
  improvement: number;
}

// Overlay Configuration Types
export type OverlayTheme = 'default' | 'neon' | 'minimal' | 'gaming';

export interface OverlayPosition {
  x: number; // percentage from left
  y: number; // percentage from top
  width: number; // percentage of screen width
  height: number; // percentage of screen height
}

export interface CustomColors {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  text: string;
}

export interface DataSharingSettings {
  shareCurrentExercise: boolean;
  sharePersonalStats: boolean;
  shareGoals: boolean;
  shareProgressPhotos: boolean;
  shareWorkoutNotes: boolean;
  allowViewerInteraction: boolean;
}

// Socket.io Event Types
export interface ServerToClientEvents {
  workoutUpdate: (data: WorkoutUpdate) => void;
  sessionStats: (data: SessionStats) => void;
  userConnected: (data: { userId: string; username: string }) => void;
  userDisconnected: (data: { userId: string }) => void;
  error: (data: { message: string; code?: string }) => void;
  connectionStatus: (data: { status: 'connected' | 'disconnected' | 'reconnecting' }) => void;
}

export interface ClientToServerEvents {
  joinStream: (data: { overlayUrl: string }) => void;
  leaveStream: (data: { overlayUrl: string }) => void;
  publishWorkoutUpdate: (data: WorkoutUpdate) => void;
  publishSessionStats: (data: SessionStats) => void;
  requestCurrentData: (data: { overlayUrl: string }) => void;
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    code?: string;
    details?: any;
  };
}

export interface StreamingApiEndpoints {
  '/api/streaming/enable': {
    POST: {
      body: { userId: string };
      response: ApiResponse<{ overlayUrl: string }>;
    };
  };
  '/api/streaming/settings': {
    PUT: {
      body: Partial<StreamingSettings>;
      response: ApiResponse<StreamingSettings>;
    };
    GET: {
      query: { userId: string };
      response: ApiResponse<StreamingSettings>;
    };
  };
  '/api/streaming/overlay/:overlayUrl': {
    GET: {
      response: ApiResponse<{
        user: StreamingUser;
        settings: StreamingSettings;
        currentWorkout?: WorkoutUpdate;
        sessionStats?: SessionStats;
      }>;
    };
  };
}

// Database Models
export interface WorkoutSession {
  id: string;
  userId: string;
  name: string;
  startTime: Date;
  endTime?: Date;
  exercises: Exercise[];
  isStreaming: boolean;
  streamViewers?: number;
  status: 'active' | 'completed' | 'paused';
}

export interface Exercise {
  id: string;
  name: string;
  category: string;
  muscleGroups: string[];
  sets: ExerciseSet[];
  notes?: string;
  restTime?: number;
}

export interface ExerciseSet {
  setNumber: number;
  reps: number;
  weight: number;
  restTime?: number;
  completed: boolean;
  timestamp: Date;
}

// Error Types
export class StreamingError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 500
  ) {
    super(message);
    this.name = 'StreamingError';
  }
}

// Utility Types
export type StreamingEventType = keyof ServerToClientEvents;
export type StreamingStatus = 'inactive' | 'starting' | 'active' | 'paused' | 'stopping';

// Animation and UI Types
export interface AnimationConfig {
  duration: number;
  easing: 'linear' | 'ease-in' | 'ease-out' | 'ease-in-out';
  delay?: number;
}

export interface OverlayComponent {
  id: string;
  type: 'workout-panel' | 'session-stats' | 'progress-bar' | 'achievement-popup';
  visible: boolean;
  position: OverlayPosition;
  animation?: AnimationConfig;
}

// Twitch Integration Types
export interface TwitchTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  scope: string[];
  tokenType: 'bearer';
}

export interface TwitchUser {
  id: string;
  login: string;
  displayName: string;
  type: string;
  broadcasterType: string;
  description: string;
  profileImageUrl: string;
  offlineImageUrl: string;
  viewCount: number;
  email?: string;
  createdAt: string;
}

export interface TwitchStream {
  id: string;
  userId: string;
  userLogin: string;
  userName: string;
  gameId: string;
  gameName: string;
  type: 'live' | '';
  title: string;
  viewerCount: number;
  startedAt: string;
  language: string;
  thumbnailUrl: string;
  tagIds: string[];
  tags: string[];
  isMature: boolean;
}

export interface TwitchChatMessage {
  id: string;
  userId: string;
  username: string;
  displayName: string;
  message: string;
  timestamp: Date;
  badges: Record<string, string>;
  color?: string;
  emotes: Record<string, string[]>;
  isSubscriber: boolean;
  isModerator: boolean;
  isVip: boolean;
  isBroadcaster: boolean;
}

export interface TwitchChannelPointReward {
  id: string;
  title: string;
  prompt: string;
  cost: number;
  image?: {
    url1x: string;
    url2x: string;
    url4x: string;
  };
  defaultImage: {
    url1x: string;
    url2x: string;
    url4x: string;
  };
  backgroundColor: string;
  isEnabled: boolean;
  isUserInputRequired: boolean;
  maxPerStreamSetting: {
    isEnabled: boolean;
    maxPerStream: number;
  };
  maxPerUserPerStreamSetting: {
    isEnabled: boolean;
    maxPerUserPerStream: number;
  };
  globalCooldownSetting: {
    isEnabled: boolean;
    globalCooldownSeconds: number;
  };
  isPaused: boolean;
  isInStock: boolean;
  shouldRedemptionsSkipRequestQueue: boolean;
  redemptionsRedeemedCurrentStream?: number;
  cooldownExpiresAt?: string;
}

export interface TwitchChannelPointRedemption {
  id: string;
  userId: string;
  userName: string;
  userDisplayName: string;
  userInput?: string;
  status: 'UNFULFILLED' | 'FULFILLED' | 'CANCELED';
  redeemedAt: string;
  reward: TwitchChannelPointReward;
}

export interface TwitchChatCommand {
  command: string;
  description: string;
  cooldown: number; // seconds
  modOnly: boolean;
  subscriberOnly: boolean;
  enabled: boolean;
  response?: string;
  action?: 'workout_stats' | 'current_exercise' | 'session_time' | 'pr_list' | 'challenge_user';
}

export interface TwitchIntegrationSettings {
  userId: string;
  twitchUserId?: string;
  twitchUsername?: string;
  isConnected: boolean;
  chatBotEnabled: boolean;
  autoUpdateStreamTitle: boolean;
  streamTitleTemplate: string; // e.g., "Working out: {exercise} | {sets} sets done"
  chatCommands: TwitchChatCommand[];
  channelPointRewards: {
    addReps: TwitchChannelPointReward;
    chooseExercise: TwitchChannelPointReward;
    restChallenge: TwitchChannelPointReward;
    workoutMotivation: TwitchChannelPointReward;
  };
  moderationSettings: {
    allowViewerChallenges: boolean;
    maxChallengeReps: number;
    cooldownBetweenChallenges: number;
  };
}

export interface WorkoutChallenge {
  id: string;
  challengerId: string;
  challengerName: string;
  targetUserId: string;
  type: 'reps' | 'time' | 'weight' | 'exercise';
  description: string;
  target: number;
  current: number;
  status: 'pending' | 'accepted' | 'completed' | 'failed' | 'expired';
  createdAt: Date;
  expiresAt: Date;
  reward?: {
    type: 'channel_points' | 'follow' | 'subscription';
    amount?: number;
  };
}

export interface TwitchEventSubNotification {
  subscription: {
    id: string;
    type: string;
    version: string;
    status: string;
    cost: number;
    condition: Record<string, any>;
    transport: {
      method: string;
      callback: string;
    };
    createdAt: string;
  };
  event: Record<string, any>;
}

// Extended Socket.io Events for Twitch Integration
export interface TwitchServerToClientEvents extends ServerToClientEvents {
  twitchChatMessage: (data: TwitchChatMessage) => void;
  twitchChannelPointRedemption: (data: TwitchChannelPointRedemption) => void;
  twitchStreamUpdate: (data: TwitchStream) => void;
  workoutChallenge: (data: WorkoutChallenge) => void;
  challengeUpdate: (data: { challengeId: string; status: string; progress: number }) => void;
}

export interface TwitchClientToServerEvents extends ClientToServerEvents {
  connectTwitch: (data: { accessToken: string }) => void;
  disconnectTwitch: () => void;
  sendChatMessage: (data: { message: string }) => void;
  acceptChallenge: (data: { challengeId: string }) => void;
  updateChallengeProgress: (data: { challengeId: string; progress: number }) => void;
}
