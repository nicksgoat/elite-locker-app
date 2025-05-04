import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image } from 'react-native';
import MainLayout from '@/components/layout/MainLayout';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';

interface ExploreCategory {
  id: string;
  title: string;
  icon: string;
  color: string;
}

const exploreCategories = [
  {
    id: 'category1',
    title: 'Top Rated Clubs',
    icon: 'star',
    color: '#0A84FF',
  },
  {
    id: 'category2',
    title: 'New Workouts',
    icon: 'fitness',
    color: '#30D158',
  },
  {
    id: 'category3',
    title: 'Popular Trainers',
    icon: 'person',
    color: '#FF9500',
  },
  {
    id: 'category4',
    title: 'Events Near You',
    icon: 'calendar',
    color: '#FF3B30',
  },
  {
    id: 'category5',
    title: 'Challenges',
    icon: 'trophy',
    color: '#5856D6',
  },
  {
    id: 'category6',
    title: 'Running Routes',
    icon: 'map',
    color: '#AF52DE',
  },
];

export default function ExploreScreen() {
  const router = useRouter();

  const handleCategoryPress = (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    console.log(`Category pressed: ${id}`);
  };

  const renderCategoryItem = ({ item }: { item: ExploreCategory }) => (
    <TouchableOpacity
      style={styles.categoryItem}
      onPress={() => handleCategoryPress(item.id)}
      activeOpacity={0.8}
    >
      <View style={[styles.iconContainer, { backgroundColor: `${item.color}30` }]}>
        <Ionicons name={item.icon as any} size={28} color={item.color} />
      </View>
      <Text style={styles.categoryTitle}>{item.title}</Text>
    </TouchableOpacity>
  );

  return (
    <MainLayout 
      title="Explore" 
      hasTabBar={true}
      rightAction={{
        icon: 'search',
        onPress: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light),
      }}
    >
      <View style={styles.headerSection}>
        <Text style={styles.headerTitle}>Discover</Text>
        <Text style={styles.headerSubtitle}>Find new experiences and connect with the community</Text>
      </View>
      
      <FlatList
        data={exploreCategories}
        renderItem={renderCategoryItem}
        keyExtractor={item => item.id}
        numColumns={2}
        columnWrapperStyle={styles.row}
        showsVerticalScrollIndicator={false}
      />
    </MainLayout>
  );
}

const styles = StyleSheet.create({
  headerSection: {
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#8E8E93',
    lineHeight: 22,
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  categoryItem: {
    width: '48%',
    backgroundColor: 'rgba(30, 30, 30, 0.8)',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
  },
});
