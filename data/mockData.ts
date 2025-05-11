import { WorkoutLog, Program, Club, Post, Event, Exercise } from '../types/workout';

// Mock User Data
export const mockUsers = [
  {
    id: 'user1',
    name: 'Alex Johnson',
    username: 'alexj',
    profileImageUrl: 'https://randomuser.me/api/portraits/men/32.jpg',
    bio: 'Fitness coach & nutrition specialist. Helping you reach your goals!',
    followers: 1240,
    following: 365,
  },
  {
    id: 'user2',
    name: 'Sarah Williams',
    username: 'sarahfit',
    profileImageUrl: 'https://randomuser.me/api/portraits/women/44.jpg',
    bio: 'Personal trainer & wellness advocate',
    followers: 3500,
    following: 420,
  },
  {
    id: 'user3',
    name: 'Mike Chen',
    username: 'mikefit',
    profileImageUrl: 'https://randomuser.me/api/portraits/men/67.jpg',
    bio: 'Bodybuilder & lifestyle coach',
    followers: 2200,
    following: 310,
  },
];

// Mock Exercise Data
export const mockExercises: Exercise[] = [
  { id: 'ex1', name: 'Bench Press', muscleGroups: ['chest', 'triceps', 'shoulders'] },
  { id: 'ex2', name: 'Squat', muscleGroups: ['quads', 'glutes', 'hamstrings'] },
  { id: 'ex3', name: 'Deadlift', muscleGroups: ['back', 'hamstrings', 'glutes'] },
  { id: 'ex4', name: 'Pull Up', muscleGroups: ['back', 'biceps', 'shoulders'] },
  { id: 'ex5', name: 'Overhead Press', muscleGroups: ['shoulders', 'triceps'] },
  { id: 'ex6', name: 'Bicep Curl', muscleGroups: ['biceps'] },
  { id: 'ex7', name: 'Tricep Extension', muscleGroups: ['triceps'] },
  { id: 'ex8', name: 'Leg Press', muscleGroups: ['quads', 'glutes'] },
  { id: 'ex9', name: 'Lateral Raise', muscleGroups: ['shoulders'] },
  { id: 'ex10', name: 'Plank', muscleGroups: ['core'] },
];

// Mock Workout Data
export const mockWorkouts: WorkoutLog[] = [
  {
    id: 'workout1',
    title: 'Upper Body Strength',
    date: new Date('2023-06-10T10:00:00'),
    exercises: [
      {
        id: 'we1',
        exerciseId: 'ex1',
        exercise: mockExercises[0],
        sets: [
          { id: 's1', weight: 80, reps: 10, completed: true },
          { id: 's2', weight: 85, reps: 8, completed: true },
          { id: 's3', weight: 90, reps: 6, completed: true },
        ],
      },
      {
        id: 'we2',
        exerciseId: 'ex4',
        exercise: mockExercises[3],
        sets: [
          { id: 's4', reps: 12, completed: true },
          { id: 's5', reps: 10, completed: true },
          { id: 's6', reps: 8, completed: true },
        ],
      },
      {
        id: 'we3',
        exerciseId: 'ex6',
        exercise: mockExercises[5],
        sets: [
          { id: 's7', weight: 15, reps: 15, completed: true },
          { id: 's8', weight: 17.5, reps: 12, completed: true },
          { id: 's9', weight: 20, reps: 10, completed: true },
        ],
      },
    ],
    supersets: [],
    duration: 3600, // 60 minutes
    isComplete: true,
  },
  {
    id: 'workout2',
    title: 'Lower Body Focus',
    date: new Date('2023-06-12T09:30:00'),
    exercises: [
      {
        id: 'we4',
        exerciseId: 'ex2',
        exercise: mockExercises[1],
        sets: [
          { id: 's10', weight: 100, reps: 10, completed: true },
          { id: 's11', weight: 110, reps: 8, completed: true },
          { id: 's12', weight: 120, reps: 6, completed: true },
        ],
      },
      {
        id: 'we5',
        exerciseId: 'ex8',
        exercise: mockExercises[7],
        sets: [
          { id: 's13', weight: 150, reps: 12, completed: true },
          { id: 's14', weight: 170, reps: 10, completed: true },
          { id: 's15', weight: 190, reps: 8, completed: true },
        ],
      },
    ],
    supersets: [],
    duration: 2700, // 45 minutes
    isComplete: true,
  },
  {
    id: 'workout3',
    title: 'Full Body Workout',
    date: new Date('2023-06-15T18:00:00'),
    exercises: [
      {
        id: 'we6',
        exerciseId: 'ex1',
        exercise: mockExercises[0],
        sets: [
          { id: 's16', weight: 75, reps: 12, completed: true },
          { id: 's17', weight: 80, reps: 10, completed: true },
          { id: 's18', weight: 85, reps: 8, completed: true },
        ],
      },
      {
        id: 'we7',
        exerciseId: 'ex2',
        exercise: mockExercises[1],
        sets: [
          { id: 's19', weight: 95, reps: 12, completed: true },
          { id: 's20', weight: 105, reps: 10, completed: true },
          { id: 's21', weight: 115, reps: 8, completed: true },
        ],
      },
      {
        id: 'we8',
        exerciseId: 'ex4',
        exercise: mockExercises[3],
        sets: [
          { id: 's22', reps: 10, completed: true },
          { id: 's23', reps: 8, completed: true },
          { id: 's24', reps: 6, completed: true },
        ],
      },
    ],
    supersets: [],
    duration: 3300, // 55 minutes
    isComplete: true,
  },
];

// Mock Program Data
export const mockPrograms: Program[] = [
  {
    id: 'program1',
    title: '8-Week Strength Builder',
    description: 'A comprehensive program designed to increase strength in all major lifts',
    level: 'intermediate',
    duration: 8, // 8 weeks
    createdAt: new Date('2023-05-01'),
    updatedAt: new Date('2023-05-10'),
    authorId: 'user1',
    isPaid: true,
    price: 29.99,
  },
  {
    id: 'program2',
    title: '12-Week Body Transformation',
    description: 'Complete body recomposition program with progressive overload',
    level: 'advanced',
    duration: 12, // 12 weeks
    createdAt: new Date('2023-04-15'),
    updatedAt: new Date('2023-04-28'),
    authorId: 'user2',
    isPaid: true,
    price: 49.99,
  },
  {
    id: 'program3',
    title: 'Beginner Fitness Fundamentals',
    description: 'Learn proper form and build a solid foundation',
    level: 'beginner',
    duration: 6, // 6 weeks
    createdAt: new Date('2023-06-01'),
    updatedAt: new Date('2023-06-05'),
    authorId: 'user3',
    isPaid: false,
  },
];

// Mock Club Data
export const mockClubs: Club[] = [
  {
    id: 'club1',
    name: 'Strength Collective',
    description: 'A community of strength athletes sharing knowledge and motivation',
    ownerId: 'user1',
    createdAt: new Date('2023-01-15'),
    updatedAt: new Date('2023-06-01'),
    memberCount: 1500,
    isPaid: true,
    price: 9.99,
    bannerImageUrl: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48',
    profileImageUrl: 'https://images.unsplash.com/photo-1526506118085-60ce8714f8c5',
  },
  {
    id: 'club2',
    name: 'Fitness Lifestyle',
    description: 'Combining fitness, nutrition, and mindfulness for holistic health',
    ownerId: 'user2',
    createdAt: new Date('2023-02-20'),
    updatedAt: new Date('2023-05-25'),
    memberCount: 2200,
    isPaid: false,
    bannerImageUrl: 'https://images.unsplash.com/photo-1466761366829-84fd59a22e0d',
    profileImageUrl: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438',
  },
  {
    id: 'club3',
    name: 'Bodybuilding Pros',
    description: 'Advanced techniques and nutrition for competitive bodybuilders',
    ownerId: 'user3',
    createdAt: new Date('2023-03-10'),
    updatedAt: new Date('2023-06-10'),
    memberCount: 800,
    isPaid: true,
    price: 14.99,
    bannerImageUrl: 'https://images.unsplash.com/photo-1579758629938-03607ccdbaba',
    profileImageUrl: 'https://images.unsplash.com/photo-1577221084712-45b0445d2b00',
  },
];

// Mock Post Data
export const mockPosts: Post[] = [
  {
    id: 'post1',
    authorId: 'user1',
    clubId: 'club1',
    content: 'Just finished programming a new 8-week strength cycle. Who wants to test it with me?',
    imageUrls: ['https://images.unsplash.com/photo-1574680096145-d05b474e2155'],
    createdAt: new Date('2023-06-10T14:30:00'),
    updatedAt: new Date('2023-06-10T14:30:00'),
    likeCount: 45,
    commentCount: 12,
    isLiked: false,
  },
  {
    id: 'post2',
    authorId: 'user2',
    clubId: 'club2',
    content: 'Today\'s workout focused on mind-muscle connection. Remember, it\'s not just about lifting heavy but lifting smart!',
    imageUrls: ['https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e'],
    createdAt: new Date('2023-06-09T10:15:00'),
    updatedAt: new Date('2023-06-09T10:15:00'),
    likeCount: 78,
    commentCount: 23,
    isLiked: true,
  },
  {
    id: 'post3',
    authorId: 'user3',
    clubId: 'club3',
    content: 'Six weeks out from competition. The grind doesn\'t stop! Check out today\'s chest workout.',
    imageUrls: [
      'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b',
      'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61',
    ],
    createdAt: new Date('2023-06-08T18:45:00'),
    updatedAt: new Date('2023-06-08T18:45:00'),
    likeCount: 120,
    commentCount: 35,
    isLiked: false,
  },
];

// Mock Event Data
export const mockEvents: Event[] = [
  {
    id: 'event1',
    title: 'Group Training Session',
    description: 'Join us for a high-intensity group training session focused on strength and conditioning',
    location: 'Central Park, New York',
    date: new Date('2023-07-15T09:00:00'),
    duration: 90, // 90 minutes
    maxAttendees: 20,
    currentAttendees: 14,
    clubId: 'club1',
    createdAt: new Date('2023-06-01'),
    hostId: 'user1',
  },
  {
    id: 'event2',
    title: 'Nutrition Workshop',
    description: 'Learn about optimal nutrition for performance and recovery',
    location: 'Fitness Lifestyle HQ, Los Angeles',
    date: new Date('2023-07-20T18:30:00'),
    duration: 120, // 120 minutes
    maxAttendees: 30,
    currentAttendees: 25,
    clubId: 'club2',
    createdAt: new Date('2023-06-05'),
    isPaid: true,
    price: 15.00,
    hostId: 'user2',
  },
  {
    id: 'event3',
    title: 'Competition Prep Seminar',
    description: 'Everything you need to know to prepare for your first bodybuilding competition',
    location: 'Gold\'s Gym, Venice Beach',
    date: new Date('2023-07-25T10:00:00'),
    duration: 180, // 3 hours
    maxAttendees: 15,
    currentAttendees: 8,
    clubId: 'club3',
    createdAt: new Date('2023-06-10'),
    isPaid: true,
    price: 25.00,
    hostId: 'user3',
  },
];

// Mock Analytics Data
export const mockAnalytics = {
  totalWorkouts: 45,
  totalDuration: 2700, // 45 hours
  totalVolume: 36500, // 36500 kg
  workoutsPerWeek: [3, 4, 3, 5, 4, 2, 3, 4, 5, 3, 4, 5],
  volumePerWeek: [3000, 3200, 3100, 3600, 3400, 2800, 3000, 3200, 3400, 3200, 3300, 3300],
  topExercises: [
    { exerciseId: 'ex1', exerciseName: 'Bench Press', count: 32 },
    { exerciseId: 'ex2', exerciseName: 'Squat', count: 28 },
    { exerciseId: 'ex3', exerciseName: 'Deadlift', count: 25 },
    { exerciseId: 'ex4', exerciseName: 'Pull Up', count: 22 },
    { exerciseId: 'ex6', exerciseName: 'Bicep Curl', count: 20 },
  ],
}; 