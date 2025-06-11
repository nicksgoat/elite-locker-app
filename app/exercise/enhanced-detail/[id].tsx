import { Text } from '@/components/design-system/primitives';
import { useTheme } from '@/components/design-system/ThemeProvider';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useRef, useState, useEffect } from 'react';
import {
    Animated,
    Dimensions,
    Image,
    Platform,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    View,
    TextInput,
    Alert,
    Modal,
    FlatList
} from 'react-native';
import { trainingMaxService, TrainingMaxHistory, ExerciseLeaderboard, TrainingMaxRecord } from '../../../services/trainingMaxService';

const { width, height } = Dimensions.get('window');

// Mock exercise data (in real app, would come from API)
const mockExercise = {
  id: 'e1',
  name: 'Barbell Bench Press',
  muscleGroups: ['Chest', 'Triceps', 'Shoulders'],
  equipment: 'Barbell',
  difficulty: 'Intermediate',
  description: 'The barbell bench press is a classic exercise that targets the chest, shoulders, and triceps.',
  image: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b',
  category: 'Upper Body'
};

type TabType = 'overview' | 'training-max' | 'leaderboard' | 'history';

export default function EnhancedExerciseDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors } = useTheme();
  const scrollY = useRef(new Animated.Value(0)).current;
  
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [trainingMaxHistory, setTrainingMaxHistory] = useState<TrainingMaxHistory | null>(null);
  const [leaderboard, setLeaderboard] = useState<ExerciseLeaderboard | null>(null);
  const [showTrainingMaxModal, setShowTrainingMaxModal] = useState(false);
  const [newTrainingMax, setNewTrainingMax] = useState('');
  const [selectedUnit, setSelectedUnit] = useState<'kg' | 'lb'>('lb');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (id) {
      loadTrainingMaxData();
      loadLeaderboard();
    }
  }, [id]);

  const loadTrainingMaxData = async () => {
    try {
      setLoading(true);
      const history = await trainingMaxService.getTrainingMaxHistory(id as string);
      setTrainingMaxHistory(history);
    } catch (error) {
      console.error('Error loading training max data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadLeaderboard = async () => {
    try {
      const leaderboardData = await trainingMaxService.getExerciseLeaderboard(id as string, 'all', 20);
      setLeaderboard(leaderboardData);
    } catch (error) {
      console.error('Error loading leaderboard:', error);
    }
  };

  const handleUpdateTrainingMax = async () => {
    if (!newTrainingMax || isNaN(parseFloat(newTrainingMax))) {
      Alert.alert('Invalid Input', 'Please enter a valid weight.');
      return;
    }

    try {
      await trainingMaxService.updateTrainingMax(
        id as string,
        parseFloat(newTrainingMax),
        selectedUnit,
        'manual'
      );
      
      setShowTrainingMaxModal(false);
      setNewTrainingMax('');
      await loadTrainingMaxData();
      
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert('Success', 'Training max updated successfully!');
    } catch (error) {
      console.error('Error updating training max:', error);
      Alert.alert('Error', 'Failed to update training max. Please try again.');
    }
  };

  const handleTabPress = (tab: TabType) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setActiveTab(tab);
  };

  const handleBackPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };

  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getSourceIcon = (source: string): string => {
    switch (source) {
      case 'tracker': return 'fitness-outline';
      case 'manual': return 'create-outline';
      case 'calculated': return 'calculator-outline';
      default: return 'help-circle-outline';
    }
  };

  const getSourceColor = (source: string): string => {
    switch (source) {
      case 'tracker': return '#30D158';
      case 'manual': return '#0A84FF';
      case 'calculated': return '#FF9F0A';
      default: return '#8E8E93';
    }
  };

  const renderTrainingMaxRecord = ({ item }: { item: TrainingMaxRecord }) => (
    <View style={styles.recordItem}>
      <View style={styles.recordHeader}>
        <View style={[styles.sourceIndicator, { backgroundColor: getSourceColor(item.source) + '20' }]}>
          <Ionicons 
            name={getSourceIcon(item.source) as any} 
            size={16} 
            color={getSourceColor(item.source)} 
          />
        </View>
        <View style={styles.recordInfo}>
          <Text style={styles.recordValue}>{item.value} {item.unit}</Text>
          <Text style={styles.recordDate}>{formatDate(item.createdAt)}</Text>
        </View>
        {item.verificationStatus === 'verified' && (
          <Ionicons name="checkmark-circle" size={20} color="#30D158" />
        )}
      </View>
      {item.metadata?.notes && (
        <Text style={styles.recordNotes}>{item.metadata.notes}</Text>
      )}
    </View>
  );

  const renderLeaderboardEntry = ({ item }: { item: any }) => (
    <View style={styles.leaderboardItem}>
      <View style={styles.rankContainer}>
        <Text style={[
          styles.rank,
          item.rank === 1 ? styles.goldRank :
          item.rank === 2 ? styles.silverRank :
          item.rank === 3 ? styles.bronzeRank : {}
        ]}>
          {item.rank}
        </Text>
        {item.rank <= 3 && (
          <Ionicons 
            name="trophy" 
            size={16} 
            color={
              item.rank === 1 ? '#FFD700' :
              item.rank === 2 ? '#C0C0C0' : '#CD7F32'
            } 
          />
        )}
      </View>
      
      <Image source={{ uri: item.avatarUrl || 'https://via.placeholder.com/40x40' }} style={styles.avatar} />
      
      <View style={styles.userInfo}>
        <Text style={styles.username}>{item.username}</Text>
        <View style={styles.userMeta}>
          <Text style={styles.userValue}>{item.value} {item.unit}</Text>
          {item.verificationStatus === 'verified' && (
            <Ionicons name="checkmark-circle" size={12} color="#30D158" />
          )}
        </View>
      </View>
    </View>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <View style={styles.tabContent}>
            <Text style={styles.description}>{mockExercise.description}</Text>
            
            {trainingMaxHistory?.currentMax && (
              <View style={styles.currentMaxCard}>
                <Text style={styles.cardTitle}>Current Training Max</Text>
                <Text style={styles.currentMaxValue}>
                  {trainingMaxHistory.currentMax.value} {trainingMaxHistory.currentMax.unit}
                </Text>
                <Text style={styles.currentMaxDate}>
                  Set {formatDate(trainingMaxHistory.currentMax.createdAt)}
                </Text>
              </View>
            )}
          </View>
        );
        
      case 'training-max':
        return (
          <View style={styles.tabContent}>
            <View style={styles.trainingMaxHeader}>
              <Text style={styles.cardTitle}>Training Max Manager</Text>
              <TouchableOpacity
                style={styles.addButton}
                onPress={() => setShowTrainingMaxModal(true)}
              >
                <Ionicons name="add" size={20} color="#0A84FF" />
                <Text style={styles.addButtonText}>Add Max</Text>
              </TouchableOpacity>
            </View>
            
            {trainingMaxHistory?.records && trainingMaxHistory.records.length > 0 ? (
              <FlatList
                data={trainingMaxHistory.records}
                renderItem={renderTrainingMaxRecord}
                keyExtractor={(item) => item.id}
                showsVerticalScrollIndicator={false}
              />
            ) : (
              <View style={styles.emptyState}>
                <Ionicons name="barbell-outline" size={48} color="#8E8E93" />
                <Text style={styles.emptyStateText}>No training max records yet</Text>
                <Text style={styles.emptyStateSubtext}>Add your first training max to get started</Text>
              </View>
            )}
          </View>
        );
        
      case 'leaderboard':
        return (
          <View style={styles.tabContent}>
            <Text style={styles.cardTitle}>Global Leaderboard</Text>
            {leaderboard?.entries && leaderboard.entries.length > 0 ? (
              <FlatList
                data={leaderboard.entries}
                renderItem={renderLeaderboardEntry}
                keyExtractor={(item) => item.userId}
                showsVerticalScrollIndicator={false}
              />
            ) : (
              <View style={styles.emptyState}>
                <Ionicons name="trophy-outline" size={48} color="#8E8E93" />
                <Text style={styles.emptyStateText}>No leaderboard data yet</Text>
                <Text style={styles.emptyStateSubtext}>Be the first to set a training max!</Text>
              </View>
            )}
          </View>
        );
        
      case 'history':
        return (
          <View style={styles.tabContent}>
            <Text style={styles.cardTitle}>Progress History</Text>
            {trainingMaxHistory?.progress && (
              <View style={styles.progressCards}>
                <View style={styles.progressCard}>
                  <Text style={styles.progressLabel}>Last Month</Text>
                  <Text style={styles.progressValue}>
                    {trainingMaxHistory.progress.lastMonth || 0} {selectedUnit}
                  </Text>
                </View>
                <View style={styles.progressCard}>
                  <Text style={styles.progressLabel}>Last 3 Months</Text>
                  <Text style={styles.progressValue}>
                    {trainingMaxHistory.progress.lastThreeMonths || 0} {selectedUnit}
                  </Text>
                </View>
                <View style={styles.progressCard}>
                  <Text style={styles.progressLabel}>Last Year</Text>
                  <Text style={styles.progressValue}>
                    {trainingMaxHistory.progress.lastYear || 0} {selectedUnit}
                  </Text>
                </View>
              </View>
            )}
          </View>
        );
        
      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
          <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{mockExercise.name}</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Exercise Image */}
      <View style={styles.imageContainer}>
        <Image source={{ uri: mockExercise.image }} style={styles.exerciseImage} />
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.8)']}
          style={styles.imageGradient}
        />
      </View>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabs}>
          {[
            { id: 'overview', title: 'Overview' },
            { id: 'training-max', title: 'Training Max' },
            { id: 'leaderboard', title: 'Leaderboard' },
            { id: 'history', title: 'History' }
          ].map((tab) => (
            <TouchableOpacity
              key={tab.id}
              style={[styles.tab, activeTab === tab.id && styles.activeTab]}
              onPress={() => handleTabPress(tab.id as TabType)}
            >
              <Text style={[styles.tabText, activeTab === tab.id && styles.activeTabText]}>
                {tab.title}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Tab Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {renderTabContent()}
      </ScrollView>

      {/* Training Max Modal */}
      <Modal
        visible={showTrainingMaxModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowTrainingMaxModal(false)}
      >
        <View style={styles.modalOverlay}>
          <BlurView intensity={20} tint="dark" style={styles.modalBlur}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Add Training Max</Text>

              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  value={newTrainingMax}
                  onChangeText={setNewTrainingMax}
                  placeholder="Enter weight"
                  placeholderTextColor="#8E8E93"
                  keyboardType="numeric"
                />

                <View style={styles.unitSelector}>
                  {['lb', 'kg'].map((unit) => (
                    <TouchableOpacity
                      key={unit}
                      style={[styles.unitButton, selectedUnit === unit && styles.activeUnitButton]}
                      onPress={() => setSelectedUnit(unit as 'kg' | 'lb')}
                    >
                      <Text style={[styles.unitText, selectedUnit === unit && styles.activeUnitText]}>
                        {unit}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => setShowTrainingMaxModal(false)}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.saveButton}
                  onPress={handleUpdateTrainingMax}
                >
                  <Text style={styles.saveButtonText}>Save</Text>
                </TouchableOpacity>
              </View>
            </View>
          </BlurView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: Platform.OS === 'ios' ? 50 : 30,
    paddingHorizontal: 16,
    paddingBottom: 16,
    zIndex: 10,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  headerSpacer: {
    width: 40,
  },
  imageContainer: {
    height: height * 0.25,
    width: '100%',
    position: 'relative',
  },
  exerciseImage: {
    width: '100%',
    height: '100%',
  },
  imageGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '50%',
  },

  // Tabs
  tabsContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  tabs: {
    paddingHorizontal: 16,
    gap: 8,
  },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
  },
  activeTab: {
    backgroundColor: '#0A84FF',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#8E8E93',
  },
  activeTabText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },

  // Content
  content: {
    flex: 1,
  },
  tabContent: {
    padding: 16,
  },
  description: {
    fontSize: 16,
    lineHeight: 22,
    color: '#FFFFFF',
    marginBottom: 24,
  },

  // Current Max Card
  currentMaxCard: {
    backgroundColor: 'rgba(10, 132, 255, 0.1)',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(10, 132, 255, 0.3)',
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  currentMaxValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#0A84FF',
    marginBottom: 8,
  },
  currentMaxDate: {
    fontSize: 14,
    color: '#8E8E93',
  },

  // Training Max
  trainingMaxHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(10, 132, 255, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    gap: 4,
  },
  addButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0A84FF',
  },

  // Records
  recordItem: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  recordHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sourceIndicator: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  recordInfo: {
    flex: 1,
  },
  recordValue: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  recordDate: {
    fontSize: 14,
    color: '#8E8E93',
  },
  recordNotes: {
    fontSize: 14,
    color: '#8E8E93',
    marginTop: 8,
    fontStyle: 'italic',
  },

  // Leaderboard
  leaderboardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  rankContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 50,
    marginRight: 12,
  },
  rank: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginRight: 4,
  },
  goldRank: {
    color: '#FFD700',
  },
  silverRank: {
    color: '#C0C0C0',
  },
  bronzeRank: {
    color: '#CD7F32',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  userInfo: {
    flex: 1,
  },
  username: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  userMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  userValue: {
    fontSize: 14,
    color: '#8E8E93',
  },

  // Progress Cards
  progressCards: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  progressCard: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  progressLabel: {
    fontSize: 12,
    color: '#8E8E93',
    marginBottom: 8,
  },
  progressValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },

  // Empty State
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#8E8E93',
    textAlign: 'center',
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBlur: {
    width: width * 0.9,
    borderRadius: 20,
    overflow: 'hidden',
  },
  modalContent: {
    backgroundColor: 'rgba(20, 20, 20, 0.95)',
    padding: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 24,
  },
  inputContainer: {
    marginBottom: 24,
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#FFFFFF',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  unitSelector: {
    flexDirection: 'row',
    gap: 8,
  },
  unitButton: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  activeUnitButton: {
    backgroundColor: '#0A84FF',
    borderColor: '#0A84FF',
  },
  unitText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8E8E93',
  },
  activeUnitText: {
    color: '#FFFFFF',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#0A84FF',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
