import ClubTabs from '@/components/ui/ClubTabs';
import { mockClubs, mockPosts, mockUsers } from '@/data/mockData';
import { Club, Post } from '@/types/workout';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    Alert,
    FlatList,
    Image,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function SocialScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [posts, setPosts] = useState<Post[]>(mockPosts);
  const [clubs] = useState<Club[]>(mockClubs);
  const [selectedClub, setSelectedClub] = useState<Club | null>(null);
  const [activeTab, setActiveTab] = useState<'posts' | 'feed' | 'sessions' | 'about'>('posts');

  const formatPostDate = (date: Date) => {
    return new Date(date).toLocaleDateString();
  };

  const handleClubPress = (club: Club) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    // Show the club details modal
    setSelectedClub(club);
  };

  const closeClubView = () => {
    setSelectedClub(null);
  };

  const handleTabChange = (tab: 'posts' | 'feed' | 'sessions' | 'about') => {
    Haptics.selectionAsync();
    setActiveTab(tab);
  };

  const handleLikePress = (postId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    // Update the like status of the post
    const updatedPosts = posts.map(post => {
      if (post.id === postId) {
        const isLiked = !post.isLiked;
        const likeCount = isLiked ? post.likeCount + 1 : post.likeCount - 1;
        return { ...post, isLiked, likeCount };
      }
      return post;
    });

    setPosts(updatedPosts);
  };

  const handleCommentPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Alert.alert('Comments', 'Comments functionality coming soon!');
  };

  const renderClubItem = ({ item }: { item: Club }) => {
    return (
      <TouchableOpacity
        style={styles.clubCard}
        onPress={() => handleClubPress(item)}
      >
        <Image
          source={{ uri: item.imageUrl }}
          style={styles.clubImage}
        />
        <Text style={styles.clubName} numberOfLines={1}>{item.name}</Text>
        <View style={styles.clubMemberRow}>
          <Ionicons name="people-outline" size={12} style={styles.clubMemberIcon} color="#AAAAAA" />
          <Text style={styles.clubMemberCount}>{item.memberCount}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  const renderPostItem = ({ item }: { item: Post }) => {
    const author = mockUsers.find(user => user.id === item.authorId);
    const club = item.clubId ? mockClubs.find(club => club.id === item.clubId) : null;

    return (
      <View style={styles.postCard}>
        <View style={styles.postHeader}>
          <Image
            source={{ uri: author?.profileImageUrl }}
            style={styles.authorImage}
          />
          <View style={styles.postHeaderInfo}>
            <Text style={styles.authorName}>{author?.name}</Text>
            {club && (
              <TouchableOpacity onPress={() => handleClubPress(club)}>
                <Text style={styles.postClubName}>in {club.name}</Text>
              </TouchableOpacity>
            )}
          </View>
          <Text style={styles.postDate}>
            {formatPostDate(item.createdAt)}
          </Text>
        </View>

        <Text style={styles.postContent}>{item.content}</Text>

        {item.imageUrls && item.imageUrls.length > 0 && (
          <View style={styles.postImagesContainer}>
            {item.imageUrls.map((url, index) => (
              <Image
                key={`${item.id}-img-${index}`}
                source={{ uri: url }}
                style={styles.postImage}
                resizeMode="cover"
              />
            ))}
          </View>
        )}

        <View style={styles.postActions}>
          <TouchableOpacity
            style={styles.postAction}
            onPress={() => handleLikePress(item.id)}
          >
            <Ionicons
              name={item.isLiked ? "heart" : "heart-outline"}
              size={22}
              color={item.isLiked ? "#FF6B6B" : "#999"}
            />
            <Text style={styles.postActionText}>{item.likeCount}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.postAction}
            onPress={handleCommentPress}
          >
            <Ionicons name="chatbubble-outline" size={20} color="#999" />
            <Text style={styles.postActionText}>{item.commentCount}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.postAction}>
            <Ionicons name="share-social-outline" size={20} color="#999" />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  // Enhanced Club Detail Modal
  const renderClubDetailModal = () => {
    if (!selectedClub) return null;

    const clubPosts = posts.filter(post => post.clubId === selectedClub.id);

    return (
      <Modal
        animationType="slide"
        transparent={false}
        visible={!!selectedClub}
        onRequestClose={closeClubView}
      >
        <View style={[styles.container, { paddingTop: insets.top }]}>
          <View style={styles.clubView}>
            {/* Club Header */}
            <View style={styles.clubBanner}>
              <TouchableOpacity
                style={styles.backButton}
                onPress={closeClubView}
              >
                <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
              </TouchableOpacity>
            </View>

            <View style={styles.clubInfoContainer}>
              <View style={styles.clubImageContainer}>
                <Image
                  source={{ uri: selectedClub.imageUrl }}
                  style={styles.clubDetailImage}
                />
              </View>

              <View style={styles.clubInfo}>
                <Text style={styles.clubDetailName}>{selectedClub.name}</Text>
                <Text style={styles.clubDescription}>{selectedClub.description}</Text>

                <View style={styles.clubStats}>
                  <View style={styles.clubStat}>
                    <Text style={styles.clubStatValue}>{selectedClub.memberCount}</Text>
                    <Text style={styles.clubStatLabel}>Members</Text>
                  </View>

                  <View style={styles.clubStat}>
                    <Text style={styles.clubStatValue}>{selectedClub.postCount || 0}</Text>
                    <Text style={styles.clubStatLabel}>Posts</Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Tab Bar */}
            <View style={styles.tabBarContainer}>
              <BlurView intensity={30} tint="dark" style={styles.tabBar}>
                <TouchableOpacity
                  style={[styles.tab, activeTab === 'posts' && styles.activeTab]}
                  onPress={() => handleTabChange('posts')}
                >
                  <Text style={[styles.tabText, activeTab === 'posts' && styles.activeTabText]}>Posts</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.tab, activeTab === 'feed' && styles.activeTab]}
                  onPress={() => handleTabChange('feed')}
                >
                  <Text style={[styles.tabText, activeTab === 'feed' && styles.activeTabText]}>Feed</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.tab, activeTab === 'sessions' && styles.activeTab]}
                  onPress={() => handleTabChange('sessions')}
                >
                  <Text style={[styles.tabText, activeTab === 'sessions' && styles.activeTabText]}>Sessions</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.tab, activeTab === 'about' && styles.activeTab]}
                  onPress={() => handleTabChange('about')}
                >
                  <Text style={[styles.tabText, activeTab === 'about' && styles.activeTabText]}>About</Text>
                </TouchableOpacity>
              </BlurView>
            </View>

            {/* Tab Content */}
            {activeTab === 'posts' && (
              <FlatList
                data={clubPosts}
                renderItem={renderPostItem}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.feedList}
                ListEmptyComponent={
                  <View style={styles.emptyState}>
                    <Ionicons name="document-text-outline" size={48} color="#AAAAAA" />
                    <Text style={styles.emptyStateText}>No posts in this club yet</Text>
                  </View>
                }
              />
            )}

            {activeTab === 'feed' && (
              <View style={styles.tabContent}>
                <ClubTabs />
              </View>
            )}

            {activeTab === 'sessions' && (
              <View style={styles.tabContent}>
                <Text style={styles.emptyStateText}>Sessions coming soon</Text>
              </View>
            )}

            {activeTab === 'about' && (
              <ScrollView style={styles.tabContent}>
                <Text style={styles.aboutTitle}>About</Text>
                <Text style={styles.aboutText}>{selectedClub.description}</Text>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.title}>Social</Text>
        <Text style={styles.subtitle}>Connect with your fitness community</Text>
      </View>

      {/* My Clubs Row */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>My Clubs</Text>
        <TouchableOpacity>
          <Text style={styles.seeAllText}>See All</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        horizontal
        data={clubs}
        renderItem={renderClubItem}
        keyExtractor={(item) => item.id}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.clubsList}
      />

      {/* Social Feed */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Feed</Text>
      </View>

      <FlatList
        data={posts}
        renderItem={renderPostItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.feedList}
      />

      {/* Club Detail Modal */}
      {renderClubDetailModal()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  subtitle: {
    fontSize: 16,
    color: '#AAAAAA',
    marginTop: 4,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginTop: 16,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  seeAllText: {
    fontSize: 14,
    color: '#0A84FF',
  },
  // Club list styles
  clubsList: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  clubCard: {
    width: 100,
    marginRight: 12,
    alignItems: 'center',
  },
  clubImage: {
    width: 70,
    height: 70,
    borderRadius: 35,
    marginBottom: 8,
    backgroundColor: '#333333',
  },
  clubName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 2,
    textAlign: 'center',
  },
  clubMemberRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  clubMemberIcon: {
    marginRight: 4,
  },
  clubMemberCount: {
    fontSize: 12,
    color: '#AAAAAA',
  },
  // Feed styles
  feedList: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  postCard: {
    backgroundColor: '#222222',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  authorImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  postHeaderInfo: {
    flex: 1,
  },
  authorName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  postClubName: {
    fontSize: 14,
    color: '#0A84FF',
  },
  postDate: {
    fontSize: 12,
    color: '#999999',
  },
  postContent: {
    fontSize: 16,
    color: '#FFFFFF',
    marginBottom: 16,
  },
  postImagesContainer: {
    marginBottom: 16,
  },
  postImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 8,
  },
  postActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#333333',
    paddingTop: 12,
  },
  postAction: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  postActionText: {
    fontSize: 14,
    color: '#999999',
    marginLeft: 4,
  },
  // Club detail view styles
  clubView: {
    flex: 1,
  },
  clubBanner: {
    width: '100%',
    height: 150,
    backgroundColor: '#222222',
    position: 'relative',
  },
  backButton: {
    position: 'absolute',
    top: 16,
    left: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  clubInfoContainer: {
    flexDirection: 'row',
    padding: 16,
    marginBottom: 16,
  },
  clubImageContainer: {
    marginTop: -50,
  },
  clubDetailImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: '#000000',
    backgroundColor: '#222222',
  },
  clubInfo: {
    flex: 1,
    marginLeft: 16,
  },
  clubDetailName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  clubDescription: {
    fontSize: 14,
    color: '#AAAAAA',
    marginTop: 4,
    marginBottom: 8,
  },
  clubStats: {
    flexDirection: 'row',
  },
  clubStat: {
    marginRight: 20,
  },
  clubStatValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  clubStatLabel: {
    fontSize: 12,
    color: '#AAAAAA',
  },
  // Tab Bar styles
  tabBarContainer: {
    overflow: 'hidden',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    marginBottom: 2,
  },
  tabBar: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'rgba(30, 30, 30, 0.5)',
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#0A84FF',
  },
  tabText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#8E8E93',
  },
  activeTabText: {
    color: '#FFFFFF',
  },
  // Tab Content styles
  tabContent: {
    flex: 1,
    padding: 16,
  },
  aboutTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  aboutText: {
    fontSize: 15,
    color: '#E5E5EA',
    lineHeight: 22,
  },
  // Empty state
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#AAAAAA',
    marginTop: 16,
  },
});