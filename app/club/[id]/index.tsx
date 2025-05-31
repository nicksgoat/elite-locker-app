import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  Image,
  ImageBackground,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import IMessagePageWrapper from '../../../components/layout/iMessagePageWrapper';
import ClubTabs from '../../../components/ui/ClubTabs';
import { useAuthContext } from '../../../contexts/AuthContext';
import { clubService } from '../../../services/clubService';
import { Club } from '../../../types/workout';

const { width: screenWidth } = Dimensions.get('window');

/**
 * Club Detail Screen
 *
 * Displays detailed information about a specific club with tabs and full functionality.
 */
export default function ClubDetailScreen() {
  const { id, clubData } = useLocalSearchParams<{ id: string; clubData?: string }>();
  const { user } = useAuthContext();
  const insets = useSafeAreaInsets();
  const [club, setClub] = useState<Club | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'posts' | 'events' | 'members' | 'chats' | 'memberships'>('posts');
  const [isOwner, setIsOwner] = useState(false);
  const [isMember, setIsMember] = useState(false);
  const [membershipLoading, setMembershipLoading] = useState(false);

  // Parse passed club data if available
  const passedClubData = clubData ? JSON.parse(clubData as string) : null;

  useEffect(() => {
    if (id) {
      loadClub();
    }
  }, [id]);

  const loadClub = async () => {
    try {
      setLoading(true);
      setError(null);

      // If we have passed club data, use it first
      if (passedClubData) {
        const clubFromData: Club = {
          id: passedClubData.id,
          name: passedClubData.name,
          description: passedClubData.description,
          owner_id: 'owner_id',
          created_at: new Date(),
          updated_at: new Date(),
          member_count: passedClubData.memberCount || 0,
          is_paid: passedClubData.price > 0,
          price: passedClubData.price,
          profile_image_url: passedClubData.profileImageUrl,
          banner_image_url: passedClubData.coverImageUrl,
        };

        setClub(clubFromData);
        setLoading(false);
        return;
      }

      // Validate the club ID
      if (!id || typeof id !== 'string' || id.trim() === '') {
        setError('Invalid club ID');
        return;
      }

      const clubData = await clubService.getClub(id.trim());
      setClub(clubData);

      // Check if current user is the owner and member
      if (user && clubData) {
        setIsOwner(clubData.owner_id === user.id);

        // Check if user is a member by fetching memberships
        await checkMembership();
      }
    } catch (err: any) {
      console.error('Error loading club:', err);

      // Handle specific error cases
      if (err?.statusCode === 404 || err?.message?.includes('not found')) {
        setError('Club not found. It may have been deleted or moved.');
      } else if (err?.statusCode === 400) {
        setError('Invalid club ID provided.');
      } else {
        setError('Failed to load club details. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const checkMembership = async () => {
    if (!user || !id) return;

    try {
      const memberships = await clubService.getMyMemberships();
      const isMemberOfClub = memberships.some(membership =>
        membership.club && membership.club.id === id
      );
      setIsMember(isMemberOfClub);
    } catch (err) {
      console.error('Error checking membership:', err);
      setIsMember(false);
    }
  };

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };

  const handleTabPress = (tab: 'posts' | 'events' | 'members' | 'chats' | 'memberships') => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setActiveTab(tab);
  };

  const handleJoinLeave = async () => {
    if (!user || !club) return;

    setMembershipLoading(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    try {
      if (isMember) {
        // Leave club
        await clubService.leaveClub(club.id);
        setIsMember(false);

        // Update member count
        setClub(prev => prev ? { ...prev, member_count: (prev.member_count || 1) - 1 } : null);
      } else {
        // Join club
        await clubService.joinClub(club.id);
        setIsMember(true);

        // Update member count
        setClub(prev => prev ? { ...prev, member_count: (prev.member_count || 0) + 1 } : null);
      }
    } catch (err) {
      console.error('Error updating membership:', err);
      // Show error to user
      const action = isMember ? 'leave' : 'join';
      alert(`Failed to ${action} club. Please try again.`);
    } finally {
      setMembershipLoading(false);
    }
  };

  const handleManageClub = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    // Navigate to club management screen
    router.push(`/club/${id}/manage`);
  };

  const handleCreatePost = () => {
    if (!isMember && !isOwner) {
      alert('You must be a member to create posts in this club.');
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(`/club/${id}/create-post`);
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0A84FF" />
          <Text style={styles.loadingText}>Loading club...</Text>
        </View>
      </View>
    );
  }

  if (error || !club) {
    return (
      <IMessagePageWrapper title="Error" subtitle="Club not found">
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={48} color="#FF3B30" />
          <Text style={styles.errorText}>{error || 'Club not found'}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadClub}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </IMessagePageWrapper>
    );
  }

  // Get the club image for bleeding effect - use banner or profile image as fallback
  const getClubImage = () => {
    if (club?.banner_image_url) {
      return { uri: club.banner_image_url };
    }
    if (club?.profile_image_url) {
      return { uri: club.profile_image_url };
    }
    // Fallback to a default club image
    return require('../../../assets/images/marketplace/clubs.jpg');
  };

  return (
    <View style={styles.container}>
      {/* Extended background image that bleeds down */}
      <View style={styles.extendedBackground}>
        <ImageBackground
          source={getClubImage()}
          style={styles.extendedBackgroundImage}
          imageStyle={{ resizeMode: 'cover' }}
        />
        <LinearGradient
          colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0.1)', 'rgba(0,0,0,0.5)', 'rgba(0,0,0,0.9)', 'rgba(0,0,0,1)']}
          locations={[0, 0.2, 0.4, 0.7, 1]}
          style={styles.extendedGradient}
        />
      </View>

      {/* SweatPals-style Header with Background Image */}
      <View style={styles.headerContainer}>
        <ImageBackground
          source={getClubImage()}
          style={styles.headerBackground}
          imageStyle={styles.headerBackgroundImage}
        >
          <LinearGradient
            colors={['rgba(0,0,0,0.2)', 'rgba(0,0,0,0.8)']}
            style={styles.headerGradient}
          >
            {/* Top Navigation Bar */}
            <View style={[styles.topNavigation, { paddingTop: insets.top + 10 }]}>
              <TouchableOpacity
                style={styles.backButton}
                onPress={handleBack}
                activeOpacity={0.8}
              >
                <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
              </TouchableOpacity>

              <View style={styles.topRightButtons}>
                <TouchableOpacity style={styles.shareButton} activeOpacity={0.8}>
                  <Ionicons name="share-outline" size={20} color="#FFFFFF" />
                  <Text style={styles.shareButtonText}>Share</Text>
                </TouchableOpacity>

                {/* Manage/Join Button */}
                {isOwner ? (
                  <TouchableOpacity style={styles.manageHeaderButton} onPress={handleManageClub} activeOpacity={0.8}>
                    <Ionicons name="settings-outline" size={20} color="#FFFFFF" />
                    <Text style={styles.manageHeaderButtonText}>Manage</Text>
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity
                    style={[styles.joinHeaderButton, isMember && styles.leaveHeaderButton]}
                    onPress={handleJoinLeave}
                    disabled={membershipLoading}
                    activeOpacity={0.8}
                  >
                    <Ionicons
                      name={isMember ? "exit-outline" : "add-outline"}
                      size={20}
                      color="#FFFFFF"
                    />
                    <Text style={styles.joinHeaderButtonText}>
                      {membershipLoading ? "..." : isMember ? "Leave" : "Join"}
                    </Text>
                  </TouchableOpacity>
                )}

                <TouchableOpacity style={styles.menuButton} activeOpacity={0.8}>
                  <Ionicons name="ellipsis-horizontal" size={20} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
            </View>

            {/* Club Avatar and Info in Header */}
            <View style={styles.headerContent}>
              <View style={styles.clubImageContainer}>
                {club?.profile_image_url ? (
                  <Image source={{ uri: club.profile_image_url }} style={styles.clubImage} />
                ) : (
                  <View style={styles.clubImagePlaceholder}>
                    <Text style={styles.clubImageInitial}>
                      {club?.name?.charAt(0).toUpperCase() || 'C'}
                    </Text>
                  </View>
                )}
              </View>

              <Text style={styles.clubName}>{club?.name || 'Club'}</Text>

              {club?.description && (
                <Text style={styles.clubDescription} numberOfLines={2}>
                  {club.description}
                </Text>
              )}
            </View>
          </LinearGradient>
        </ImageBackground>
      </View>

      {/* Extended background image that bleeds down from header */}
      <View style={styles.extendedBackground}>
        <ImageBackground
          source={getClubImage()}
          style={styles.extendedBackgroundImage}
          imageStyle={{ resizeMode: 'cover' }}
        />
        <LinearGradient
          colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0.1)', 'rgba(0,0,0,0.5)', 'rgba(0,0,0,0.9)', 'rgba(0,0,0,1)']}
          locations={[0, 0.2, 0.4, 0.7, 1]}
          style={styles.extendedGradient}
        />
      </View>

      {/* SweatPals-style Tab Navigation */}
      <View style={styles.tabContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.tabScrollView}
          contentContainerStyle={styles.tabScrollContent}
        >
          <TouchableOpacity
            style={[styles.tab, activeTab === 'chats' && styles.activeTab]}
            onPress={() => handleTabPress('chats')}
          >
            <Text style={[styles.tabText, activeTab === 'chats' && styles.activeTabText]}>
              Chats
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'events' && styles.activeTab]}
            onPress={() => handleTabPress('events')}
          >
            <Text style={[styles.tabText, activeTab === 'events' && styles.activeTabText]}>
              Events
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'memberships' && styles.activeTab]}
            onPress={() => handleTabPress('memberships')}
          >
            <Text style={[styles.tabText, activeTab === 'memberships' && styles.activeTabText]}>
              Memberships
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'posts' && styles.activeTab]}
            onPress={() => handleTabPress('posts')}
          >
            <Text style={[styles.tabText, activeTab === 'posts' && styles.activeTabText]}>
              Posts
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'members' && styles.activeTab]}
            onPress={() => handleTabPress('members')}
          >
            <Text style={[styles.tabText, activeTab === 'members' && styles.activeTabText]}>
              Members
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* Tab Content with transparent background for bleeding effect */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {activeTab === 'posts' && (
          <View style={styles.tabContentSection}>
            <ClubTabs clubId={id} />
          </View>
        )}

        {activeTab === 'events' && (
          <View style={styles.tabContentSection}>
            <Text style={styles.emptyStateText}>Events coming soon</Text>
          </View>
        )}

        {activeTab === 'members' && (
          <View style={styles.tabContentSection}>
            <Text style={styles.emptyStateText}>Members list coming soon</Text>
          </View>
        )}

        {activeTab === 'chats' && (
          <View style={styles.tabContentSection}>
            <Text style={styles.emptyStateText}>Club chats coming soon</Text>
          </View>
        )}

        {activeTab === 'memberships' && (
          <View style={styles.tabContentSection}>
            <Text style={styles.emptyStateText}>Membership tiers coming soon</Text>
          </View>
        )}
      </ScrollView>

      {/* Floating Action Button for Creating Posts */}
      {(isMember || isOwner) && activeTab === 'posts' && (
        <View style={styles.fabContainer}>
          <BlurView intensity={40} tint="dark" style={styles.fabBlur}>
            <TouchableOpacity style={styles.fab} onPress={handleCreatePost}>
              <LinearGradient
                colors={['#0A84FF', '#007AFF']}
                style={styles.fabGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Ionicons name="add" size={24} color="#FFFFFF" />
              </LinearGradient>
            </TouchableOpacity>
          </BlurView>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  // Spotify Bleeding Effect Styles - positioned below header
  extendedBackground: {
    position: 'absolute',
    top: 230, // Start below the header
    left: 0,
    right: 0,
    height: 800,
    zIndex: 1,
  },
  extendedBackgroundImage: {
    position: 'absolute',
    top: -100, // Pull the image up to connect with header
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.4,
  },
  extendedGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 50,
    zIndex: 2,
  },
  loadingText: {
    color: '#FFFFFF',
    marginTop: 16,
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: '#FF3B30',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: 'rgba(28, 28, 30, 0.8)',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },

  headerContainer: {
    position: 'relative',
    zIndex: 2,
  },
  headerBackground: {
    height: 230,
    width: '100%',
  },
  headerBackgroundImage: {
    resizeMode: 'cover',
  },
  headerGradient: {
    flex: 1,
    justifyContent: 'space-between',
  },
  topNavigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 10,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  topRightButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
  },
  shareButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  manageHeaderButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
  },
  manageHeaderButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  joinHeaderButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
  },
  leaveHeaderButton: {
    backgroundColor: 'rgba(255, 59, 48, 0.8)',
  },
  joinHeaderButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  menuButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'left',
    alignItems: 'left',
  },
  headerContent: {
    alignItems: 'left',
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  clubName: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
    marginTop: 16,
    textAlign: 'left',
  },
  clubImageContainer: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8, // Android shadow
  },

  clubDescription: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 15,
    lineHeight: 20,
    marginTop: 4,
    textAlign: 'left',
    paddingHorizontal: 0,
  },
  // Content styles
  content: {
    flex: 1,
    backgroundColor: 'transparent',
    zIndex: 2,
  },
  tabContentSection: {
    paddingHorizontal: 16,
    paddingTop: 20,
  },

  // Tab styles
  tabContainer: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
    backgroundColor: 'transparent',
    zIndex: 2,
  },
  tabScrollView: {
    flexGrow: 0,
  },
  tabScrollContent: {
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  tab: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    alignItems: 'center',
    position: 'relative',
    marginRight: 8,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#FFFFFF',
  },
  tabText: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 16,
    fontWeight: '600',
  },
  activeTabText: {
    color: '#FFFFFF',
  },
  emptyStateText: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 40,
  },
  aboutTitle: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 16,
  },
  aboutText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 20,
  },
  // FAB styles
  fabContainer: {
    position: 'absolute',
    bottom: 20,
    right: 20,
  },
  fabBlur: {
    borderRadius: 28,
    overflow: 'hidden',
  },
  fab: {
    width: 56,
    height: 56,
    borderRadius: 28,
    overflow: 'hidden',
  },
  fabGradient: {
    width: 56,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
