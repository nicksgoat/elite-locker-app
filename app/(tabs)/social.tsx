import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import React, { useState, useRef } from 'react';
import {
  Alert,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Pressable,
} from 'react-native';
import Animated, { FadeIn, FadeInDown, FadeOut } from 'react-native-reanimated';
import IMessagePageWrapper from '@/components/layout/iMessagePageWrapper';
import { mockClubs, mockEvents, mockPosts, mockUsers } from '@/data/mockData';
import { Club, Event, Post } from '@/types/workout';
import { v4 as uuidv4 } from 'uuid';
import DateTimePicker from '@react-native-community/datetimepicker';

export default function SocialScreen() {
  const router = useRouter();
  const [posts, setPosts] = useState<Post[]>(mockPosts);
  const [clubs, setClubs] = useState<Club[]>(mockClubs);
  const [events, setEvents] = useState<Event[]>(mockEvents);
  const [selectedClub, setSelectedClub] = useState<Club | null>(null);
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [showCreateEvent, setShowCreateEvent] = useState(false);
  const [isShowingEvents, setIsShowingEvents] = useState(false);
  
  // Post creation state
  const [postContent, setPostContent] = useState('');
  const [postImageUrl, setPostImageUrl] = useState('');
  
  // Event creation state
  const [eventTitle, setEventTitle] = useState('');
  const [eventDescription, setEventDescription] = useState('');
  const [eventLocation, setEventLocation] = useState('');
  const [eventDate, setEventDate] = useState(new Date());
  const [eventDuration, setEventDuration] = useState('60'); // minutes
  const [eventMaxAttendees, setEventMaxAttendees] = useState('20');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [eventIsPaid, setEventIsPaid] = useState(false);
  const [eventPrice, setEventPrice] = useState('');

  const flatListRef = useRef<FlatList>(null);

  const handleClubPress = (club: Club) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedClub(club);
  };

  const closeClubView = () => {
    setSelectedClub(null);
    setIsShowingEvents(false);
  };

  const openCreatePost = () => {
    setShowCreatePost(true);
    setPostContent('');
    setPostImageUrl('');
  };

  const closeCreatePost = () => {
    setShowCreatePost(false);
  };

  const openCreateEvent = () => {
    setShowCreateEvent(true);
    setEventTitle('');
    setEventDescription('');
    setEventLocation('');
    setEventDate(new Date());
    setEventDuration('60');
    setEventMaxAttendees('20');
    setEventIsPaid(false);
    setEventPrice('');
  };

  const closeCreateEvent = () => {
    setShowCreateEvent(false);
  };

  const toggleShowEvents = () => {
    setIsShowingEvents(!isShowingEvents);
  };

  const handleCommentPress = (postId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    // In a real app, navigate to comments view
    Alert.alert('Comments', 'Comments functionality coming soon!');
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

  const handleAttendEvent = (eventId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    // Update the attendees count
    const updatedEvents = events.map(event => {
      if (event.id === eventId) {
        if (event.currentAttendees < (event.maxAttendees || Infinity)) {
          return { ...event, currentAttendees: event.currentAttendees + 1 };
        }
      }
      return event;
    });
    
    setEvents(updatedEvents);
    Alert.alert('Success', 'You are now attending this event!');
  };

  const createPost = () => {
    if (!postContent.trim()) {
      Alert.alert('Error', 'Please enter some content for your post');
      return;
    }

    const newPost: Post = {
      id: uuidv4(),
      authorId: 'user1', // Replace with actual user ID in a real app
      clubId: selectedClub?.id,
      content: postContent,
      imageUrls: postImageUrl ? [postImageUrl] : [],
      createdAt: new Date(),
      updatedAt: new Date(),
      likeCount: 0,
      commentCount: 0,
      isLiked: false,
    };
    
    setPosts([newPost, ...posts]);
    setShowCreatePost(false);
    
    // Scroll to top after creating post
    setTimeout(() => {
      flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
    }, 300);
    
    // Show success message
    Alert.alert('Success', 'Post created successfully!');
  };

  const createEvent = () => {
    if (!eventTitle.trim()) {
      Alert.alert('Error', 'Please enter an event title');
      return;
    }

    if (!eventLocation.trim()) {
      Alert.alert('Error', 'Please enter an event location');
      return;
    }

    if (eventIsPaid && (!eventPrice || parseFloat(eventPrice) <= 0)) {
      Alert.alert('Error', 'Please enter a valid price for the paid event');
      return;
    }

    const newEvent: Event = {
      id: uuidv4(),
      title: eventTitle,
      description: eventDescription,
      location: eventLocation,
      date: eventDate,
      duration: parseInt(eventDuration),
      maxAttendees: parseInt(eventMaxAttendees),
      currentAttendees: 0,
      clubId: selectedClub?.id || 'club1',
      createdAt: new Date(),
      isPaid: eventIsPaid,
      price: eventIsPaid ? parseFloat(eventPrice) : undefined,
      hostId: 'user1', // Replace with actual user ID in a real app
    };
    
    setEvents([newEvent, ...events]);
    setShowCreateEvent(false);
    
    // Show success message
    Alert.alert('Success', 'Event created successfully!');
    
    // Show the events tab after creating an event
    setIsShowingEvents(true);
  };

  const onChangeEventDate = (event: any, selectedDate?: Date) => {
    const currentDate = selectedDate || eventDate;
    setShowDatePicker(Platform.OS === 'ios');
    setEventDate(currentDate);
  };

  const renderPostItem = ({ item }: { item: Post }) => {
    const author = mockUsers.find(user => user.id === item.authorId);
    const club = item.clubId ? mockClubs.find(club => club.id === item.clubId) : null;
    
    return (
      <Animated.View 
        style={styles.postCard}
        entering={FadeInDown.duration(300)}
      >
        <View style={styles.postHeader}>
          <Image 
            source={{ uri: author?.profileImageUrl }}
            style={styles.authorImage}
          />
          <View style={styles.postHeaderInfo}>
            <Text style={styles.authorName}>{author?.name}</Text>
            {club && (
              <TouchableOpacity onPress={() => handleClubPress(club)}>
                <Text style={styles.clubName}>in {club.name}</Text>
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
                style={[
                  styles.postImage,
                  item.imageUrls.length > 1 && { width: '49%' }
                ]}
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
            onPress={() => handleCommentPress(item.id)}
          >
            <Ionicons name="chatbubble-outline" size={20} color="#999" />
            <Text style={styles.postActionText}>{item.commentCount}</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.postAction}>
            <Ionicons name="share-social-outline" size={20} color="#999" />
          </TouchableOpacity>
        </View>
      </Animated.View>
    );
  };

  const renderEventItem = ({ item }: { item: Event }) => {
    const isPast = new Date(item.date) < new Date();
    const isAtCapacity = item.maxAttendees !== undefined && item.currentAttendees >= item.maxAttendees;
    
    return (
      <Animated.View
        style={[
          styles.eventCard,
          isPast && styles.pastEventCard
        ]}
        entering={FadeInDown.duration(300)}
      >
        <View style={styles.eventCardHeader}>
          <Text style={styles.eventTitle}>{item.title}</Text>
          {item.isPaid && (
            <View style={styles.priceBadge}>
              <Text style={styles.priceText}>${item.price?.toFixed(2)}</Text>
            </View>
          )}
        </View>
        
        {item.description && (
          <Text style={styles.eventDescription}>{item.description}</Text>
        )}
        
        <View style={styles.eventDetails}>
          <View style={styles.eventDetail}>
            <Ionicons name="calendar-outline" size={16} color="#999" />
            <Text style={styles.eventDetailText}>
              {formatEventDate(item.date)}
            </Text>
          </View>
          
          <View style={styles.eventDetail}>
            <Ionicons name="time-outline" size={16} color="#999" />
            <Text style={styles.eventDetailText}>
              {item.duration} minutes
            </Text>
          </View>
          
          <View style={styles.eventDetail}>
            <Ionicons name="location-outline" size={16} color="#999" />
            <Text style={styles.eventDetailText}>
              {item.location}
            </Text>
          </View>
          
          <View style={styles.eventDetail}>
            <Ionicons name="people-outline" size={16} color="#999" />
            <Text style={styles.eventDetailText}>
              {item.currentAttendees}{item.maxAttendees ? `/${item.maxAttendees}` : ''}
            </Text>
          </View>
        </View>
        
        {!isPast && (
          <TouchableOpacity
            style={[
              styles.attendButton,
              isAtCapacity && styles.disabledButton
            ]}
            onPress={() => handleAttendEvent(item.id)}
            disabled={isAtCapacity}
          >
            <Text style={styles.attendButtonText}>
              {isAtCapacity ? 'At Capacity' : 'Attend'}
            </Text>
          </TouchableOpacity>
        )}
      </Animated.View>
    );
  };

  // If viewing a specific club
  if (selectedClub) {
    return (
      <IMessagePageWrapper
        title={selectedClub.name}
        subtitle={selectedClub.description || 'A fitness community'}
        showBackButton
        onBackPress={closeClubView}
      >
        <View style={styles.clubView}>
          {selectedClub.bannerImageUrl && (
            <Image
              source={{ uri: selectedClub.bannerImageUrl }}
              style={styles.clubBanner}
              resizeMode="cover"
            />
          )}
          
          <View style={styles.clubInfoContainer}>
            <View style={styles.clubImageContainer}>
              <Image
                source={{ uri: selectedClub.profileImageUrl }}
                style={styles.clubImage}
              />
            </View>
            
            <View style={styles.clubInfo}>
              <Text style={styles.clubName}>{selectedClub.name}</Text>
              <Text style={styles.clubDescription}>
                {selectedClub.description}
              </Text>
              <View style={styles.clubStats}>
                <View style={styles.clubStat}>
                  <Text style={styles.clubStatValue}>{selectedClub.memberCount}</Text>
                  <Text style={styles.clubStatLabel}>members</Text>
                </View>
                
                {selectedClub.isPaid && (
                  <View style={styles.clubStat}>
                    <Text style={styles.clubStatValue}>${selectedClub.price?.toFixed(2)}</Text>
                    <Text style={styles.clubStatLabel}>per month</Text>
                  </View>
                )}
              </View>
            </View>
          </View>
          
          <View style={styles.clubActions}>
            <TouchableOpacity 
              style={[
                styles.clubAction,
                !isShowingEvents && styles.activeClubAction
              ]}
              onPress={() => setIsShowingEvents(false)}
            >
              <Ionicons 
                name="newspaper-outline" 
                size={20} 
                color={!isShowingEvents ? "#fff" : "#999"}
              />
              <Text style={[
                styles.clubActionText,
                !isShowingEvents && styles.activeClubActionText
              ]}>Posts</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[
                styles.clubAction,
                isShowingEvents && styles.activeClubAction
              ]}
              onPress={() => setIsShowingEvents(true)}
            >
              <Ionicons 
                name="calendar-outline" 
                size={20} 
                color={isShowingEvents ? "#fff" : "#999"}
              />
              <Text style={[
                styles.clubActionText,
                isShowingEvents && styles.activeClubActionText
              ]}>Events</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.createButton}
              onPress={isShowingEvents ? openCreateEvent : openCreatePost}
            >
              <Ionicons name="add" size={20} color="#FFF" />
              <Text style={styles.createButtonText}>
                Create {isShowingEvents ? 'Event' : 'Post'}
              </Text>
            </TouchableOpacity>
          </View>
          
          {isShowingEvents ? (
            // Events list
            <FlatList
              data={events.filter(event => event.clubId === selectedClub.id)}
              renderItem={renderEventItem}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.eventsList}
              ListEmptyComponent={(
                <View style={styles.emptyState}>
                  <Ionicons name="calendar-outline" size={48} color="#555" />
                  <Text style={styles.emptyStateText}>No events scheduled</Text>
                  <TouchableOpacity 
                    style={styles.emptyStateButton}
                    onPress={openCreateEvent}
                  >
                    <Text style={styles.emptyStateButtonText}>Create First Event</Text>
                  </TouchableOpacity>
                </View>
              )}
            />
          ) : (
            // Posts list
            <FlatList
              data={posts.filter(post => post.clubId === selectedClub.id)}
              renderItem={renderPostItem}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.feedList}
              ListEmptyComponent={(
                <View style={styles.emptyState}>
                  <Ionicons name="chatbubble-outline" size={48} color="#555" />
                  <Text style={styles.emptyStateText}>No posts yet</Text>
                  <TouchableOpacity 
                    style={styles.emptyStateButton}
                    onPress={openCreatePost}
                  >
                    <Text style={styles.emptyStateButtonText}>Create First Post</Text>
                  </TouchableOpacity>
                </View>
              )}
            />
          )}
        </View>

        {/* Create Post Modal */}
        <Modal
          visible={showCreatePost}
          animationType="slide"
          transparent={true}
          onRequestClose={closeCreatePost}
        >
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.modalContainer}
          >
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Create Post</Text>
                <TouchableOpacity onPress={closeCreatePost}>
                  <Ionicons name="close" size={24} color="#fff" />
                </TouchableOpacity>
              </View>
              
              <TextInput
                style={styles.postInput}
                placeholder="What's on your mind?"
                placeholderTextColor="#666"
                multiline
                numberOfLines={6}
                value={postContent}
                onChangeText={setPostContent}
              />
              
              <TextInput
                style={styles.textInput}
                placeholder="Image URL (Optional)"
                placeholderTextColor="#666"
                value={postImageUrl}
                onChangeText={setPostImageUrl}
              />
              
              <TouchableOpacity
                style={styles.submitButton}
                onPress={createPost}
              >
                <Text style={styles.submitButtonText}>Post</Text>
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </Modal>

        {/* Create Event Modal */}
        <Modal
          visible={showCreateEvent}
          animationType="slide"
          transparent={true}
          onRequestClose={closeCreateEvent}
        >
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.modalContainer}
          >
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Create Event</Text>
                <TouchableOpacity onPress={closeCreateEvent}>
                  <Ionicons name="close" size={24} color="#fff" />
                </TouchableOpacity>
              </View>
              
              <ScrollView style={styles.eventFormScroll}>
                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Event Title</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="e.g., Group Training Session"
                    placeholderTextColor="#666"
                    value={eventTitle}
                    onChangeText={setEventTitle}
                  />
                </View>
                
                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Description (Optional)</Text>
                  <TextInput
                    style={[styles.textInput, styles.textArea]}
                    placeholder="Describe your event..."
                    placeholderTextColor="#666"
                    multiline
                    numberOfLines={4}
                    value={eventDescription}
                    onChangeText={setEventDescription}
                  />
                </View>
                
                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Location</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="e.g., Central Park, New York"
                    placeholderTextColor="#666"
                    value={eventLocation}
                    onChangeText={setEventLocation}
                  />
                </View>
                
                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Date & Time</Text>
                  <Pressable
                    style={styles.datePickerButton}
                    onPress={() => setShowDatePicker(true)}
                  >
                    <Text style={styles.datePickerButtonText}>
                      {eventDate.toLocaleString()}
                    </Text>
                    <Ionicons name="calendar-outline" size={20} color="#999" />
                  </Pressable>
                </View>
                
                {showDatePicker && (
                  <DateTimePicker
                    value={eventDate}
                    mode="datetime"
                    is24Hour={true}
                    display="default"
                    onChange={onChangeEventDate}
                  />
                )}
                
                <View style={styles.formRow}>
                  <View style={[styles.formGroup, { flex: 1, marginRight: 8 }]}>
                    <Text style={styles.formLabel}>Duration (min)</Text>
                    <TextInput
                      style={styles.textInput}
                      placeholder="60"
                      placeholderTextColor="#666"
                      keyboardType="numeric"
                      value={eventDuration}
                      onChangeText={setEventDuration}
                    />
                  </View>
                  
                  <View style={[styles.formGroup, { flex: 1 }]}>
                    <Text style={styles.formLabel}>Max Attendees</Text>
                    <TextInput
                      style={styles.textInput}
                      placeholder="20"
                      placeholderTextColor="#666"
                      keyboardType="numeric"
                      value={eventMaxAttendees}
                      onChangeText={setEventMaxAttendees}
                    />
                  </View>
                </View>
                
                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Event Type</Text>
                  <View style={styles.eventTypeSelector}>
                    <TouchableOpacity
                      style={[
                        styles.eventTypeOption,
                        !eventIsPaid && styles.eventTypeOptionSelected,
                      ]}
                      onPress={() => setEventIsPaid(false)}
                    >
                      <Text
                        style={[
                          styles.eventTypeOptionText,
                          !eventIsPaid && styles.eventTypeOptionTextSelected,
                        ]}
                      >
                        Free
                      </Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity
                      style={[
                        styles.eventTypeOption,
                        eventIsPaid && styles.eventTypeOptionSelected,
                      ]}
                      onPress={() => setEventIsPaid(true)}
                    >
                      <Text
                        style={[
                          styles.eventTypeOptionText,
                          eventIsPaid && styles.eventTypeOptionTextSelected,
                        ]}
                      >
                        Paid
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
                
                {eventIsPaid && (
                  <View style={styles.formGroup}>
                    <Text style={styles.formLabel}>Price ($)</Text>
                    <TextInput
                      style={styles.textInput}
                      placeholder="15.00"
                      placeholderTextColor="#666"
                      keyboardType="numeric"
                      value={eventPrice}
                      onChangeText={setEventPrice}
                    />
                  </View>
                )}
              </ScrollView>
              
              <TouchableOpacity
                style={styles.submitButton}
                onPress={createEvent}
              >
                <Text style={styles.submitButtonText}>Create Event</Text>
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </Modal>
      </IMessagePageWrapper>
    );
  }

  // Main social screen - clubs list
  return (
    <IMessagePageWrapper
      title="Social"
      subtitle="Connect with fitness communities"
      showHeader={false}
    >
      <View style={styles.mainTitleContainer}>
        <Text style={styles.mainTitle}>Social</Text>
        <Text style={styles.mainSubtitle}>Connect with fitness communities</Text>
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>My Clubs</Text>
      </View>

      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        ref={flatListRef}
        data={clubs}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity 
            style={styles.clubCardHorizontal}
            onPress={() => handleClubPress(item)}
          >
            <View style={styles.clubCardContentHorizontal}>
              <Image
                source={{ uri: item.profileImageUrl }}
                style={styles.clubCardImageHorizontal}
              />
              <View style={styles.clubCardInfoHorizontal}>
                <Text style={styles.clubCardTitle} numberOfLines={1}>{item.name}</Text>
                <Text style={styles.clubCardDescription} numberOfLines={2}>
                  {item.description}
                </Text>
                <View style={styles.clubCardStats}>
                  <Text style={styles.clubCardStatText}>
                    {item.memberCount} members
                  </Text>
                  {item.isPaid && (
                    <View style={styles.clubCardPrice}>
                      <Text style={styles.clubCardPriceText}>
                        ${item.price?.toFixed(2)}/mo
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            </View>
          </TouchableOpacity>
        )}
        contentContainerStyle={styles.clubsListHorizontal}
      />

      <View style={styles.socialFeedContainer}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Social Feed</Text>
        </View>

        <FlatList
          data={posts}
          renderItem={renderPostItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.feedList}
        />
      </View>
    </IMessagePageWrapper>
  );
}

// Helper functions
const formatPostDate = (date: Date) => {
  const now = new Date();
  const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
  
  if (diffInMinutes < 1) {
    return 'Just now';
  } else if (diffInMinutes < 60) {
    return `${diffInMinutes}m ago`;
  } else if (diffInMinutes < 24 * 60) {
    return `${Math.floor(diffInMinutes / 60)}h ago`;
  } else if (diffInMinutes < 7 * 24 * 60) {
    return `${Math.floor(diffInMinutes / (24 * 60))}d ago`;
  } else {
    return date.toLocaleDateString();
  }
};

const formatEventDate = (date: Date) => {
  const options: Intl.DateTimeFormatOptions = {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  };
  return date.toLocaleDateString(undefined, options);
};

const styles = StyleSheet.create(() => {
  // Import design system tokens
  const { colors, typography, spacing } = require('@/components/design-system/tokens');

  return {
    container: {
      flex: 1,
    },
    mainTitleContainer: {
      paddingHorizontal: spacing.spacing.lg,
      paddingTop: spacing.spacing.md,
      paddingBottom: spacing.spacing.sm,
    },
    mainTitle: {
      ...typography.textVariants.h1,
      color: colors.dark.text.primary,
    },
    mainSubtitle: {
      ...typography.textVariants.body,
      color: colors.dark.text.secondary,
      marginTop: spacing.spacing.xs,
    },
    sectionHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: spacing.spacing.md,
      paddingHorizontal: spacing.spacing.lg,
    },
    sectionTitle: {
      ...typography.textVariants.h3,
      color: colors.dark.text.primary,
    },

    // Club cards in main view
    clubsList: {
      paddingHorizontal: spacing.spacing.lg,
    },
    clubsListHorizontal: {
      paddingLeft: spacing.spacing.lg,
      paddingRight: spacing.spacing.xs,
    },
    clubCard: {
      backgroundColor: colors.dark.background.card,
      borderRadius: spacing.layout.borderRadius.md,
      marginBottom: spacing.spacing.md,
      overflow: 'hidden',
      borderWidth: spacing.layout.borderWidth.thin,
      borderColor: colors.dark.border.primary,
    },
    clubCardHorizontal: {
      backgroundColor: colors.dark.background.card,
      borderRadius: spacing.layout.borderRadius.md,
      marginRight: spacing.spacing.md,
      marginBottom: spacing.spacing.md,
      overflow: 'hidden',
      borderWidth: spacing.layout.borderWidth.thin,
      borderColor: colors.dark.border.primary,
      width: 180,
    },
    clubCardContent: {
      flexDirection: 'row',
      padding: spacing.spacing.md,
    },
    clubCardContentHorizontal: {
      padding: spacing.spacing.sm,
    },
    clubCardImage: {
      width: 80,
      height: 80,
      borderRadius: spacing.layout.borderRadius.sm,
      marginRight: spacing.spacing.md,
      backgroundColor: colors.dark.background.subtle,
    },
    clubCardImageHorizontal: {
      width: '100%',
      height: 90,
      borderRadius: spacing.layout.borderRadius.sm,
      marginBottom: spacing.spacing.xs,
      backgroundColor: colors.dark.background.subtle,
    },
    clubCardInfo: {
      flex: 1,
      justifyContent: 'space-between',
    },
    clubCardInfoHorizontal: {
      width: '100%',
    },
    clubCardTitle: {
      ...typography.textVariants.bodySemiBold,
      color: colors.dark.text.primary,
      marginBottom: spacing.spacing.xs,
    },
    clubCardDescription: {
      ...typography.textVariants.bodySmall,
      color: colors.dark.text.secondary,
      marginBottom: spacing.spacing.sm,
    },
    clubCardStats: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    clubCardStatText: {
      ...typography.textVariants.bodySmall,
      color: colors.dark.text.secondary,
    },
    clubCardPrice: {
      backgroundColor: colors.dark.brand.primary + '30',
      paddingHorizontal: spacing.spacing.sm,
      paddingVertical: spacing.spacing.xs / 2,
      borderRadius: spacing.layout.borderRadius.sm,
    },
    clubCardPriceText: {
      ...typography.textVariants.bodySmallSemiBold,
      color: colors.dark.brand.primary,
    },

    // Social feed
    socialFeedContainer: {
      flex: 1,
    },
    feedList: {
      paddingHorizontal: spacing.spacing.lg,
      paddingBottom: spacing.spacing.xxl,
    },
    postCard: {
      backgroundColor: colors.dark.background.card,
      borderRadius: spacing.layout.borderRadius.md,
      marginBottom: spacing.spacing.md,
      padding: spacing.spacing.md,
      borderWidth: spacing.layout.borderWidth.thin,
      borderColor: colors.dark.border.primary,
    },
    postHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: spacing.spacing.sm,
    },
    authorImage: {
      width: 40,
      height: 40,
      borderRadius: 20,
      marginRight: spacing.spacing.sm,
    },
    postHeaderInfo: {
      flex: 1,
    },
    authorName: {
      ...typography.textVariants.bodySemiBold,
      color: colors.dark.text.primary,
    },
    clubName: {
      ...typography.textVariants.bodySmall,
      color: colors.dark.brand.primary,
    },
    postDate: {
      ...typography.textVariants.bodySmall,
      color: colors.dark.text.secondary,
    },
    postContent: {
      ...typography.textVariants.body,
      color: colors.dark.text.primary,
      marginBottom: spacing.spacing.md,
    },
    postImagesContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
      marginBottom: spacing.spacing.md,
    },
    postImage: {
      width: '100%',
      height: 200,
      borderRadius: spacing.layout.borderRadius.md,
      marginBottom: spacing.spacing.xs,
    },
    postActions: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      borderTopWidth: spacing.layout.borderWidth.thin,
      borderTopColor: colors.dark.border.primary,
      paddingTop: spacing.spacing.sm,
    },
    postAction: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: spacing.spacing.xs,
      paddingHorizontal: spacing.spacing.sm,
    },
    postActionText: {
      ...typography.textVariants.bodySmall,
      color: colors.dark.text.secondary,
      marginLeft: spacing.spacing.xs,
    },

    // Club detailed view
    clubView: {
      flex: 1,
    },
    clubBanner: {
      width: '100%',
      height: 150,
      backgroundColor: colors.dark.background.subtle,
    },
    clubInfoContainer: {
      flexDirection: 'row',
      padding: spacing.spacing.lg,
      marginBottom: spacing.spacing.md,
    },
    clubImageContainer: {
      marginTop: -50,
    },
    clubImage: {
      width: 80,
      height: 80,
      borderRadius: 40,
      borderWidth: 3,
      borderColor: colors.dark.background.primary,
      backgroundColor: colors.dark.background.subtle,
    },
    clubInfo: {
      flex: 1,
      marginLeft: spacing.spacing.md,
    },
    clubName: {
      ...typography.textVariants.h3,
      color: colors.dark.text.primary,
    },
    clubDescription: {
      ...typography.textVariants.body,
      color: colors.dark.text.secondary,
      marginTop: spacing.spacing.xs,
      marginBottom: spacing.spacing.sm,
    },
    clubStats: {
      flexDirection: 'row',
    },
    clubStat: {
      marginRight: spacing.spacing.lg,
    },
    clubStatValue: {
      ...typography.textVariants.bodySemiBold,
      color: colors.dark.text.primary,
    },
    clubStatLabel: {
      ...typography.textVariants.bodySmall,
      color: colors.dark.text.secondary,
    },
    clubActions: {
      flexDirection: 'row',
      paddingHorizontal: spacing.spacing.lg,
      marginBottom: spacing.spacing.md,
      alignItems: 'center',
    },
    clubAction: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: spacing.spacing.sm,
      paddingHorizontal: spacing.spacing.md,
      marginRight: spacing.spacing.md,
      borderRadius: spacing.layout.borderRadius.md,
    },
    activeClubAction: {
      backgroundColor: colors.dark.brand.primary,
    },
    clubActionText: {
      ...typography.textVariants.bodySmall,
      color: colors.dark.text.secondary,
      marginLeft: spacing.spacing.xs,
    },
    activeClubActionText: {
      color: colors.dark.text.inverse,
    },
    createButton: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.dark.brand.primary,
      borderRadius: spacing.layout.borderRadius.md,
      paddingVertical: spacing.spacing.sm,
      paddingHorizontal: spacing.spacing.md,
      marginLeft: 'auto',
    },
    createButtonText: {
      ...typography.textVariants.bodySmall,
      color: colors.dark.text.inverse,
      marginLeft: spacing.spacing.xs,
    },

    // Event card styles
    eventsList: {
      paddingHorizontal: spacing.spacing.lg,
      paddingBottom: spacing.spacing.xxl,
    },
    eventCard: {
      backgroundColor: colors.dark.background.card,
      borderRadius: spacing.layout.borderRadius.md,
      marginBottom: spacing.spacing.md,
      padding: spacing.spacing.md,
      borderWidth: spacing.layout.borderWidth.thin,
      borderColor: colors.dark.border.primary,
    },
    pastEventCard: {
      opacity: 0.7,
    },
    eventCardHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: spacing.spacing.xs,
    },
    eventTitle: {
      ...typography.textVariants.bodySemiBold,
      color: colors.dark.text.primary,
      flex: 1,
    },
    priceBadge: {
      backgroundColor: colors.dark.brand.primary + '30',
      paddingHorizontal: spacing.spacing.sm,
      paddingVertical: spacing.spacing.xs / 2,
      borderRadius: spacing.layout.borderRadius.sm,
    },
    priceText: {
      ...typography.textVariants.bodySmallSemiBold,
      color: colors.dark.brand.primary,
    },
    eventDescription: {
      ...typography.textVariants.bodySmall,
      color: colors.dark.text.secondary,
      marginBottom: spacing.spacing.sm,
    },
    eventDetails: {
      marginBottom: spacing.spacing.md,
    },
    eventDetail: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: spacing.spacing.xs,
    },
    eventDetailText: {
      ...typography.textVariants.bodySmall,
      color: colors.dark.text.secondary,
      marginLeft: spacing.spacing.xs,
    },
    attendButton: {
      backgroundColor: colors.dark.brand.primary,
      borderRadius: spacing.layout.borderRadius.md,
      paddingVertical: spacing.spacing.sm,
      alignItems: 'center',
    },
    disabledButton: {
      backgroundColor: colors.dark.background.subtle,
    },
    attendButtonText: {
      ...typography.textVariants.bodySmallSemiBold,
      color: colors.dark.text.inverse,
    },

    // Modal styles
    modalContainer: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      justifyContent: 'flex-end',
    },
    modalContent: {
      backgroundColor: colors.dark.background.card,
      borderTopLeftRadius: spacing.layout.borderRadius.lg,
      borderTopRightRadius: spacing.layout.borderRadius.lg,
      padding: spacing.spacing.lg,
      maxHeight: '80%',
    },
    modalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: spacing.spacing.md,
    },
    modalTitle: {
      ...typography.textVariants.h3,
      color: colors.dark.text.primary,
    },
    postInput: {
      backgroundColor: colors.dark.background.input,
      borderRadius: spacing.layout.borderRadius.md,
      borderWidth: spacing.layout.borderWidth.thin,
      borderColor: colors.dark.border.primary,
      padding: spacing.spacing.md,
      color: colors.dark.text.primary,
      ...typography.textVariants.body,
      minHeight: 120,
      textAlignVertical: 'top',
      marginBottom: spacing.spacing.md,
    },
    textInput: {
      backgroundColor: colors.dark.background.input,
      borderRadius: spacing.layout.borderRadius.sm,
      borderWidth: spacing.layout.borderWidth.thin,
      borderColor: colors.dark.border.primary,
      paddingVertical: spacing.spacing.sm,
      paddingHorizontal: spacing.spacing.md,
      color: colors.dark.text.primary,
      ...typography.textVariants.body,
      marginBottom: spacing.spacing.md,
    },
    submitButton: {
      backgroundColor: colors.dark.brand.primary,
      borderRadius: spacing.layout.borderRadius.md,
      paddingVertical: spacing.spacing.md,
      alignItems: 'center',
    },
    submitButtonText: {
      ...typography.textVariants.button,
      color: colors.dark.text.inverse,
    },

    // Event form styles
    eventFormScroll: {
      maxHeight: 400,
    },
    formGroup: {
      marginBottom: spacing.spacing.md,
    },
    formRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    formLabel: {
      ...typography.textVariants.bodySemiBold,
      color: colors.dark.text.primary,
      marginBottom: spacing.spacing.xs,
    },
    textArea: {
      height: 100,
      textAlignVertical: 'top',
    },
    datePickerButton: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      backgroundColor: colors.dark.background.input,
      borderRadius: spacing.layout.borderRadius.sm,
      borderWidth: spacing.layout.borderWidth.thin,
      borderColor: colors.dark.border.primary,
      paddingVertical: spacing.spacing.sm,
      paddingHorizontal: spacing.spacing.md,
    },
    datePickerButtonText: {
      ...typography.textVariants.body,
      color: colors.dark.text.primary,
    },
    eventTypeSelector: {
      flexDirection: 'row',
      backgroundColor: colors.dark.background.input,
      borderRadius: spacing.layout.borderRadius.sm,
      borderWidth: spacing.layout.borderWidth.thin,
      borderColor: colors.dark.border.primary,
      overflow: 'hidden',
    },
    eventTypeOption: {
      flex: 1,
      paddingVertical: spacing.spacing.sm,
      alignItems: 'center',
    },
    eventTypeOptionSelected: {
      backgroundColor: colors.dark.brand.primary,
    },
    eventTypeOptionText: {
      ...typography.textVariants.bodySmall,
      color: colors.dark.text.primary,
    },
    eventTypeOptionTextSelected: {
      color: colors.dark.text.inverse,
    },

    // Empty state
    emptyState: {
      alignItems: 'center',
      justifyContent: 'center',
      padding: spacing.spacing.xl,
    },
    emptyStateText: {
      ...typography.textVariants.body,
      color: colors.dark.text.secondary,
      marginTop: spacing.spacing.md,
      marginBottom: spacing.spacing.lg,
    },
    emptyStateButton: {
      backgroundColor: colors.dark.brand.primary,
      borderRadius: spacing.layout.borderRadius.md,
      paddingVertical: spacing.spacing.sm,
      paddingHorizontal: spacing.spacing.lg,
    },
    emptyStateButtonText: {
      ...typography.textVariants.button,
      color: colors.dark.text.inverse,
    },
  };
})(); 