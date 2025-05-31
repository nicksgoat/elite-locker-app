/**
 * Elite Locker - Club Setup Screen
 *
 * Second step of onboarding - create or join a club
 */

import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { useOnboarding } from '../../hooks/useOnboarding';
import { onboardingService } from '../../services/onboardingService';
import { ClubSetupData } from '../../types/onboarding';

interface ClubSetupScreenProps {
  onNext: () => void;
  onSkip: () => void;
}

type ClubAction = 'create' | 'join' | 'skip';

export const ClubSetupScreen: React.FC<ClubSetupScreenProps> = ({ onNext, onSkip }) => {
  const { setupClub, isLoading } = useOnboarding();

  const [selectedAction, setSelectedAction] = useState<ClubAction>('create');
  const [clubName, setClubName] = useState('');
  const [clubDescription, setClubDescription] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [selectedClub, setSelectedClub] = useState<string | null>(null);
  const [searchLoading, setSearchLoading] = useState(false);

  // Search for clubs when in join mode
  useEffect(() => {
    if (selectedAction === 'join') {
      searchClubs();
    }
  }, [selectedAction, searchQuery]);

  const searchClubs = async () => {
    setSearchLoading(true);
    try {
      const results = await onboardingService.searchClubs(searchQuery);
      setSearchResults(results);
    } catch (error) {
      console.error('Error searching clubs:', error);
    } finally {
      setSearchLoading(false);
    }
  };

  const handleSubmit = async () => {
    const clubData: ClubSetupData = {
      action: selectedAction,
      clubName: selectedAction === 'create' ? clubName : undefined,
      clubDescription: selectedAction === 'create' ? clubDescription : undefined,
      clubToJoin: selectedAction === 'join' ? selectedClub : undefined
    };

    if (selectedAction === 'create') {
      if (!clubName.trim()) {
        Alert.alert('Error', 'Please enter a club name');
        return;
      }
    } else if (selectedAction === 'join') {
      if (!selectedClub) {
        Alert.alert('Error', 'Please select a club to join');
        return;
      }
    }

    try {
      await setupClub(clubData);
      // setupClub now automatically advances to the next step
    } catch (error) {
      Alert.alert('Error', 'Failed to setup club. Please try again.');
    }
  };

  const renderClubItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={[
        styles.clubItem,
        selectedClub === item.id && styles.clubItemSelected
      ]}
      onPress={() => setSelectedClub(item.id)}
    >
      <View style={styles.clubInfo}>
        <Text style={[
          styles.clubName,
          selectedClub === item.id && styles.clubNameSelected
        ]}>
          {item.name}
        </Text>
        {item.description && (
          <Text style={[
            styles.clubDescription,
            selectedClub === item.id && styles.clubDescriptionSelected
          ]}>
            {item.description}
          </Text>
        )}
      </View>
      {selectedClub === item.id && (
        <Ionicons name="checkmark-circle" size={24} color="#1DB954" />
      )}
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Join the community</Text>
          <Text style={styles.subtitle}>
            Connect with others by creating or joining a club
          </Text>
        </View>

        {/* Action selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>What would you like to do?</Text>

          <TouchableOpacity
            style={[
              styles.actionCard,
              selectedAction === 'create' && styles.actionCardSelected
            ]}
            onPress={() => setSelectedAction('create')}
          >
            <View style={styles.actionIcon}>
              <Ionicons
                name="add-circle"
                size={24}
                color={selectedAction === 'create' ? '#1DB954' : '#8E8E93'}
              />
            </View>
            <View style={styles.actionContent}>
              <Text style={[
                styles.actionTitle,
                selectedAction === 'create' && styles.actionTitleSelected
              ]}>
                Create a Club
              </Text>
              <Text style={[
                styles.actionDescription,
                selectedAction === 'create' && styles.actionDescriptionSelected
              ]}>
                Start your own fitness community
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.actionCard,
              selectedAction === 'join' && styles.actionCardSelected
            ]}
            onPress={() => setSelectedAction('join')}
          >
            <View style={styles.actionIcon}>
              <Ionicons
                name="people"
                size={24}
                color={selectedAction === 'join' ? '#1DB954' : '#8E8E93'}
              />
            </View>
            <View style={styles.actionContent}>
              <Text style={[
                styles.actionTitle,
                selectedAction === 'join' && styles.actionTitleSelected
              ]}>
                Join a Club
              </Text>
              <Text style={[
                styles.actionDescription,
                selectedAction === 'join' && styles.actionDescriptionSelected
              ]}>
                Find and join existing communities
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Create club form */}
        {selectedAction === 'create' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Club Details</Text>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Club Name *</Text>
              <TextInput
                style={styles.input}
                value={clubName}
                onChangeText={setClubName}
                placeholder="Enter club name"
                placeholderTextColor="#8E8E93"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Description</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={clubDescription}
                onChangeText={setClubDescription}
                placeholder="Describe your club..."
                placeholderTextColor="#8E8E93"
                multiline
                numberOfLines={3}
              />
            </View>
          </View>
        )}

        {/* Join club search */}
        {selectedAction === 'join' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Find Clubs</Text>

            <View style={styles.searchContainer}>
              <Ionicons name="search" size={20} color="#8E8E93" />
              <TextInput
                style={styles.searchInput}
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder="Search clubs..."
                placeholderTextColor="#8E8E93"
              />
            </View>

            {searchLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color="#1DB954" />
              </View>
            ) : (
              <FlatList
                data={searchResults}
                renderItem={renderClubItem}
                keyExtractor={(item) => item.id}
                style={styles.clubsList}
                scrollEnabled={false}
                ListEmptyComponent={
                  <Text style={styles.emptyText}>
                    {searchQuery ? 'No clubs found' : 'Popular clubs will appear here'}
                  </Text>
                }
              />
            )}
          </View>
        )}

        {/* Action buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.continueButton, isLoading && styles.continueButtonDisabled]}
            onPress={handleSubmit}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={styles.continueButtonText}>
                {selectedAction === 'create' ? 'Create Club' : 'Join Club'}
              </Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.skipButton}
            onPress={onSkip}
          >
            <Text style={styles.skipButtonText}>Skip for now</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#8E8E93',
    lineHeight: 24,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: '#333333',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  actionCardSelected: {
    borderColor: '#1DB954',
    backgroundColor: 'rgba(29, 185, 84, 0.1)',
  },
  actionIcon: {
    marginRight: 16,
  },
  actionContent: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  actionTitleSelected: {
    color: '#1DB954',
  },
  actionDescription: {
    fontSize: 14,
    color: '#8E8E93',
  },
  actionDescriptionSelected: {
    color: '#1DB954',
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: '#333333',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#FFFFFF',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: '#333333',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#FFFFFF',
    marginLeft: 12,
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
  },
  clubsList: {
    maxHeight: 300,
  },
  clubItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: '#333333',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
  },
  clubItemSelected: {
    borderColor: '#1DB954',
    backgroundColor: 'rgba(29, 185, 84, 0.1)',
  },
  clubInfo: {
    flex: 1,
  },
  clubName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  clubNameSelected: {
    color: '#1DB954',
  },
  clubDescription: {
    fontSize: 14,
    color: '#8E8E93',
  },
  clubDescriptionSelected: {
    color: '#1DB954',
  },
  emptyText: {
    textAlign: 'center',
    color: '#8E8E93',
    fontSize: 14,
    padding: 20,
  },
  buttonContainer: {
    marginTop: 20,
  },
  continueButton: {
    backgroundColor: '#1DB954',
    borderRadius: 25,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  continueButtonDisabled: {
    opacity: 0.6,
  },
  continueButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  skipButton: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  skipButtonText: {
    color: '#8E8E93',
    fontSize: 16,
  },
});
