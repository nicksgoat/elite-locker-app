import React, { createContext, useState, useContext, useEffect } from 'react';

// Types based on the specification
export interface ProfileMetrics {
  totalWorkouts: number;
  totalPrograms: number;
  totalClubs: number;
  followersCount: number;
  followingCount: number;
  updatedAt: Date;
}

export interface SocialLinks {
  instagram?: string;
  twitter?: string;
  tiktok?: string;
  youtube?: string;
  website?: string;
}

export interface PrivacySettings {
  workoutsPublic: boolean;
  clubsPublic: boolean;
  followersVisible: boolean;
  allowMessages: boolean;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  achievedAt: Date;
  category: 'achievement' | 'membership' | 'streak' | 'challenge';
}

export interface ProfileData {
  id: string;
  userId: string;
  handle: string;
  name: string;
  bio: string;
  avatarUrl: string;
  headerUrl?: string;
  socialLinks: SocialLinks;
  privacySettings: PrivacySettings;
  metrics: ProfileMetrics;
  isVerified: boolean;
  isPremium: boolean;
  role: 'user' | 'coach' | 'admin';
  badges: Badge[];
  createdAt: Date;
  updatedAt: Date;
}

export interface WorkoutSummary {
  id: string;
  title: string;
  date: Date;
  duration: number;
  sets: number;
  thumbnailUrl?: string;
  likes: number;
  comments: number;
  isPublic: boolean;
}

export interface ProgramSummary {
  id: string;
  title: string;
  description: string;
  coverImageUrl?: string;
  subscriberCount: number;
  price: number;
  isPublic: boolean;
}

export interface ClubSummary {
  id: string;
  name: string;
  memberCount: number;
  imageUrl?: string;
  isPublic: boolean;
}

interface ProfileContextType {
  currentProfile: ProfileData | null;
  currentProfileWorkouts: WorkoutSummary[];
  currentProfilePrograms: ProgramSummary[];
  currentProfileClubs: ClubSummary[];
  isLoadingProfile: boolean;
  isLoadingContent: boolean;
  viewedProfile: ProfileData | null;
  viewedProfileWorkouts: WorkoutSummary[];
  viewedProfilePrograms: ProgramSummary[];
  viewedProfileClubs: ClubSummary[];
  isFollowing: boolean;
  fetchProfile: (profileId: string) => Promise<void>;
  updateProfile: (profileData: Partial<ProfileData>) => Promise<void>;
  followProfile: (profileId: string) => Promise<void>;
  unfollowProfile: (profileId: string) => Promise<void>;
  loadProfileContent: (profileId: string) => Promise<void>;
}

// Create context with default values
const ProfileContext = createContext<ProfileContextType>({
  currentProfile: null,
  currentProfileWorkouts: [],
  currentProfilePrograms: [],
  currentProfileClubs: [],
  isLoadingProfile: false,
  isLoadingContent: false,
  viewedProfile: null,
  viewedProfileWorkouts: [],
  viewedProfilePrograms: [],
  viewedProfileClubs: [],
  isFollowing: false,
  fetchProfile: async () => {},
  updateProfile: async () => {},
  followProfile: async () => {},
  unfollowProfile: async () => {},
  loadProfileContent: async () => {},
});

// Sample mock data for demonstration
const MOCK_PROFILE: ProfileData = {
  id: 'current-user',
  userId: 'auth0|123456',
  handle: 'johndoe',
  name: 'John Doe',
  bio: 'Fitness enthusiast. Pushing limits every day. 💪',
  avatarUrl: 'https://i.pravatar.cc/300?img=8',
  headerUrl: 'https://images.unsplash.com/photo-1526506118085-60ce8714f8c5',
  socialLinks: {
    instagram: 'johndoe_fit',
    twitter: 'johndoe',
  },
  privacySettings: {
    workoutsPublic: true,
    clubsPublic: true,
    followersVisible: true,
    allowMessages: true,
  },
  metrics: {
    totalWorkouts: 248,
    totalPrograms: 5,
    totalClubs: 3,
    followersCount: 1250,
    followingCount: 365,
    updatedAt: new Date(),
  },
  isVerified: false,
  isPremium: true,
  role: 'user',
  badges: [
    {
      id: 'badge1',
      name: '100 Workouts',
      description: 'Completed 100 workouts',
      imageUrl: 'https://via.placeholder.com/80',
      achievedAt: new Date(2023, 2, 15),
      category: 'achievement',
    },
    {
      id: 'badge2',
      name: '30 Day Streak',
      description: 'Workout for 30 days in a row',
      imageUrl: 'https://via.placeholder.com/80',
      achievedAt: new Date(2023, 4, 10),
      category: 'streak',
    },
  ],
  createdAt: new Date(2022, 1, 1),
  updatedAt: new Date(),
};

const MOCK_WORKOUTS: WorkoutSummary[] = [
  {
    id: 'w1',
    title: 'Morning Push Day',
    date: new Date(2023, 5, 20),
    duration: 65,
    sets: 24,
    thumbnailUrl: 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61',
    likes: 23,
    comments: 5,
    isPublic: true,
  },
  {
    id: 'w2',
    title: 'Leg Destruction',
    date: new Date(2023, 5, 18),
    duration: 75,
    sets: 28,
    thumbnailUrl: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155',
    likes: 18,
    comments: 3,
    isPublic: true,
  },
  {
    id: 'w3',
    title: 'HIIT Cardio Session',
    date: new Date(2023, 5, 15),
    duration: 45,
    sets: 12,
    thumbnailUrl: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd',
    likes: 12,
    comments: 2,
    isPublic: true,
  },
];

const MOCK_PROGRAMS: ProgramSummary[] = [
  {
    id: 'p1',
    title: '8-Week Mass Builder',
    description: 'Build serious muscle with this progressive program',
    coverImageUrl: 'https://images.unsplash.com/photo-1532384748853-8f54a8f476e2',
    subscriberCount: 187,
    price: 49.99,
    isPublic: true,
  },
  {
    id: 'p2',
    title: 'HIIT Fat Burner',
    description: 'High intensity interval training to torch fat',
    coverImageUrl: 'https://images.unsplash.com/photo-1434608519344-49d77a699e1d',
    subscriberCount: 142,
    price: 39.99,
    isPublic: true,
  },
];

const MOCK_CLUBS: ClubSummary[] = [
  {
    id: 'c1',
    name: 'Powerlifting Elite',
    memberCount: 342,
    imageUrl: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48',
    isPublic: true,
  },
  {
    id: 'c2',
    name: 'Morning Runners',
    memberCount: 186,
    imageUrl: 'https://images.unsplash.com/photo-1476480862126-209bfaa8edc8',
    isPublic: true,
  },
];

// Provider component
export const ProfileProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentProfile, setCurrentProfile] = useState<ProfileData | null>(null);
  const [currentProfileWorkouts, setCurrentProfileWorkouts] = useState<WorkoutSummary[]>([]);
  const [currentProfilePrograms, setCurrentProfilePrograms] = useState<ProgramSummary[]>([]);
  const [currentProfileClubs, setCurrentProfileClubs] = useState<ClubSummary[]>([]);
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);
  const [isLoadingContent, setIsLoadingContent] = useState(false);
  
  const [viewedProfile, setViewedProfile] = useState<ProfileData | null>(null);
  const [viewedProfileWorkouts, setViewedProfileWorkouts] = useState<WorkoutSummary[]>([]);
  const [viewedProfilePrograms, setViewedProfilePrograms] = useState<ProgramSummary[]>([]);
  const [viewedProfileClubs, setViewedProfileClubs] = useState<ClubSummary[]>([]);
  const [isFollowing, setIsFollowing] = useState(false);

  // Load current user profile on mount
  useEffect(() => {
    const loadCurrentProfile = async () => {
      setIsLoadingProfile(true);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // In a real app, this would fetch from an API
      setCurrentProfile(MOCK_PROFILE);
      setCurrentProfileWorkouts(MOCK_WORKOUTS);
      setCurrentProfilePrograms(MOCK_PROGRAMS);
      setCurrentProfileClubs(MOCK_CLUBS);
      
      setIsLoadingProfile(false);
    };
    
    loadCurrentProfile();
  }, []);

  // Fetch profile by ID
  const fetchProfile = async (profileId: string) => {
    setIsLoadingProfile(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // In a real app, this would fetch from an API based on profileId
    // Using Sam Sulek as an example viewed profile
    const samSulekProfile: ProfileData = {
      id: profileId,
      userId: 'auth0|654321',
      handle: 'samsulek',
      name: 'Sam Sulek',
      bio: 'Fitness content creator. Building the best physique possible.',
      avatarUrl: 'https://randomuser.me/api/portraits/men/32.jpg',
      headerUrl: 'https://images.unsplash.com/photo-1574680178050-55c6a6a96e0a',
      socialLinks: {
        instagram: 'samsulek',
        youtube: 'samsulek',
      },
      privacySettings: {
        workoutsPublic: true,
        clubsPublic: true,
        followersVisible: true,
        allowMessages: true,
      },
      metrics: {
        totalWorkouts: 1458,
        totalPrograms: 12,
        totalClubs: 2,
        followersCount: 1500000,
        followingCount: 150,
        updatedAt: new Date(),
      },
      isVerified: true,
      isPremium: true,
      role: 'coach',
      badges: [
        {
          id: 'badge1',
          name: 'Verified Coach',
          description: 'Verified fitness professional',
          imageUrl: 'https://via.placeholder.com/80',
          achievedAt: new Date(2022, 5, 15),
          category: 'achievement',
        },
        {
          id: 'badge2',
          name: '1M Followers',
          description: 'Reached 1 million followers',
          imageUrl: 'https://via.placeholder.com/80',
          achievedAt: new Date(2023, 2, 10),
          category: 'achievement',
        },
      ],
      createdAt: new Date(2021, 1, 1),
      updatedAt: new Date(),
    };
    
    setViewedProfile(samSulekProfile);
    setIsFollowing(Math.random() > 0.5); // Random for demo
    
    setIsLoadingProfile(false);
  };

  // Load a profile's content (workouts, programs, clubs)
  const loadProfileContent = async (profileId: string) => {
    setIsLoadingContent(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // In a real app, this would fetch from an API based on profileId
    setViewedProfileWorkouts([
      {
        id: 'w1',
        title: 'Offseason Day 49 - Arms',
        date: new Date(2023, 5, 15),
        duration: 75,
        sets: 48,
        thumbnailUrl: 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61',
        likes: 45230,
        comments: 1243,
        isPublic: true,
      },
      {
        id: 'w2',
        title: 'Offseason Day 47 - Chest Obliteration',
        date: new Date(2023, 5, 12),
        duration: 90,
        sets: 36,
        thumbnailUrl: 'https://images.unsplash.com/photo-1584466977773-e625c37cdd50',
        likes: 38754,
        comments: 982,
        isPublic: true,
      },
    ]);
    
    setViewedProfilePrograms([
      {
        id: 'p1',
        title: 'Sulek Muscle Building',
        description: 'Complete program to build muscle like me',
        coverImageUrl: 'https://images.unsplash.com/photo-1532384748853-8f54a8f476e2',
        subscriberCount: 25840,
        price: 99.99,
        isPublic: true,
      },
    ]);
    
    setViewedProfileClubs([
      {
        id: 'c1',
        name: 'Sulek Lifting Club',
        memberCount: 12450,
        imageUrl: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48',
        isPublic: true,
      },
    ]);
    
    setIsLoadingContent(false);
  };

  // Update profile
  const updateProfile = async (profileData: Partial<ProfileData>) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // In a real app, this would update the profile via API
    setCurrentProfile(prev => {
      if (!prev) return null;
      return { ...prev, ...profileData, updatedAt: new Date() };
    });
  };

  // Follow a profile
  const followProfile = async (profileId: string) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // In a real app, this would make an API call to follow
    setIsFollowing(true);
    
    // Update follower counts
    if (viewedProfile) {
      setViewedProfile(prev => {
        if (!prev) return null;
        return {
          ...prev,
          metrics: {
            ...prev.metrics,
            followersCount: prev.metrics.followersCount + 1,
          }
        };
      });
    }
    
    // Update current user's following count
    setCurrentProfile(prev => {
      if (!prev) return null;
      return {
        ...prev,
        metrics: {
          ...prev.metrics,
          followingCount: prev.metrics.followingCount + 1,
        }
      };
    });
  };

  // Unfollow a profile
  const unfollowProfile = async (profileId: string) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // In a real app, this would make an API call to unfollow
    setIsFollowing(false);
    
    // Update follower counts
    if (viewedProfile) {
      setViewedProfile(prev => {
        if (!prev) return null;
        return {
          ...prev,
          metrics: {
            ...prev.metrics,
            followersCount: Math.max(0, prev.metrics.followersCount - 1),
          }
        };
      });
    }
    
    // Update current user's following count
    setCurrentProfile(prev => {
      if (!prev) return null;
      return {
        ...prev,
        metrics: {
          ...prev.metrics,
          followingCount: Math.max(0, prev.metrics.followingCount - 1),
        }
      };
    });
  };

  return (
    <ProfileContext.Provider
      value={{
        currentProfile,
        currentProfileWorkouts,
        currentProfilePrograms,
        currentProfileClubs,
        isLoadingProfile,
        isLoadingContent,
        viewedProfile,
        viewedProfileWorkouts,
        viewedProfilePrograms,
        viewedProfileClubs,
        isFollowing,
        fetchProfile,
        updateProfile,
        followProfile,
        unfollowProfile,
        loadProfileContent,
      }}
    >
      {children}
    </ProfileContext.Provider>
  );
};

// Custom hook to use the profile context
export const useProfile = () => useContext(ProfileContext);

export default ProfileContext; 