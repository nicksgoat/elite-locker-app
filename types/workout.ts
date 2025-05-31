// Enhanced Exercise types for the exercise library system
export type MeasurementType =
  | 'weight_reps'
  | 'reps'
  | 'time_based'
  | 'distance'
  | 'rpe'
  | 'height'
  | 'bodyweight'
  | 'assisted';

export type MeasurementConfig = {
  allowed: MeasurementType[];
  default: MeasurementType;
};

export type ExerciseTag = {
  id: string;
  name: string;
  label: string;
  groupName: string; // 'exercise_type', 'body_part', 'equipment', 'sport', 'attribute'
  colorHex: string;
};

export type Category = {
  id: string;
  name: string;
  description?: string;
  colorHex: string;
  iconName?: string;
  imageUrl?: string;
};

export type Exercise = {
  id: string;
  name: string;
  description?: string;
  notes?: string;
  muscleGroups?: string[];
  videoUrl?: string;
  thumbnailUrl?: string;
  measurementConfig: MeasurementConfig;
  category?: Category;
  categoryId?: string;
  tags?: ExerciseTag[];
  visibility: 'public' | 'private';
  createdBy?: string;
  createdAt?: Date;
  updatedAt?: Date;
  isFavorite?: boolean;
};

export type ExerciseTrainingMax = {
  id: string;
  userId: string;
  exerciseId: string;
  measurementType: MeasurementType;
  maxValue: number;
  maxReps: number;
  dateAchieved: Date;
  notes?: string;
  sourceType?: 'manual' | 'workout_tracker' | 'estimated';
  workoutId?: string;
  exerciseLogId?: string;
  // Optional related data for display
  workout?: {
    id: string;
    title: string;
    date: Date;
  };
  exerciseLog?: {
    id: string;
    sets: any;
  };
};

export type ExerciseLog = {
  id: string;
  workoutId: string;
  exerciseId: string;
  userId: string;
  measurementType: MeasurementType;
  sets: ExerciseSet[];
  notes?: string;
  personalRecords: number;
  totalVolume: number;
};

export type ExerciseSet = {
  id: string;
  weight?: number; // in kg
  reps?: number;
  duration?: number; // in seconds
  distance?: number; // in meters
  completed: boolean;
  notes?: string;
};

export type WorkoutExercise = {
  id: string;
  exerciseId: string;
  exercise: Exercise;
  sets: ExerciseSet[];
  notes?: string;
};

export type SupersetGroup = {
  id: string;
  exercises: WorkoutExercise[];
  notes?: string;
}

export type WorkoutLog = {
  id: string;
  title: string;
  date: Date;
  exercises: WorkoutExercise[];
  supersets: SupersetGroup[];
  duration: number; // in seconds
  notes?: string;
  isComplete: boolean;
  isPaid?: boolean;
  price?: number;
  clubId?: string;
};

export type Program = {
  id: string;
  title: string;
  description?: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  duration: number; // in weeks
  createdAt: Date;
  updatedAt: Date;
  isPaid?: boolean;
  price?: number;
  clubId?: string;
  authorId: string;
  // Program progress tracking
  status?: 'not_started' | 'active' | 'completed' | 'paused';
  progress?: number; // 0-100 percentage
  currentWeek?: number;
  nextWorkoutDate?: string | Date;
  startDate?: Date;
  completedWorkouts?: number;
  totalWorkouts?: number;
};

export type ProgramDay = {
  id: string;
  name: string;
  dayOfWeek: number; // 0 = Monday, 6 = Sunday
  workouts: ProgramWorkout[];
};

export type ProgramWeek = {
  id: string;
  weekNumber: number;
  days: ProgramDay[];
};

export type ProgramWorkout = {
  id: string;
  programId: string;
  workoutId?: string; // Optional if it's a template or custom workout
  title: string;
  exercises: WorkoutExercise[];
  supersets: SupersetGroup[];
  duration?: number; // in seconds
  notes?: string;
};

export type Club = {
  id: string;
  name: string;
  description?: string;
  owner_id: string; // Match database schema
  created_at: Date; // Match database schema
  updated_at: Date; // Match database schema
  member_count: number; // Match database schema
  is_paid?: boolean; // Match database schema
  price?: number; // Monthly subscription price
  banner_image_url?: string; // Match database schema
  profile_image_url?: string; // Match database schema
  // Legacy fields for backward compatibility
  ownerId?: string; // For backward compatibility
  createdAt?: Date; // For backward compatibility
  updatedAt?: Date; // For backward compatibility
  memberCount?: number; // For backward compatibility
  isPaid?: boolean; // For backward compatibility
  bannerImageUrl?: string; // For backward compatibility
  profileImageUrl?: string; // For backward compatibility
  imageUrl?: string; // For backward compatibility
  postCount?: number; // Number of posts in the club
};

export type Post = {
  id: string;
  authorId: string;
  clubId?: string;
  content: string;
  imageUrls?: string[];
  createdAt: Date;
  updatedAt: Date;
  likeCount: number;
  commentCount: number;
  isLiked?: boolean;
};

export type Comment = {
  id: string;
  postId: string;
  authorId: string;
  content: string;
  createdAt: Date;
  likeCount: number;
  isLiked?: boolean;
};

export type Event = {
  id: string;
  title: string;
  description?: string;
  location?: string;
  date: Date;
  duration: number; // in minutes
  maxAttendees?: number;
  currentAttendees: number;
  clubId: string;
  createdAt: Date;
  isPaid?: boolean;
  price?: number;
  hostId: string;
};

export type AffiliateTracking = {
  id: string;
  referrerId: string; // User who shared the content
  contentId: string; // ID of program, workout, etc.
  contentType: 'program' | 'workout' | 'club';
  purchaserId?: string; // User who purchased (if conversion happened)
  clicks: number;
  conversions: number;
  earnings: number;
  createdAt: Date;
  updatedAt: Date;
};

export type AnalyticsData = {
  totalWorkouts: number;
  totalDuration: number; // in minutes
  totalVolume: number; // in kg
  workoutsPerWeek: number[];
  volumePerWeek: number[];
  topExercises: {
    exerciseId: string;
    exerciseName: string;
    count: number;
  }[];
};