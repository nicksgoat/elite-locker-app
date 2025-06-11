import { fetchData, insertData, updateData, deleteData } from '../lib/api';
import { getCurrentUser } from '../lib/auth';
import { ApiError } from './index';

// Enhanced training max types
export interface TrainingMaxRecord {
  id: string;
  userId: string;
  exerciseId: string;
  exerciseName: string;
  value: number;
  unit: 'kg' | 'lb';
  source: 'manual' | 'tracker' | 'calculated';
  workoutId?: string; // If from workout tracker
  setId?: string; // Specific set that achieved this max
  verificationStatus: 'unverified' | 'verified' | 'disputed';
  createdAt: Date;
  updatedAt: Date;
  metadata?: {
    reps?: number;
    bodyweight?: number;
    notes?: string;
    videoUrl?: string;
  };
}

export interface TrainingMaxHistory {
  exerciseId: string;
  exerciseName: string;
  records: TrainingMaxRecord[];
  currentMax: TrainingMaxRecord | null;
  personalBest: TrainingMaxRecord | null;
  progress: {
    lastMonth: number;
    lastThreeMonths: number;
    lastYear: number;
  };
}

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  username: string;
  fullName: string;
  avatarUrl: string;
  value: number;
  unit: 'kg' | 'lb';
  source: 'manual' | 'tracker' | 'calculated';
  verificationStatus: 'unverified' | 'verified' | 'disputed';
  achievedAt: Date;
  bodyweight?: number;
  wilksScore?: number;
}

export interface ExerciseLeaderboard {
  exerciseId: string;
  exerciseName: string;
  category: string;
  timeframe: 'week' | 'month' | 'quarter' | 'all';
  entries: LeaderboardEntry[];
  totalParticipants: number;
  userRank?: number;
  userEntry?: LeaderboardEntry;
}

class TrainingMaxService {
  // Get user's training max history for an exercise
  async getTrainingMaxHistory(exerciseId: string, userId?: string): Promise<TrainingMaxHistory> {
    try {
      const user = userId ? { id: userId } : await getCurrentUser();
      if (!user) {
        throw new ApiError('User not authenticated', 401);
      }

      const records = await fetchData('training_maxes', {
        select: `
          *,
          exercise:exercises(id, name, category),
          workout:workouts(id, title, date),
          set:exercise_sets(id, weight, reps)
        `,
        filters: {
          user_id: user.id,
          exercise_id: exerciseId
        },
        order: { column: 'created_at', ascending: false }
      });

      if (!records || records.length === 0) {
        return this.getEmptyHistory(exerciseId);
      }

      // Find current max (most recent verified or highest value)
      const currentMax = this.findCurrentMax(records);
      
      // Find personal best (highest verified value)
      const personalBest = this.findPersonalBest(records);
      
      // Calculate progress
      const progress = this.calculateProgress(records);

      return {
        exerciseId,
        exerciseName: records[0].exercise?.name || 'Unknown Exercise',
        records: records.map(this.mapToTrainingMaxRecord),
        currentMax: currentMax ? this.mapToTrainingMaxRecord(currentMax) : null,
        personalBest: personalBest ? this.mapToTrainingMaxRecord(personalBest) : null,
        progress
      };
    } catch (error) {
      console.error('Error fetching training max history:', error);
      return this.getEmptyHistory(exerciseId);
    }
  }

  // Update training max (manual entry)
  async updateTrainingMax(
    exerciseId: string,
    value: number,
    unit: 'kg' | 'lb',
    source: 'manual' | 'tracker' | 'calculated' = 'manual',
    metadata?: any
  ): Promise<TrainingMaxRecord> {
    try {
      const user = await getCurrentUser();
      if (!user) {
        throw new ApiError('User not authenticated', 401);
      }

      const trainingMaxData = {
        user_id: user.id,
        exercise_id: exerciseId,
        value,
        unit,
        source,
        verification_status: source === 'tracker' ? 'verified' : 'unverified',
        workout_id: metadata?.workoutId,
        set_id: metadata?.setId,
        metadata: {
          reps: metadata?.reps,
          bodyweight: metadata?.bodyweight,
          notes: metadata?.notes,
          videoUrl: metadata?.videoUrl
        },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const result = await insertData('training_maxes', trainingMaxData);
      if (!result) {
        throw new ApiError('Failed to update training max', 500);
      }

      return this.mapToTrainingMaxRecord(result);
    } catch (error) {
      console.error('Error updating training max:', error);
      throw error;
    }
  }

  // Get exercise leaderboard
  async getExerciseLeaderboard(
    exerciseId: string,
    timeframe: 'week' | 'month' | 'quarter' | 'all' = 'all',
    limit: number = 50
  ): Promise<ExerciseLeaderboard> {
    try {
      // Calculate date filter based on timeframe
      let dateFilter = null;
      const now = new Date();
      
      switch (timeframe) {
        case 'week':
          dateFilter = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case 'month':
          dateFilter = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        case 'quarter':
          dateFilter = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
          break;
      }

      // Get leaderboard data
      let query = {
        select: `
          *,
          user:profiles(id, username, full_name, avatar_url),
          exercise:exercises(id, name, category)
        `,
        filters: { exercise_id: exerciseId },
        order: { column: 'value', ascending: false },
        limit
      };

      if (dateFilter) {
        query.filters = {
          ...query.filters,
          created_at: `gte.${dateFilter.toISOString()}`
        };
      }

      const leaderboardData = await fetchData('training_maxes', query);

      if (!leaderboardData || leaderboardData.length === 0) {
        return this.getEmptyLeaderboard(exerciseId, timeframe);
      }

      // Group by user and get their best record
      const userBestRecords = this.groupByUserAndGetBest(leaderboardData);
      
      // Sort and rank
      const rankedEntries = userBestRecords
        .sort((a, b) => this.compareTrainingMaxes(a, b))
        .map((entry, index) => ({
          rank: index + 1,
          userId: entry.user.id,
          username: entry.user.username,
          fullName: entry.user.full_name,
          avatarUrl: entry.user.avatar_url,
          value: entry.value,
          unit: entry.unit,
          source: entry.source,
          verificationStatus: entry.verification_status,
          achievedAt: new Date(entry.created_at),
          bodyweight: entry.metadata?.bodyweight,
          wilksScore: this.calculateWilksScore(entry.value, entry.metadata?.bodyweight, entry.unit)
        }));

      // Find user's rank
      const currentUser = await getCurrentUser();
      const userEntry = currentUser ? rankedEntries.find(e => e.userId === currentUser.id) : undefined;

      return {
        exerciseId,
        exerciseName: leaderboardData[0].exercise?.name || 'Unknown Exercise',
        category: leaderboardData[0].exercise?.category || 'Other',
        timeframe,
        entries: rankedEntries,
        totalParticipants: rankedEntries.length,
        userRank: userEntry?.rank,
        userEntry
      };
    } catch (error) {
      console.error('Error fetching exercise leaderboard:', error);
      return this.getEmptyLeaderboard(exerciseId, timeframe);
    }
  }

  // Get top exercises by participation
  async getTopExercises(limit: number = 10): Promise<Array<{
    exerciseId: string;
    exerciseName: string;
    category: string;
    participantCount: number;
    averageMax: number;
    topMax: number;
  }>> {
    try {
      const exerciseStats = await fetchData('training_maxes', {
        select: `
          exercise_id,
          exercise:exercises(id, name, category),
          value,
          user_id
        `
      });

      if (!exerciseStats) return [];

      // Group by exercise and calculate stats
      const exerciseGroups = exerciseStats.reduce((acc, record) => {
        const exerciseId = record.exercise_id;
        if (!acc[exerciseId]) {
          acc[exerciseId] = {
            exerciseId,
            exerciseName: record.exercise?.name || 'Unknown',
            category: record.exercise?.category || 'Other',
            values: [],
            users: new Set()
          };
        }
        acc[exerciseId].values.push(record.value);
        acc[exerciseId].users.add(record.user_id);
        return acc;
      }, {} as any);

      return Object.values(exerciseGroups)
        .map((group: any) => ({
          exerciseId: group.exerciseId,
          exerciseName: group.exerciseName,
          category: group.category,
          participantCount: group.users.size,
          averageMax: group.values.reduce((sum: number, val: number) => sum + val, 0) / group.values.length,
          topMax: Math.max(...group.values)
        }))
        .sort((a, b) => b.participantCount - a.participantCount)
        .slice(0, limit);
    } catch (error) {
      console.error('Error fetching top exercises:', error);
      return [];
    }
  }

  // Private helper methods
  private mapToTrainingMaxRecord(data: any): TrainingMaxRecord {
    return {
      id: data.id,
      userId: data.user_id,
      exerciseId: data.exercise_id,
      exerciseName: data.exercise?.name || 'Unknown Exercise',
      value: data.value,
      unit: data.unit,
      source: data.source,
      workoutId: data.workout_id,
      setId: data.set_id,
      verificationStatus: data.verification_status,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
      metadata: data.metadata
    };
  }

  private findCurrentMax(records: any[]): any | null {
    // Prefer verified records, then most recent
    const verified = records.filter(r => r.verification_status === 'verified');
    if (verified.length > 0) {
      return verified.sort((a, b) => b.value - a.value)[0];
    }
    return records[0]; // Most recent
  }

  private findPersonalBest(records: any[]): any | null {
    const verified = records.filter(r => r.verification_status === 'verified');
    if (verified.length > 0) {
      return verified.sort((a, b) => b.value - a.value)[0];
    }
    return records.sort((a, b) => b.value - a.value)[0];
  }

  private calculateProgress(records: any[]): { lastMonth: number; lastThreeMonths: number; lastYear: number } {
    const now = new Date();
    const oneMonth = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const threeMonths = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
    const oneYear = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);

    const recentRecords = records.filter(r => new Date(r.created_at) > oneMonth);
    const threeMonthRecords = records.filter(r => new Date(r.created_at) > threeMonths);
    const yearRecords = records.filter(r => new Date(r.created_at) > oneYear);

    return {
      lastMonth: recentRecords.length > 0 ? Math.max(...recentRecords.map(r => r.value)) : 0,
      lastThreeMonths: threeMonthRecords.length > 0 ? Math.max(...threeMonthRecords.map(r => r.value)) : 0,
      lastYear: yearRecords.length > 0 ? Math.max(...yearRecords.map(r => r.value)) : 0
    };
  }

  private groupByUserAndGetBest(records: any[]): any[] {
    const userGroups = records.reduce((acc, record) => {
      const userId = record.user_id;
      if (!acc[userId] || record.value > acc[userId].value) {
        acc[userId] = record;
      }
      return acc;
    }, {} as any);

    return Object.values(userGroups);
  }

  private compareTrainingMaxes(a: any, b: any): number {
    // Verified records rank higher
    if (a.verification_status === 'verified' && b.verification_status !== 'verified') return -1;
    if (b.verification_status === 'verified' && a.verification_status !== 'verified') return 1;
    
    // Then by value
    return b.value - a.value;
  }

  private calculateWilksScore(weight: number, bodyweight?: number, unit: 'kg' | 'lb' = 'lb'): number | undefined {
    if (!bodyweight) return undefined;
    
    // Convert to kg if needed
    const weightKg = unit === 'lb' ? weight * 0.453592 : weight;
    const bodyweightKg = unit === 'lb' ? bodyweight * 0.453592 : bodyweight;
    
    // Simplified Wilks calculation (actual formula is more complex)
    return Math.round((weightKg / bodyweightKg) * 100);
  }

  private getEmptyHistory(exerciseId: string): TrainingMaxHistory {
    return {
      exerciseId,
      exerciseName: 'Unknown Exercise',
      records: [],
      currentMax: null,
      personalBest: null,
      progress: { lastMonth: 0, lastThreeMonths: 0, lastYear: 0 }
    };
  }

  private getEmptyLeaderboard(exerciseId: string, timeframe: string): ExerciseLeaderboard {
    return {
      exerciseId,
      exerciseName: 'Unknown Exercise',
      category: 'Other',
      timeframe: timeframe as any,
      entries: [],
      totalParticipants: 0
    };
  }
}

export const trainingMaxService = new TrainingMaxService();
