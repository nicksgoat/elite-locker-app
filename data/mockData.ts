import { Club, Event, Exercise, Post, Program, WorkoutLog } from '../types/workout';

// Mock User Data
export const mockUsers = [
  {
    id: 'user1',
    name: 'Devon Allen',
    username: 'devonallen',
    profileImageUrl: 'devon_allen/profile.jpg', // Local asset path
    bio: 'Olympic Hurdler & NFL Wide Receiver. World-class athlete pushing boundaries in track and football. 🏃‍♂️🏈',
    followers: 245000,
    following: 1250,
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
  { id: 'ex11', name: 'Hurdle Drills', muscleGroups: ['quads', 'hamstrings', 'calves'] },
  { id: 'ex12', name: 'Sprint Intervals', muscleGroups: ['quads', 'hamstrings', 'calves', 'core'] },
  { id: 'ex13', name: 'Box Jumps', muscleGroups: ['quads', 'glutes', 'calves'] },
  { id: 'ex14', name: 'Agility Ladder', muscleGroups: ['calves', 'quads', 'coordination'] },
  { id: 'ex15', name: 'Medicine Ball Throws', muscleGroups: ['core', 'shoulders', 'chest'] },
  { id: 'ex16', name: 'Resistance Band Sprints', muscleGroups: ['quads', 'hamstrings', 'glutes'] },
  { id: 'ex17', name: 'Route Running', muscleGroups: ['agility', 'quads', 'calves'] },
  { id: 'ex18', name: 'Catching Drills', muscleGroups: ['hands', 'coordination', 'focus'] },
];

// Mock Workout Data
export const mockWorkouts: WorkoutLog[] = [
  {
    id: 'workout1',
    title: 'Olympic Hurdle Training',
    date: new Date('2023-06-10T08:00:00'),
    exercises: [
      {
        id: 'we1',
        exerciseId: 'ex11',
        exercise: mockExercises[10], // Hurdle Drills
        sets: [
          { id: 's1', duration: 600, completed: true, notes: 'Technical form work' },
          { id: 's2', duration: 600, completed: true, notes: 'Lead leg focus' },
          { id: 's3', duration: 600, completed: true, notes: 'Trail leg focus' },
        ],
      },
      {
        id: 'we2',
        exerciseId: 'ex12',
        exercise: mockExercises[11], // Sprint Intervals
        sets: [
          { id: 's4', distance: 100, duration: 12, completed: true, notes: '90% effort' },
          { id: 's5', distance: 100, duration: 11.8, completed: true, notes: '95% effort' },
          { id: 's6', distance: 100, duration: 11.5, completed: true, notes: '100% effort' },
          { id: 's7', distance: 100, duration: 11.6, completed: true, notes: '100% effort' },
          { id: 's8', distance: 100, duration: 11.7, completed: true, notes: '100% effort' },
        ],
      },
      {
        id: 'we3',
        exerciseId: 'ex13',
        exercise: mockExercises[12], // Box Jumps
        sets: [
          { id: 's9', reps: 10, completed: true, notes: '30" box' },
          { id: 's10', reps: 10, completed: true, notes: '36" box' },
          { id: 's11', reps: 8, completed: true, notes: '42" box' },
        ],
      },
    ],
    supersets: [],
    duration: 5400, // 90 minutes
    isComplete: true,
  },
  {
    id: 'workout2',
    title: 'NFL Route Running & Catching',
    date: new Date('2023-06-12T15:30:00'),
    exercises: [
      {
        id: 'we4',
        exerciseId: 'ex17',
        exercise: mockExercises[16], // Route Running
        sets: [
          { id: 's12', duration: 900, completed: true, notes: 'Short routes focus' },
          { id: 's13', duration: 900, completed: true, notes: 'Deep routes focus' },
          { id: 's14', duration: 900, completed: true, notes: 'Breaking routes focus' },
        ],
      },
      {
        id: 'we5',
        exerciseId: 'ex18',
        exercise: mockExercises[17], // Catching Drills
        sets: [
          { id: 's15', reps: 30, completed: true, notes: 'Stationary catches' },
          { id: 's16', reps: 30, completed: true, notes: 'Moving catches' },
          { id: 's17', reps: 20, completed: true, notes: 'Contested catches' },
        ],
      },
      {
        id: 'we6',
        exerciseId: 'ex14',
        exercise: mockExercises[13], // Agility Ladder
        sets: [
          { id: 's18', duration: 300, completed: true, notes: 'Footwork drills' },
          { id: 's19', duration: 300, completed: true, notes: 'Speed drills' },
        ],
      },
    ],
    supersets: [],
    duration: 4200, // 70 minutes
    isComplete: true,
  },
  {
    id: 'workout3',
    title: 'Track & Field Power Session',
    date: new Date('2023-06-15T07:30:00'),
    exercises: [
      {
        id: 'we7',
        exerciseId: 'ex2',
        exercise: mockExercises[1], // Squat
        sets: [
          { id: 's20', weight: 140, reps: 5, completed: true },
          { id: 's21', weight: 160, reps: 5, completed: true },
          { id: 's22', weight: 180, reps: 3, completed: true },
          { id: 's23', weight: 190, reps: 2, completed: true },
        ],
      },
      {
        id: 'we8',
        exerciseId: 'ex3',
        exercise: mockExercises[2], // Deadlift
        sets: [
          { id: 's24', weight: 180, reps: 5, completed: true },
          { id: 's25', weight: 200, reps: 5, completed: true },
          { id: 's26', weight: 220, reps: 3, completed: true },
        ],
      },
      {
        id: 'we9',
        exerciseId: 'ex16',
        exercise: mockExercises[15], // Resistance Band Sprints
        sets: [
          { id: 's27', distance: 30, reps: 6, completed: true, notes: 'Heavy resistance' },
          { id: 's28', distance: 30, reps: 6, completed: true, notes: 'Medium resistance' },
        ],
      },
      {
        id: 'we10',
        exerciseId: 'ex15',
        exercise: mockExercises[14], // Medicine Ball Throws
        sets: [
          { id: 's29', weight: 8, reps: 12, completed: true, notes: 'Explosive chest throws' },
          { id: 's30', weight: 8, reps: 12, completed: true, notes: 'Rotational throws' },
          { id: 's31', weight: 8, reps: 12, completed: true, notes: 'Overhead throws' },
        ],
      },
    ],
    supersets: [],
    duration: 4800, // 80 minutes
    isComplete: true,
  },
];

// Mock Program Data
export const mockPrograms: Program[] = [
  {
    id: 'program1',
    title: 'Elite Hurdle Technique',
    description: 'Master the technical aspects of hurdle racing with this comprehensive program designed by Olympic hurdler Devon Allen',
    level: 'advanced',
    duration: 8, // 8 weeks
    createdAt: new Date('2023-05-01'),
    updatedAt: new Date('2023-05-10'),
    authorId: 'user1',
    isPaid: true,
    price: 79.99,
    status: 'active',
    progress: 35,
    currentWeek: 3,
    startDate: new Date('2023-05-15'),
    completedWorkouts: 8,
    totalWorkouts: 24,
    nextWorkoutDate: new Date(Date.now() + 86400000), // Tomorrow
  },
  {
    id: 'program2',
    title: 'NFL Receiver Training',
    description: 'Develop the skills, speed, and agility needed to excel as a wide receiver with this program from Devon Allen, who balances both track and NFL careers',
    level: 'advanced',
    duration: 12, // 12 weeks
    createdAt: new Date('2023-04-15'),
    updatedAt: new Date('2023-04-28'),
    authorId: 'user1',
    isPaid: true,
    price: 89.99,
    status: 'active',
    progress: 75,
    currentWeek: 9,
    startDate: new Date('2023-03-10'),
    completedWorkouts: 27,
    totalWorkouts: 36,
    nextWorkoutDate: new Date(Date.now() + 172800000), // Day after tomorrow
  },
  {
    id: 'program3',
    title: 'Sprint Speed Development',
    description: 'Increase your top-end speed and acceleration with techniques used by world-class sprinters',
    level: 'intermediate',
    duration: 6, // 6 weeks
    createdAt: new Date('2023-06-01'),
    updatedAt: new Date('2023-06-05'),
    authorId: 'user1',
    isPaid: true,
    price: 59.99,
    status: 'active',
    progress: 15,
    currentWeek: 1,
    startDate: new Date('2023-06-01'),
    completedWorkouts: 3,
    totalWorkouts: 18,
    nextWorkoutDate: new Date(), // Today
  },
  {
    id: 'program4',
    title: 'Explosive Power Training',
    description: 'Build the explosive power needed for track and field events with this specialized strength and plyometric program',
    level: 'advanced',
    duration: 8, // 8 weeks
    createdAt: new Date('2023-05-20'),
    updatedAt: new Date('2023-05-25'),
    authorId: 'user1',
    isPaid: true,
    price: 69.99,
    status: 'active',
    progress: 65,
    currentWeek: 5,
    startDate: new Date('2023-05-01'),
    completedWorkouts: 15,
    totalWorkouts: 24,
    nextWorkoutDate: new Date(Date.now() + 259200000), // 3 days from now
  },
  {
    id: 'program5',
    title: 'Track Athlete Fundamentals',
    description: 'Learn the essential techniques and training methods for track and field success - perfect for beginners looking to get into the sport',
    level: 'beginner',
    duration: 6, // 6 weeks
    createdAt: new Date('2023-06-05'),
    updatedAt: new Date('2023-06-07'),
    authorId: 'user1',
    isPaid: false,
    status: 'not_started',
    totalWorkouts: 18,
  },
];

// Mock Club Data
export const mockClubs: Club[] = [
  {
    id: 'club1',
    name: 'Elite Hurdlers',
    description: 'A community for competitive hurdlers and track athletes looking to improve their technique, speed, and performance',
    ownerId: 'user1',
    createdAt: new Date('2023-01-15'),
    updatedAt: new Date('2023-06-01'),
    memberCount: 12500,
    isPaid: true,
    price: 14.99,
    bannerImageUrl: 'devon_allen/elite_hurdlers_banner.jpg', // Local asset path
    profileImageUrl: 'devon_allen/elite_hurdlers_profile.jpg', // Local asset path
    postCount: 156,
  },
  {
    id: 'club2',
    name: 'NFL Speed Academy',
    description: 'Training techniques and drills to develop the speed, agility, and explosiveness needed for football success',
    ownerId: 'user1',
    createdAt: new Date('2023-02-20'),
    updatedAt: new Date('2023-05-25'),
    memberCount: 8700,
    isPaid: true,
    price: 19.99,
    bannerImageUrl: 'devon_allen/nfl_speed_banner.jpg', // Local asset path
    profileImageUrl: 'devon_allen/nfl_speed_profile.jpg', // Local asset path
    postCount: 98,
  },
  {
    id: 'club3',
    name: 'Track & Field Fundamentals',
    description: 'Learn the basics of track and field events with tips, tutorials, and training plans for beginners',
    ownerId: 'user1',
    createdAt: new Date('2023-03-10'),
    updatedAt: new Date('2023-06-10'),
    memberCount: 5200,
    isPaid: false,
    bannerImageUrl: 'devon_allen/track_fundamentals_banner.jpg', // Local asset path
    profileImageUrl: 'devon_allen/track_fundamentals_profile.jpg', // Local asset path
    postCount: 72,
  },
  {
    id: 'club4',
    name: 'Olympic Training Insights',
    description: 'Behind-the-scenes look at Olympic-level training methods, recovery techniques, and competition preparation',
    ownerId: 'user1',
    createdAt: new Date('2023-04-05'),
    updatedAt: new Date('2023-06-15'),
    memberCount: 18300,
    isPaid: true,
    price: 24.99,
    bannerImageUrl: 'devon_allen/olympic_insights_banner.jpg', // Local asset path
    profileImageUrl: 'devon_allen/olympic_insights_profile.jpg', // Local asset path
    postCount: 124,
  },
];

// Mock Post Data
export const mockPosts: Post[] = [
  {
    id: 'post1',
    authorId: 'user1',
    clubId: 'club1',
    content: 'Just finished a killer hurdle session! 10x110m hurdles with full recovery. Working on maintaining speed between hurdles 8-10. #TrackLife #Hurdles',
    imageUrls: ['devon_allen/hurdle_training.jpg'], // Local asset path
    createdAt: new Date('2023-06-10T14:30:00'),
    updatedAt: new Date('2023-06-10T14:30:00'),
    likeCount: 3245,
    commentCount: 178,
    isLiked: false,
  },
  {
    id: 'post2',
    authorId: 'user1',
    clubId: 'club2',
    content: 'Route running session with the team today. Focus on creating separation at the top of routes and maintaining speed through breaks. #NFLTraining #SpeedKills',
    imageUrls: ['devon_allen/route_running.jpg'], // Local asset path
    createdAt: new Date('2023-06-09T10:15:00'),
    updatedAt: new Date('2023-06-09T10:15:00'),
    likeCount: 2876,
    commentCount: 143,
    isLiked: true,
  },
  {
    id: 'post3',
    authorId: 'user1',
    clubId: 'club4',
    content: 'Olympic training camp starts next week! Getting ready for the World Championships. The work never stops when you\'re chasing gold. #RoadToGold #Olympics',
    imageUrls: [
      'devon_allen/olympic_insights_banner.jpg', // Local asset path
    ],
    createdAt: new Date('2023-06-08T18:45:00'),
    updatedAt: new Date('2023-06-08T18:45:00'),
    likeCount: 5120,
    commentCount: 235,
    isLiked: false,
  },
  {
    id: 'post4',
    authorId: 'user1',
    clubId: 'club3',
    content: 'For all the beginners out there: Focus on technique before speed. I\'ve uploaded a new tutorial on proper hurdle form in the Track & Field Fundamentals club. Check it out! #TrackTips #LearnToHurdle',
    imageUrls: [
      'devon_allen/track_fundamentals_banner.jpg', // Local asset path
    ],
    createdAt: new Date('2023-06-07T09:15:00'),
    updatedAt: new Date('2023-06-07T09:15:00'),
    likeCount: 1876,
    commentCount: 215,
    isLiked: true,
  },
  {
    id: 'post5',
    authorId: 'user1',
    clubId: 'club1',
    content: 'Recovery day: Ice bath, massage, and mobility work. Remember that recovery is just as important as training! #RecoveryDay #ElitePerformance',
    imageUrls: [
      'devon_allen/power_session.jpg', // Local asset path
    ],
    createdAt: new Date('2023-06-06T16:30:00'),
    updatedAt: new Date('2023-06-06T16:30:00'),
    likeCount: 2543,
    commentCount: 98,
    isLiked: false,
  },
];

// Mock Event Data
export const mockEvents: Event[] = [
  {
    id: 'event1',
    title: 'Hurdle Technique Masterclass',
    description: 'Join Olympic hurdler Devon Allen for an in-depth masterclass on hurdle technique, race strategy, and training methods',
    location: 'Nike World Headquarters, Beaverton, OR',
    date: new Date('2023-07-15T09:00:00'),
    duration: 180, // 3 hours
    maxAttendees: 50,
    currentAttendees: 42,
    clubId: 'club1',
    createdAt: new Date('2023-06-01'),
    hostId: 'user1',
    isPaid: true,
    price: 99.00,
  },
  {
    id: 'event2',
    title: 'Speed Development Clinic',
    description: 'Learn the techniques and drills used by NFL players and Olympic sprinters to develop explosive speed and acceleration',
    location: 'Eagles Training Facility, Philadelphia, PA',
    date: new Date('2023-07-20T18:30:00'),
    duration: 150, // 2.5 hours
    maxAttendees: 40,
    currentAttendees: 35,
    clubId: 'club2',
    createdAt: new Date('2023-06-05'),
    isPaid: true,
    price: 79.00,
    hostId: 'user1',
  },
  {
    id: 'event3',
    title: 'Track & Field Fundamentals Workshop',
    description: 'A beginner-friendly workshop covering the basics of track and field events, with personalized coaching and feedback',
    location: 'University of Oregon Track, Eugene, OR',
    date: new Date('2023-07-25T10:00:00'),
    duration: 240, // 4 hours
    maxAttendees: 30,
    currentAttendees: 18,
    clubId: 'club3',
    createdAt: new Date('2023-06-10'),
    isPaid: true,
    price: 49.00,
    hostId: 'user1',
  },
  {
    id: 'event4',
    title: 'Live Q&A: Olympic Training Insights',
    description: 'Join Devon Allen for a live virtual Q&A session about Olympic training, competition preparation, and balancing track with NFL career',
    location: 'Virtual Event (Zoom)',
    date: new Date('2023-07-05T19:00:00'),
    duration: 90, // 1.5 hours
    maxAttendees: 500,
    currentAttendees: 327,
    clubId: 'club4',
    createdAt: new Date('2023-06-15'),
    isPaid: true,
    price: 19.99,
    hostId: 'user1',
  },
  {
    id: 'event5',
    title: 'Recovery Techniques for Elite Athletes',
    description: 'Learn the recovery methods used by professional athletes to optimize performance and prevent injuries',
    location: 'Performance Lab, Portland, OR',
    date: new Date('2023-08-10T14:00:00'),
    duration: 120, // 2 hours
    maxAttendees: 25,
    currentAttendees: 12,
    clubId: 'club4',
    createdAt: new Date('2023-06-20'),
    isPaid: true,
    price: 59.99,
    hostId: 'user1',
  },
];

// Mock Training Max Data
export const mockTrainingMaxes = {
  'Squat': 185,
  'Bench Press': 135,
  'Deadlift': 225,
  'Overhead Press': 95,
  'Pull Up': 0, // Bodyweight exercise
  'Push Up': 0, // Bodyweight exercise
};

// Mock Analytics Data
export const mockAnalytics = {
  totalWorkouts: 312,
  totalDuration: 31200, // 520 hours
  totalVolume: 425000, // 425000 kg
  workoutsPerWeek: [6, 7, 6, 7, 6, 5, 6, 7, 6, 7, 6, 7],
  volumePerWeek: [8500, 9200, 8700, 9100, 8900, 7800, 8500, 9200, 8700, 9100, 8900, 9400],
  topExercises: [
    { exerciseId: 'ex11', exerciseName: 'Hurdle Drills', count: 156 },
    { exerciseId: 'ex12', exerciseName: 'Sprint Intervals', count: 142 },
    { exerciseId: 'ex2', exerciseName: 'Squat', count: 98 },
    { exerciseId: 'ex13', exerciseName: 'Box Jumps', count: 87 },
    { exerciseId: 'ex3', exerciseName: 'Deadlift', count: 76 },
  ],
};