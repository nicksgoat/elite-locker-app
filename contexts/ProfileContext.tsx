import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { profileService } from '../services/profileService';

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
  avatarUrl: 'https://pbs.twimg.com/profile_images/1745305109008154624/oO6jSpTf_400x400.jpg',
  headerUrl: 'https://pbs.twimg.com/profile_banners/372145971/1465540138/1500x500',
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

  // Add loading state to prevent duplicate loads
  const [isInitializing, setIsInitializing] = useState(false);

  // Load current user profile on mount - using real data
  useEffect(() => {
    const loadCurrentProfile = async () => {
      // Prevent duplicate initialization
      if (isInitializing || currentProfile) {
        return;
      }

      setIsInitializing(true);
      setIsLoadingProfile(true);

      try {
        // Fetch real profile data from Supabase
        const profileData = await profileService.getMyProfile();

        if (profileData) {
          // Transform the Supabase data to match our ProfileData interface
          const transformedProfile: ProfileData = {
            id: profileData.id,
            userId: profileData.id, // In Supabase, the profile id is the user id
            handle: profileData.username || '',
            name: profileData.full_name || '',
            bio: profileData.bio || '',
            avatarUrl: profileData.avatar_url || '',
            headerUrl: '', // Not in current schema
            socialLinks: {}, // Not in current schema
            privacySettings: {
              workoutsPublic: true,
              clubsPublic: true,
              followersVisible: true,
              allowMessages: true,
            },
            metrics: {
              totalWorkouts: 0, // Will be calculated from actual data
              totalPrograms: 0, // Will be calculated from actual data
              totalClubs: 0, // Will be calculated from actual data
              followersCount: profileData.followers_count || 0,
              followingCount: profileData.following_count || 0,
              updatedAt: new Date(profileData.updated_at),
            },
            isVerified: false, // Not in current schema
            isPremium: false, // Not in current schema
            role: 'user', // Default role
            badges: [], // Not in current schema
            createdAt: new Date(profileData.created_at),
            updatedAt: new Date(profileData.updated_at),
          };

          setCurrentProfile(transformedProfile);

          // Load user's clubs
          const userClubs = await profileService.getProfileClubs(profileData.id);
          console.log('ProfileContext - Raw user clubs from service:', userClubs);

          if (userClubs) {
            const transformedClubs: ClubSummary[] = userClubs.map(club => ({
              id: club.id,
              name: club.name,
              memberCount: club.member_count || 0,
              imageUrl: club.profile_image_url || '',
              isPublic: !club.is_paid,
            }));
            console.log('ProfileContext - Transformed clubs:', transformedClubs);
            setCurrentProfileClubs(transformedClubs);

            // Update metrics with actual club count
            setCurrentProfile(prev => prev ? {
              ...prev,
              metrics: {
                ...prev.metrics,
                totalClubs: transformedClubs.length,
              }
            } : null);
          }
        }
      } catch (error) {
        console.error('Error loading profile:', error);
        // Fallback to mock data if real data fails
        setCurrentProfile(MOCK_PROFILE);
      } finally {
        setIsLoadingProfile(false);
        setIsInitializing(false);
      }
    };

    loadCurrentProfile();
  }, [currentProfile, isInitializing]);

  // Fetch profile by ID
  const fetchProfile = useCallback(async (profileId: string) => {
    setIsLoadingProfile(true);

    try {
      // Fetch real profile data from Supabase
      const profileData = await profileService.getProfile(profileId);

      if (profileData) {
        // Transform the Supabase data to match our ProfileData interface
        const transformedProfile: ProfileData = {
          id: profileData.id,
          userId: profileData.id,
          handle: profileData.username || '',
          name: profileData.full_name || '',
          bio: profileData.bio || '',
          avatarUrl: profileData.avatar_url || '',
          headerUrl: '',
          socialLinks: {},
          privacySettings: {
            workoutsPublic: true,
            clubsPublic: true,
            followersVisible: true,
            allowMessages: true,
          },
          metrics: {
            totalWorkouts: 0,
            totalPrograms: 0,
            totalClubs: 0,
            followersCount: profileData.followers_count || 0,
            followingCount: profileData.following_count || 0,
            updatedAt: new Date(profileData.updated_at),
          },
          isVerified: false,
          isPremium: false,
          role: 'user',
          badges: [],
          createdAt: new Date(profileData.created_at),
          updatedAt: new Date(profileData.updated_at),
        };

        setViewedProfile(transformedProfile);
        setIsFollowing(false); // TODO: Check if current user follows this profile

        // Initialize cache entry for this profile
        setFetchedData(prev => ({
          ...prev,
          [profileId]: {}
        }));
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      // Fallback to mock data for demo
      const devonAllenProfile: ProfileData = {
        id: profileId,
        userId: 'auth0|654321',
        handle: 'devonallen',
        name: 'Devon Allen',
        bio: 'Olympic Hurdler & NFL Wide Receiver. World-class athlete pushing boundaries in track and football. 🏃‍♂️🏈',
        avatarUrl: 'https://pbs.twimg.com/profile_images/1745305109008154624/oO6jSpTf_400x400.jpg',
        headerUrl: 'https://pbs.twimg.com/profile_banners/372145971/1465540138/1500x500',
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
      setIsFollowing(Math.random() > 0.5);
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
      // Ensure we have a current profile to update
      if (!currentProfile) {
        throw new Error('No current profile to update');
      }

      // Prepare update data with defensive checks
      const updateData = {
        username: profileData.handle || currentProfile.handle,
        full_name: profileData.name || currentProfile.name,
        bio: profileData.bio || currentProfile.bio,
        avatar_url: profileData.avatarUrl || currentProfile.avatarUrl,
        header_url: profileData.headerUrl || currentProfile.headerUrl,
      };

      // Use real profile service to update
      await profileService.updateProfile(updateData);

      // Update local state
      setCurrentProfile(prev => {
        if (!prev) return null;
        return {
          ...prev,
          ...profileData,
          metrics: {
            ...prev.metrics,
            updatedAt: new Date()
          }
        };
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error; // Re-throw to allow caller to handle
    }
  }, [currentProfile]);

  // Follow a profile
  const followProfile = useCallback(async (profileId: string) => {
    try {
      // TODO: Implement real follow functionality
      await new Promise(resolve => setTimeout(resolve, 300));

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
      // TODO: Implement real unfollow functionality
      await new Promise(resolve => setTimeout(resolve, 300));

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
      let result: any[] = [];

      switch (category) {
        case 'workouts':
          // Try to fetch real workout data
          try {
            const workouts = await profileService.getProfileWorkouts(profileId);
            if (workouts && workouts.length > 0) {
              const transformedWorkouts = workouts.map(workout => ({
                id: workout.id,
                title: workout.title || 'Workout',
                date: new Date(workout.created_at),
                duration: workout.duration || 0,
                sets: workout.sets || 0,
                thumbnailUrl: workout.thumbnail_url,
                likes: 0, // Not in current schema
                comments: 0, // Not in current schema
                isPublic: true, // Default
              }));
              setViewedProfileWorkouts(transformedWorkouts);
              result = transformedWorkouts;
            } else {
              // Fallback to mock data
              result = [];
            }
          } catch (error) {
            console.error('Error fetching real workouts:', error);
            result = [];
          }
          break;

        case 'programs':
          // Try to fetch real program data
          try {
            const programs = await profileService.getProfilePrograms(profileId);
            if (programs && programs.length > 0) {
              const transformedPrograms = programs.map(program => ({
                id: program.id,
                title: program.title,
                description: program.description || '',
                coverImageUrl: program.thumbnail_url,
                subscriberCount: 0, // Not in current schema
                price: program.price || 0,
                isPublic: !program.is_paid,
              }));
              setViewedProfilePrograms(transformedPrograms);
              result = transformedPrograms;
            } else {
              result = [];
            }
          } catch (error) {
            console.error('Error fetching real programs:', error);
            result = [];
          }
          break;

        case 'clubs':
          // Try to fetch real club data
          try {
            const clubs = await profileService.getProfileClubs(profileId);
            if (clubs && clubs.length > 0) {
              const transformedClubs = clubs.map(club => ({
                id: club.id,
                name: club.name,
                memberCount: club.member_count || 0,
                imageUrl: club.profile_image_url || '',
                isPublic: !club.is_paid,
              }));
              setViewedProfileClubs(transformedClubs);
              result = transformedClubs;
            } else {
              result = [];
            }
          } catch (error) {
            console.error('Error fetching real clubs:', error);
            result = [];
          }
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
