import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TextInput,
  FlatList,
  StyleSheet,
  Alert,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { fetchData } from '@/lib/api';

interface User {
  id: string;
  username: string;
  full_name: string;
  avatar_url?: string;
}

interface WorkoutInviteModalProps {
  visible: boolean;
  onClose: () => void;
  workoutId: string;
  workoutName: string;
  onInviteSent: (invitedUsers: User[]) => void;
}

export const WorkoutInviteModal: React.FC<WorkoutInviteModalProps> = ({
  visible,
  onClose,
  workoutId,
  workoutName,
  onInviteSent,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [friends, setFriends] = useState<User[]>([]);

  useEffect(() => {
    if (visible) {
      loadFriends();
    }
  }, [visible]);

  const loadFriends = async () => {
    try {
      // Load user's friends/followers for quick selection
      const friendsData = await fetchData('profiles', {
        select: 'id, username, full_name, avatar_url',
        limit: 20
      });
      setFriends(friendsData || []);
    } catch (error) {
      console.error('Error loading friends:', error);
    }
  };

  const searchUsers = async (query: string) => {
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }

    setLoading(true);
    try {
      const results = await fetchData('profiles', {
        select: 'id, username, full_name, avatar_url',
        filters: {
          or: `username.ilike.%${query}%,full_name.ilike.%${query}%`
        },
        limit: 10
      });
      setSearchResults(results || []);
    } catch (error) {
      console.error('Error searching users:', error);
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    searchUsers(query);
  };

  const toggleUserSelection = (user: User) => {
    setSelectedUsers(prev => {
      const isSelected = prev.find(u => u.id === user.id);
      if (isSelected) {
        return prev.filter(u => u.id !== user.id);
      } else {
        return [...prev, user];
      }
    });
  };

  const sendInvitations = async () => {
    if (selectedUsers.length === 0) {
      Alert.alert('No Users Selected', 'Please select at least one user to invite.');
      return;
    }

    setLoading(true);
    try {
      // Create workout invitations
      const invitations = selectedUsers.map(user => ({
        workout_id: workoutId,
        invited_user_id: user.id,
        status: 'pending',
        created_at: new Date().toISOString()
      }));

      // Insert invitations into database
      await fetchData('workout_invitations', {
        method: 'POST',
        body: invitations
      });

      // Send push notifications (would implement with actual notification service)
      // await sendPushNotifications(selectedUsers, workoutName);

      onInviteSent(selectedUsers);
      Alert.alert(
        'Invitations Sent!',
        `Successfully invited ${selectedUsers.length} user(s) to join your workout.`
      );
      
      // Reset state
      setSelectedUsers([]);
      setSearchQuery('');
      setSearchResults([]);
      onClose();
    } catch (error) {
      console.error('Error sending invitations:', error);
      Alert.alert('Error', 'Failed to send invitations. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderUserItem = ({ item }: { item: User }) => {
    const isSelected = selectedUsers.find(u => u.id === item.id);
    
    return (
      <TouchableOpacity
        style={[styles.userItem, isSelected && styles.selectedUserItem]}
        onPress={() => toggleUserSelection(item)}
      >
        <View style={styles.userAvatar}>
          <Text style={styles.userAvatarText}>
            {item.full_name?.charAt(0) || item.username.charAt(0)}
          </Text>
        </View>
        <View style={styles.userInfo}>
          <Text style={styles.userName}>{item.full_name || item.username}</Text>
          <Text style={styles.userHandle}>@{item.username}</Text>
        </View>
        {isSelected && (
          <Ionicons name="checkmark-circle" size={24} color="#007AFF" />
        )}
      </TouchableOpacity>
    );
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <BlurView intensity={100} tint="dark" style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.title}>Invite to Workout</Text>
          <TouchableOpacity
            onPress={sendInvitations}
            style={[styles.sendButton, selectedUsers.length === 0 && styles.sendButtonDisabled]}
            disabled={selectedUsers.length === 0 || loading}
          >
            <Text style={[styles.sendButtonText, selectedUsers.length === 0 && styles.sendButtonTextDisabled]}>
              Send ({selectedUsers.length})
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          <Text style={styles.workoutName}>{workoutName}</Text>
          
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={20} color="#8E8E93" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search users..."
              placeholderTextColor="#8E8E93"
              value={searchQuery}
              onChangeText={handleSearch}
              autoCapitalize="none"
            />
          </View>

          {selectedUsers.length > 0 && (
            <View style={styles.selectedUsersContainer}>
              <Text style={styles.sectionTitle}>Selected ({selectedUsers.length})</Text>
              <FlatList
                horizontal
                data={selectedUsers}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.selectedUserChip}
                    onPress={() => toggleUserSelection(item)}
                  >
                    <Text style={styles.selectedUserChipText}>{item.username}</Text>
                    <Ionicons name="close" size={16} color="#FFFFFF" />
                  </TouchableOpacity>
                )}
                showsHorizontalScrollIndicator={false}
              />
            </View>
          )}

          <View style={styles.usersListContainer}>
            <Text style={styles.sectionTitle}>
              {searchQuery ? 'Search Results' : 'Quick Select'}
            </Text>
            <FlatList
              data={searchQuery ? searchResults : friends}
              keyExtractor={(item) => item.id}
              renderItem={renderUserItem}
              showsVerticalScrollIndicator={false}
              ListEmptyComponent={
                <Text style={styles.emptyText}>
                  {searchQuery ? 'No users found' : 'No friends available'}
                </Text>
              }
            />
          </View>
        </View>
      </BlurView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#2C2C2E',
  },
  closeButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#2C2C2E',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  sendButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#007AFF',
    borderRadius: 20,
  },
  sendButtonDisabled: {
    backgroundColor: '#2C2C2E',
  },
  sendButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
  },
  sendButtonTextDisabled: {
    color: '#8E8E93',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  workoutName: {
    fontSize: 16,
    color: '#8E8E93',
    marginBottom: 20,
    textAlign: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2C2C2E',
    borderRadius: 12,
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 16,
    paddingVertical: 12,
  },
  selectedUsersContainer: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  selectedUserChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#007AFF',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
  },
  selectedUserChipText: {
    color: '#FFFFFF',
    fontSize: 14,
    marginRight: 6,
  },
  usersListContainer: {
    flex: 1,
  },
  userItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#1C1C1E',
    borderRadius: 12,
    marginBottom: 8,
  },
  selectedUserItem: {
    backgroundColor: '#2C2C2E',
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#007AFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  userAvatarText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
  userHandle: {
    color: '#8E8E93',
    fontSize: 14,
  },
  emptyText: {
    color: '#8E8E93',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 40,
  },
});
