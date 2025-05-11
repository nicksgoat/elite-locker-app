export type Exercise = {
  id: string;
  name: string;
  notes?: string;
  muscleGroups?: string[];
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
  ownerId: string;
  createdAt: Date;
  updatedAt: Date;
  memberCount: number;
  isPaid?: boolean;
  price?: number; // Monthly subscription price
  bannerImageUrl?: string;
  profileImageUrl?: string;
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