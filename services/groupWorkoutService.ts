import { fetchData } from '@/lib/api';

export interface WorkoutInvitation {
  id: string;
  workout_id: string;
  inviter_id: string;
  invited_user_id: string;
  status: 'pending' | 'accepted' | 'declined' | 'expired';
  message?: string;
  created_at: string;
  updated_at: string;
  expires_at: string;
  inviter?: {
    username: string;
    full_name: string;
    avatar_url?: string;
  };
  workout?: {
    name: string;
    type: string;
    scheduled_for?: string;
  };
}

export interface WorkoutParticipant {
  id: string;
  workout_id: string;
  user_id: string;
  role: 'owner' | 'participant' | 'observer';
  joined_at: string;
  status: 'active' | 'left' | 'removed';
  user?: {
    username: string;
    full_name: string;
    avatar_url?: string;
  };
}

export interface GroupWorkoutSession {
  id: string;
  workout_id: string;
  session_code: string;
  is_active: boolean;
  max_participants: number;
  current_participants: number;
  created_by: string;
  created_at: string;
  started_at?: string;
  ended_at?: string;
  settings: {
    allow_spectators: boolean;
    sync_rest_timers: boolean;
    share_progress: boolean;
    voice_chat_enabled: boolean;
  };
}

export interface GroupWorkoutUpdate {
  id: string;
  session_id: string;
  user_id: string;
  exercise_id?: string;
  set_number?: number;
  update_type: string;
  data: any;
  created_at: string;
  user?: {
    username: string;
    full_name: string;
  };
}

class GroupWorkoutService {
  // Invitation Management
  async sendInvitations(workoutId: string, userIds: string[], message?: string): Promise<WorkoutInvitation[]> {
    try {
      const invitations = userIds.map(userId => ({
        workout_id: workoutId,
        invited_user_id: userId,
        message: message || '',
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours
      }));

      const result = await fetchData('workout_invitations', {
        method: 'POST',
        body: invitations
      });

      return result;
    } catch (error) {
      console.error('Error sending invitations:', error);
      throw error;
    }
  }

  async getInvitations(userId: string): Promise<WorkoutInvitation[]> {
    try {
      const invitations = await fetchData('workout_invitations', {
        select: `
          *,
          inviter:profiles!inviter_id(username, full_name, avatar_url),
          workout:workouts(name, type, scheduled_for)
        `,
        filters: { invited_user_id: userId },
        order: { created_at: 'desc' }
      });

      return invitations || [];
    } catch (error) {
      console.error('Error fetching invitations:', error);
      return [];
    }
  }

  async respondToInvitation(invitationId: string, response: 'accepted' | 'declined'): Promise<void> {
    try {
      await fetchData('workout_invitations', {
        method: 'PATCH',
        filters: { id: invitationId },
        body: {
          status: response,
          updated_at: new Date().toISOString()
        }
      });

      // If accepted, add user as participant
      if (response === 'accepted') {
        const invitation = await fetchData('workout_invitations', {
          select: 'workout_id, invited_user_id',
          filters: { id: invitationId },
          single: true
        });

        if (invitation) {
          await this.addParticipant(invitation.workout_id, invitation.invited_user_id, 'participant');
        }
      }
    } catch (error) {
      console.error('Error responding to invitation:', error);
      throw error;
    }
  }

  // Participant Management
  async addParticipant(workoutId: string, userId: string, role: 'owner' | 'participant' | 'observer' = 'participant'): Promise<WorkoutParticipant> {
    try {
      const participant = await fetchData('workout_participants', {
        method: 'POST',
        body: {
          workout_id: workoutId,
          user_id: userId,
          role: role
        }
      });

      return participant;
    } catch (error) {
      console.error('Error adding participant:', error);
      throw error;
    }
  }

  async getParticipants(workoutId: string): Promise<WorkoutParticipant[]> {
    try {
      const participants = await fetchData('workout_participants', {
        select: `
          *,
          user:profiles!user_id(username, full_name, avatar_url)
        `,
        filters: { 
          workout_id: workoutId,
          status: 'active'
        },
        order: { joined_at: 'asc' }
      });

      return participants || [];
    } catch (error) {
      console.error('Error fetching participants:', error);
      return [];
    }
  }

  async removeParticipant(workoutId: string, userId: string): Promise<void> {
    try {
      await fetchData('workout_participants', {
        method: 'PATCH',
        filters: { 
          workout_id: workoutId,
          user_id: userId
        },
        body: {
          status: 'left'
        }
      });
    } catch (error) {
      console.error('Error removing participant:', error);
      throw error;
    }
  }

  // Group Session Management
  async createGroupSession(workoutId: string, settings?: Partial<GroupWorkoutSession['settings']>): Promise<GroupWorkoutSession> {
    try {
      const defaultSettings = {
        allow_spectators: true,
        sync_rest_timers: true,
        share_progress: true,
        voice_chat_enabled: false
      };

      const session = await fetchData('group_workout_sessions', {
        method: 'POST',
        body: {
          workout_id: workoutId,
          session_code: this.generateSessionCode(),
          settings: { ...defaultSettings, ...settings }
        }
      });

      return session;
    } catch (error) {
      console.error('Error creating group session:', error);
      throw error;
    }
  }

  async joinSessionByCode(sessionCode: string, userId: string): Promise<GroupWorkoutSession> {
    try {
      const session = await fetchData('group_workout_sessions', {
        select: '*',
        filters: { 
          session_code: sessionCode,
          is_active: true
        },
        single: true
      });

      if (!session) {
        throw new Error('Session not found or inactive');
      }

      // Add user as participant
      await this.addParticipant(session.workout_id, userId, 'participant');

      return session;
    } catch (error) {
      console.error('Error joining session:', error);
      throw error;
    }
  }

  async getActiveSession(workoutId: string): Promise<GroupWorkoutSession | null> {
    try {
      const session = await fetchData('group_workout_sessions', {
        select: '*',
        filters: { 
          workout_id: workoutId,
          is_active: true
        },
        single: true
      });

      return session || null;
    } catch (error) {
      console.error('Error fetching active session:', error);
      return null;
    }
  }

  async endSession(sessionId: string): Promise<void> {
    try {
      await fetchData('group_workout_sessions', {
        method: 'PATCH',
        filters: { id: sessionId },
        body: {
          is_active: false,
          ended_at: new Date().toISOString()
        }
      });
    } catch (error) {
      console.error('Error ending session:', error);
      throw error;
    }
  }

  // Real-time Updates
  async sendUpdate(sessionId: string, updateType: string, data: any): Promise<void> {
    try {
      await fetchData('group_workout_updates', {
        method: 'POST',
        body: {
          session_id: sessionId,
          update_type: updateType,
          data: data
        }
      });
    } catch (error) {
      console.error('Error sending update:', error);
      throw error;
    }
  }

  async getRecentUpdates(sessionId: string, limit: number = 50): Promise<GroupWorkoutUpdate[]> {
    try {
      const updates = await fetchData('group_workout_updates', {
        select: `
          *,
          user:profiles!user_id(username, full_name)
        `,
        filters: { session_id: sessionId },
        order: { created_at: 'desc' },
        limit: limit
      });

      return updates || [];
    } catch (error) {
      console.error('Error fetching updates:', error);
      return [];
    }
  }

  // Utility Methods
  private generateSessionCode(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  async searchUsers(query: string, limit: number = 10): Promise<any[]> {
    try {
      const users = await fetchData('profiles', {
        select: 'id, username, full_name, avatar_url',
        filters: {
          or: `username.ilike.%${query}%,full_name.ilike.%${query}%`
        },
        limit: limit
      });

      return users || [];
    } catch (error) {
      console.error('Error searching users:', error);
      return [];
    }
  }

  // Cleanup expired invitations
  async cleanupExpiredInvitations(): Promise<void> {
    try {
      await fetchData('workout_invitations', {
        method: 'PATCH',
        filters: {
          status: 'pending',
          expires_at: `lt.${new Date().toISOString()}`
        },
        body: {
          status: 'expired',
          updated_at: new Date().toISOString()
        }
      });
    } catch (error) {
      console.error('Error cleaning up expired invitations:', error);
    }
  }
}

export const groupWorkoutService = new GroupWorkoutService();
