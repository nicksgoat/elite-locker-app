import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import React from 'react';
import {
    Dimensions,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import Container from '../../components/design-system/layout/Container';
import IMessagePageWrapper from '../../components/layout/iMessagePageWrapper';

// Get screen dimensions
const { width: screenWidth } = Dimensions.get('window');

// Calculate responsive padding based on screen size
const getResponsivePadding = () => {
  // For larger devices (iPad, larger iPhones), use proportional padding
  if (screenWidth >= 428) { // iPhone 13/14 Pro Max width
    return Math.max(20, Math.min(32, screenWidth * 0.06)); // 6% of screen width
  } else if (screenWidth >= 414) { // iPhone 11 Pro Max, 12 Pro Max
    return Math.max(16, Math.min(28, screenWidth * 0.055)); // 5.5% of screen width
  }
  // For smaller devices, use fixed padding
  return 16;
};

export default function HomeScreen() {
  const router = useRouter();

  const handleNavigation = (route: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(route as any);
  };

  return (
    <IMessagePageWrapper
      title="Elite Locker"
      subtitle="Home"
      showHeader={false}
    >
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <Container>
          {/* Quick Actions */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Quick Actions</Text>
            <View style={styles.actionsContainer}>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => handleNavigation('/(tabs)/training')}
                activeOpacity={0.8}
              >
                <Ionicons name="fitness" size={24} color="#FFFFFF" />
                <Text style={styles.actionButtonText}>Training</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: '#FF9500' }]}
                onPress={() => handleNavigation('/(tabs)/social')}
                activeOpacity={0.8}
              >
                <Ionicons name="people" size={24} color="#FFFFFF" />
                <Text style={styles.actionButtonText}>Social</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Recent Activity */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Recent Activity</Text>
              <TouchableOpacity onPress={() => handleNavigation('/feed')}>
                <Text style={styles.viewAllText}>View All</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.darkCard}>
              <View style={styles.cardHeader}>
                <View style={[styles.workoutIcon, { backgroundColor: '#FF3B30' }]} />
                <View style={styles.cardHeaderTextContainer}>
                  <Text style={styles.cardTitle}>Upper Body</Text>
                  <Text style={styles.cardSubtitle}>Today • 2 hours ago</Text>
                </View>
                <TouchableOpacity style={styles.cardHeaderButton} onPress={() => handleNavigation('/workout/detail/1')}>
                  <Ionicons name="chevron-forward" size={20} color="#8E8E93" />
                </TouchableOpacity>
              </View>

              <View style={styles.cardStatsRow}>
                <View style={styles.cardStatItem}>
                  <Ionicons name="time-outline" size={16} color="#A2A2A2" />
                  <Text style={styles.cardStatValue}>45 min</Text>
                </View>

                <View style={styles.cardStatItem}>
                  <Ionicons name="barbell-outline" size={16} color="#A2A2A2" />
                  <Text style={styles.cardStatValue}>7/7</Text>
                </View>

                <View style={styles.cardStatItem}>
                  <Ionicons name="trending-up-outline" size={16} color="#A2A2A2" />
                  <Text style={styles.cardStatValue}>12.5k</Text>
                </View>
              </View>
            </View>
          </View>

          {/* My Clubs */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>My Clubs</Text>
              <TouchableOpacity onPress={() => handleNavigation('/clubs')}>
                <Text style={styles.viewAllText}>View All</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Container>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.clubsScrollContainer}
          contentContainerStyle={{ paddingLeft: 16, paddingRight: 16 }}
        >
          <TouchableOpacity style={styles.clubCard} onPress={() => handleNavigation('/club/1')}>
            <View style={styles.clubImageContainer}>
              <Image
                source={{ uri: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80' }}
                style={styles.clubImage}
              />
              <View style={styles.clubImageOverlay} />
            </View>
            <Text style={styles.clubName}>Elite Speed Academy</Text>
            <Text style={styles.clubMemberCount}>120 members</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.clubCard} onPress={() => handleNavigation('/club/2')}>
            <View style={styles.clubImageContainer}>
              <Image
                source={{ uri: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80' }}
                style={styles.clubImage}
              />
              <View style={styles.clubImageOverlay} />
            </View>
            <Text style={styles.clubName}>Power Lifters United</Text>
            <Text style={styles.clubMemberCount}>85 members</Text>
          </TouchableOpacity>
        </ScrollView>

        <Container>
          {/* Programs */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>My Programs</Text>
              <TouchableOpacity onPress={() => handleNavigation('/(tabs)/training')}>
                <Text style={styles.viewAllText}>View All</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.programCard} onPress={() => handleNavigation('/programs/detail/1')}>
              <View style={styles.programCardContent}>
                <View style={[styles.programIcon, { backgroundColor: '#007AFF' }]} />
                <View style={styles.programTextContainer}>
                  <Text style={styles.programTitle}>12-Week Strength Builder</Text>
                  <View style={styles.programProgressContainer}>
                    <View style={styles.programProgressBar}>
                      <View style={[styles.programProgressFill, { width: '35%' }]} />
                    </View>
                    <Text style={styles.programProgressText}>Week 4 of 12</Text>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          </View>
        </Container>
      </ScrollView>
    </IMessagePageWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  viewAllText: {
    fontSize: 14,
    color: '#0A84FF',
    fontWeight: '500',
  },
  actionsContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0A84FF',
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  darkCard: {
    width: '100%',
    borderRadius: 12,
    backgroundColor: '#1C1C1E',
    overflow: 'hidden',
    borderWidth: 0.5,
    borderColor: '#333333',
    marginBottom: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: '#333333',
  },
  workoutIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    marginRight: 12,
  },
  cardHeaderTextContainer: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  cardSubtitle: {
    fontSize: 13,
    color: '#8E8E93',
    marginTop: 2,
  },
  cardHeaderButton: {
    padding: 4,
  },
  cardStatsRow: {
    flexDirection: 'row',
    padding: 12,
    alignItems: 'center',
  },
  cardStatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  cardStatValue: {
    fontSize: 14,
    color: '#FFFFFF',
    marginLeft: 4,
    fontWeight: '500',
  },
  clubsScrollContainer: {
    marginTop: -4,
    marginBottom: 8,
    marginLeft: -16,
    marginRight: -16,
    width: screenWidth,
  },
  clubCard: {
    width: 160,
    borderRadius: 12,
    marginRight: 12,
    overflow: 'hidden',
  },
  clubImageContainer: {
    height: 100,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 8,
  },
  clubImage: {
    width: '100%',
    height: '100%',
  },
  clubImageOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  clubName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  clubMemberCount: {
    fontSize: 12,
    color: '#8E8E93',
    marginTop: 2,
  },
  programCard: {
    width: '100%',
    borderRadius: 12,
    backgroundColor: '#1C1C1E',
    overflow: 'hidden',
    borderWidth: 0.5,
    borderColor: '#333333',
  },
  programCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  programIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    marginRight: 12,
  },
  programTextContainer: {
    flex: 1,
  },
  programTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  programProgressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  programProgressBar: {
    flex: 1,
    height: 4,
    backgroundColor: '#333333',
    borderRadius: 2,
    marginRight: 8,
    overflow: 'hidden',
  },
  programProgressFill: {
    height: '100%',
    backgroundColor: '#0A84FF',
    borderRadius: 2,
  },
  programProgressText: {
    fontSize: 12,
    color: '#8E8E93',
  },
});
