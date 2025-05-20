import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';

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
  fetchProfileData: (category: 'workouts' | 'programs' | 'clubs' | 'badges', profileId: string) => Promise<any[]>;
  resetViewedProfile: () => void;
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
  fetchProfileData: async () => [],
  resetViewedProfile: () => {},
});

// Sample mock data for demonstration
const MOCK_PROFILE: ProfileData = {
  id: 'current-user',
  userId: 'auth0|123456',
  handle: 'devonallen',
  name: 'Devon Allen',
  bio: 'Olympic Hurdler & NFL Wide Receiver. World-class athlete pushing boundaries in track and football. 🏃‍♂️🏈',
  avatarUrl: 'devon_allen/profile.jpg', // Local asset path
  headerUrl: 'devon_allen/header.jpg', // Local asset path
  socialLinks: {
    instagram: 'devonallen',
    twitter: 'devonallen13',
    youtube: 'devonallen',
  },
  privacySettings: {
    workoutsPublic: true,
    clubsPublic: true,
    followersVisible: true,
    allowMessages: true,
  },
  metrics: {
    totalWorkouts: 312,
    totalPrograms: 5,
    totalClubs: 4,
    followersCount: 245000,
    followingCount: 1250,
    updatedAt: new Date(),
  },
  isVerified: true,
  isPremium: true,
  role: 'coach',
  badges: [
    {
      id: 'badge1',
      name: 'Olympic Athlete',
      description: 'Competed in the Olympic Games',
      imageUrl: 'https://via.placeholder.com/80',
      achievedAt: new Date(2021, 7, 1),
      category: 'achievement',
    },
    {
      id: 'badge2',
      name: 'NFL Player',
      description: 'Professional NFL athlete',
      imageUrl: 'https://via.placeholder.com/80',
      achievedAt: new Date(2022, 8, 15),
      category: 'achievement',
    },
    {
      id: 'badge3',
      name: 'Verified Coach',
      description: 'Elite level verified coach',
      imageUrl: 'https://via.placeholder.com/80',
      achievedAt: new Date(2022, 10, 1),
      category: 'achievement',
    },
  ],
  createdAt: new Date(2021, 1, 1),
  updatedAt: new Date(),
};

const MOCK_WORKOUTS: WorkoutSummary[] = [
  {
    id: 'w1',
    title: 'Olympic Hurdle Training',
    date: new Date(2023, 5, 20),
    duration: 90,
    sets: 18,
    thumbnailUrl: 'devon_allen/hurdle_training.jpg', // Local asset path
    likes: 3245,
    comments: 178,
    isPublic: true,
  },
  {
    id: 'w2',
    title: 'NFL Route Running & Catching',
    date: new Date(2023, 5, 18),
    duration: 70,
    sets: 14,
    thumbnailUrl: 'devon_allen/route_running.jpg', // Local asset path
    likes: 2876,
    comments: 143,
    isPublic: true,
  },
  {
    id: 'w3',
    title: 'Track & Field Power Session',
    date: new Date(2023, 5, 15),
    duration: 80,
    sets: 16,
    thumbnailUrl: 'devon_allen/power_session.jpg', // Local asset path
    likes: 1876,
    comments: 215,
    isPublic: true,
  },
];

const MOCK_PROGRAMS: ProgramSummary[] = [
  {
    id: 'p1',
    title: 'Elite Hurdle Technique',
    description: 'Master the technical aspects of hurdle racing with this comprehensive program',
    coverImageUrl: 'devon_allen/hurdle_training.jpg', // Local asset path
    subscriberCount: 3875,
    price: 79.99,
    isPublic: true,
  },
  {
    id: 'p2',
    title: 'NFL Receiver Training',
    description: 'Develop the skills, speed, and agility needed to excel as a wide receiver',
    coverImageUrl: 'devon_allen/route_running.jpg', // Local asset path
    subscriberCount: 2142,
    price: 89.99,
    isPublic: true,
  },
  {
    id: 'p3',
    title: 'Sprint Speed Development',
    description: 'Increase your top-end speed and acceleration with techniques used by world-class sprinters',
    coverImageUrl: 'devon_allen/power_session.jpg', // Local asset path
    subscriberCount: 1876,
    price: 59.99,
    isPublic: true,
  },
];

const MOCK_CLUBS: ClubSummary[] = [
  {
    id: 'c1',
    name: 'Elite Hurdlers',
    memberCount: 12500,
    imageUrl: 'devon_allen/elite_hurdlers_profile.jpg', // Local asset path
    isPublic: true,
  },
  {
    id: 'c2',
    name: 'NFL Speed Academy',
    memberCount: 8700,
    imageUrl: 'devon_allen/nfl_speed_profile.jpg', // Local asset path
    isPublic: true,
  },
  {
    id: 'c3',
    name: 'Track & Field Fundamentals',
    memberCount: 5200,
    imageUrl: 'devon_allen/track_fundamentals_profile.jpg', // Local asset path
    isPublic: true,
  },
  {
    id: 'c4',
    name: 'Olympic Training Insights',
    memberCount: 18300,
    imageUrl: 'devon_allen/olympic_insights_profile.jpg', // Local asset path
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

  // Cache to prevent duplicate fetches
  const [fetchedData, setFetchedData] = useState<{
    [key: string]: {
      workouts?: boolean;
      programs?: boolean;
      clubs?: boolean;
      badges?: boolean;
    }
  }>({});

  // Load current user profile on mount - optimized to reduce initial load
  useEffect(() => {
    const loadCurrentProfile = async () => {
      setIsLoadingProfile(true);

      try {
        // Simulate API call with shorter timeout (300ms instead of 1000ms)
        await new Promise(resolve => setTimeout(resolve, 300));

        // Only fetch core profile data initially
        setCurrentProfile(MOCK_PROFILE);
      } catch (error) {
        console.error('Error loading profile:', error);
      } finally {
        setIsLoadingProfile(false);
      }
    };

    loadCurrentProfile();
  }, []);

  // Fetch profile by ID
  const fetchProfile = useCallback(async (profileId: string) => {
    setIsLoadingProfile(true);

    try {
      // Simulate API call with shorter timeout (500ms instead of 1000ms)
      await new Promise(resolve => setTimeout(resolve, 500));

      // In a real app, this would fetch from an API based on profileId
      // Using Devon Allen as the viewed profile
      const devonAllenProfile: ProfileData = {
        id: profileId,
        userId: 'auth0|654321',
        handle: 'devonallen',
        name: 'Devon Allen',
        bio: 'Olympic Hurdler & NFL Wide Receiver. World-class athlete pushing boundaries in track and football. 🏃‍♂️🏈',
        avatarUrl: 'devon_allen/profile.jpg', // Local asset path
        headerUrl: 'devon_allen/header.jpg', // Local asset path
        socialLinks: {
          instagram: 'devonallen',
          twitter: 'devonallen13',
          youtube: 'devonallen',
        },
        privacySettings: {
          workoutsPublic: true,
          clubsPublic: true,
          followersVisible: true,
          allowMessages: true,
        },
        metrics: {
          totalWorkouts: 312,
          totalPrograms: 5,
          totalClubs: 4,
          followersCount: 245000,
          followingCount: 1250,
          updatedAt: new Date(),
        },
        isVerified: true,
        isPremium: true,
        role: 'coach',
        badges: [
          {
            id: 'badge1',
            name: 'Olympic Athlete',
            description: 'Competed in the Olympic Games',
            imageUrl: 'https://via.placeholder.com/80',
            achievedAt: new Date(2021, 7, 1),
            category: 'achievement',
          },
          {
            id: 'badge2',
            name: 'NFL Player',
            description: 'Professional NFL athlete',
            imageUrl: 'https://via.placeholder.com/80',
            achievedAt: new Date(2022, 8, 15),
            category: 'achievement',
          },
          {
            id: 'badge3',
            name: 'Verified Coach',
            description: 'Elite level verified coach',
            imageUrl: 'https://via.placeholder.com/80',
            achievedAt: new Date(2022, 10, 1),
            category: 'achievement',
          },
        ],
        createdAt: new Date(2021, 1, 1),
        updatedAt: new Date(),
      };

      setViewedProfile(devonAllenProfile);
      setIsFollowing(Math.random() > 0.5); // Random for demo

      // Initialize cache entry for this profile
      setFetchedData(prev => ({
        ...prev,
        [profileId]: {}
      }));
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setIsLoadingProfile(false);
    }
  }, []);

  // Load a profile's content (workouts, programs, clubs)
  const loadProfileContent = useCallback(async (profileId: string) => {
    setIsLoadingContent(true);

    try {
      // Simulate API calls in parallel with Promise.all
      await Promise.all([
        fetchProfileData('workouts', profileId),
        fetchProfileData('programs', profileId),
        fetchProfileData('clubs', profileId)
      ]);
    } catch (error) {
      console.error('Error loading profile content:', error);
    } finally {
      setIsLoadingContent(false);
    }
  }, []);

  // Update profile
  const updateProfile = useCallback(async (profileData: Partial<ProfileData>) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));

      // In a real app, this would update the profile via API
      setCurrentProfile(prev => {
        if (!prev) return null;
        return { ...prev, ...profileData, updatedAt: new Date() };
      });
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  }, []);

  // Follow a profile
  const followProfile = useCallback(async (profileId: string) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 300));

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
    } catch (error) {
      console.error('Error following profile:', error);
    }
  }, [viewedProfile]);

  // Unfollow a profile
  const unfollowProfile = useCallback(async (profileId: string) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 300));

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
    } catch (error) {
      console.error('Error unfollowing profile:', error);
    }
  }, [viewedProfile]);

  // Optimized: Fetch specific data for a profile with caching
  const fetchProfileData = useCallback(async (category: 'workouts' | 'programs' | 'clubs' | 'badges', profileId: string): Promise<any[]> => {
    // Check if we've already fetched this data type for this profile
    if (fetchedData[profileId]?.[category]) {
      console.log(`Using cached ${category} data for profile ${profileId}`);

      // Return existing data
      switch (category) {
        case 'workouts':
          return viewedProfileWorkouts;
        case 'programs':
          return viewedProfilePrograms;
        case 'clubs':
          return viewedProfileClubs;
        case 'badges':
          return viewedProfile?.badges || [];
        default:
          return [];
      }
    }

    console.log(`Fetching ${category} for profile ${profileId}...`);
    setIsLoadingContent(true);

    try {
      // Simulate network delay - reduced from 600ms to 300ms
      await new Promise(resolve => setTimeout(resolve, 300));

      let result: any[] = [];

      switch (category) {
        case 'workouts':
          // Enhanced mock workouts for viewed profile - matching the feed page
          const sampleWorkouts = [
            {
              id: '1',
              title: 'Upper Body',
              date: new Date(),
              duration: 45,
              sets: 21,
              exercises: 7,
              completedExercises: 7,
              volume: 12500,
              personalRecords: 2,
              thumbnailUrl: 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61',
              likes: 45230,
              comments: 1243,
              isPublic: true,
            },
            {
              id: '2',
              title: 'Leg Day',
              date: new Date(Date.now() - 1000 * 60 * 60 * 24), // Yesterday
              duration: 50,
              sets: 18,
              exercises: 6,
              completedExercises: 6,
              volume: 15200,
              personalRecords: 1,
              thumbnailUrl: 'https://images.unsplash.com/photo-1584466977773-e625c37cdd50',
              likes: 38754,
              comments: 982,
              isPublic: true,
            },
            {
              id: '3',
              title: 'Core Focus',
              date: new Date(Date.now() - 1000 * 60 * 60 * 48), // 2 days ago
              duration: 30,
              sets: 15,
              exercises: 5,
              completedExercises: 5,
              volume: 2800,
              personalRecords: 0,
              thumbnailUrl: 'https://pbs.twimg.com/profile_banners/372145971/1465540138/1500x500',
              likes: 25600,
              comments: 750,
              isPublic: true,
            },
          ];

          setViewedProfileWorkouts(sampleWorkouts);
          result = sampleWorkouts;
          break;

        case 'programs':
          // Enhanced mock programs for viewed profile
          const samplePrograms = [
            {
              id: 'p1',
              title: 'Sulek Muscle Building',
              description: 'Complete program to build muscle like me',
              coverImageUrl: 'https://images.unsplash.com/photo-1532384748853-8f54a8f476e2',
              subscriberCount: 25840,
              price: 99.99,
              isPublic: true,
            },
          ];

          setViewedProfilePrograms(samplePrograms);
          result = samplePrograms;
          break;

        case 'clubs':
          // Enhanced mock clubs for viewed profile
          const sampleClubs = [
            {
              id: 'c1',
              name: 'Sulek Lifting Club',
              memberCount: 12450,
              imageUrl: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48',
              isPublic: true,
            },
          ];

          setViewedProfileClubs(sampleClubs);
          result = sampleClubs;
          break;

        case 'badges':
          // Badges are already loaded with the profile
          result = viewedProfile?.badges || [];
          break;

        default:
          result = [];
      }

      // Update the cache to indicate this data has been fetched
      setFetchedData(prev => ({
        ...prev,
        [profileId]: {
          ...(prev[profileId] || {}),
          [category]: true
        }
      }));

      return result;
    } catch (error) {
      console.error(`Error fetching ${category}:`, error);
      return [];
    } finally {
      setIsLoadingContent(false);
    }
  }, [viewedProfile, viewedProfileWorkouts, viewedProfilePrograms, viewedProfileClubs, fetchedData]);

  // Add resetViewedProfile function
  const resetViewedProfile = useCallback(() => {
    setViewedProfile(null);
    setViewedProfileWorkouts([]);
    setViewedProfilePrograms([]);
    setViewedProfileClubs([]);
    setIsFollowing(false);
  }, []);

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
        fetchProfileData,
        resetViewedProfile,
      }}
    >
      {children}
    </ProfileContext.Provider>
  );
};

// Custom hook to use the profile context
export const useProfile = () => useContext(ProfileContext);

export default ProfileContext;