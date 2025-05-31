import {
    SessionStats,
    TwitchChatCommand,
    TwitchChatMessage,
    WorkoutChallenge,
    WorkoutUpdate
} from '@elite-locker/shared-types';
import tmi from 'tmi.js';
import { v4 as uuidv4 } from 'uuid';
import { logger } from '../utils/logger';

interface ChatBotConfig {
  username: string;
  accessToken: string;
  channels: string[];
}

export class TwitchChatBot {
  private client: tmi.Client | null = null;
  private isConnected: boolean = false;
  private config: ChatBotConfig | null = null;
  private commands: Map<string, TwitchChatCommand> = new Map();
  private commandCooldowns: Map<string, number> = new Map();
  private currentWorkout: WorkoutUpdate | null = null;
  private currentStats: SessionStats | null = null;
  private activeChallenges: Map<string, WorkoutChallenge> = new Map();
  private eventHandlers: Map<string, Function[]> = new Map();

  constructor() {
    this.setupDefaultCommands();
  }

  /**
   * Initialize and connect the chat bot
   */
  public async connect(config: ChatBotConfig): Promise<void> {
    this.config = config;

    try {
      this.client = new tmi.Client({
        options: { debug: process.env.NODE_ENV === 'development' },
        connection: {
          reconnect: true,
          secure: true,
        },
        identity: {
          username: config.username,
          password: `oauth:${config.accessToken}`,
        },
        channels: config.channels,
      });

      this.setupEventHandlers();

      await this.client.connect();
      this.isConnected = true;

      logger.info(`Twitch chat bot connected to channels: ${config.channels.join(', ')}`);
    } catch (error) {
      logger.error('Error connecting chat bot:', error);
      throw error;
    }
  }

  /**
   * Disconnect the chat bot
   */
  public async disconnect(): Promise<void> {
    if (this.client) {
      await this.client.disconnect();
      this.client = null;
      this.isConnected = false;
      logger.info('Twitch chat bot disconnected');
    }
  }

  /**
   * Setup event handlers for the TMI client
   */
  private setupEventHandlers(): void {
    if (!this.client) return;

    this.client.on('message', (channel, tags, message, self) => {
      if (self) return; // Ignore bot's own messages

      const chatMessage: TwitchChatMessage = {
        id: tags.id || uuidv4(),
        userId: tags['user-id'] || '',
        username: tags.username || '',
        displayName: tags['display-name'] || tags.username || '',
        message: message.trim(),
        timestamp: new Date(),
        badges: Object.fromEntries(
          Object.entries(tags.badges || {}).map(([key, value]) => [key, value || ''])
        ),
        color: tags.color,
        emotes: tags.emotes || {},
        isSubscriber: tags.subscriber || false,
        isModerator: tags.mod || false,
        isVip: tags.vip || false,
        isBroadcaster: tags.username === channel.slice(1), // Remove # from channel name
      };

      this.handleMessage(channel, chatMessage);
      this.emit('chatMessage', chatMessage);
    });

    this.client.on('connected', (addr, port) => {
      logger.info(`Chat bot connected to ${addr}:${port}`);
      this.emit('connected');
    });

    this.client.on('disconnected', (reason) => {
      logger.info(`Chat bot disconnected: ${reason}`);
      this.isConnected = false;
      this.emit('disconnected', { reason });
    });

    this.client.on('reconnect', () => {
      logger.info('Chat bot reconnecting...');
      this.emit('reconnecting');
    });
  }

  /**
   * Handle incoming chat messages
   */
  private async handleMessage(channel: string, message: TwitchChatMessage): Promise<void> {
    // Check if message is a command
    if (!message.message.startsWith('!')) return;

    const commandName = message.message.split(' ')[0].toLowerCase();
    const command = this.commands.get(commandName);

    if (!command || !command.enabled) return;

    // Check permissions
    if (command.modOnly && !message.isModerator && !message.isBroadcaster) return;
    if (command.subscriberOnly && !message.isSubscriber && !message.isModerator && !message.isBroadcaster) return;

    // Check cooldown
    const cooldownKey = `${commandName}_${message.userId}`;
    const now = Date.now();
    const lastUsed = this.commandCooldowns.get(cooldownKey) || 0;

    if (now - lastUsed < command.cooldown * 1000) {
      const remainingTime = Math.ceil((command.cooldown * 1000 - (now - lastUsed)) / 1000);
      await this.sendMessage(channel, `@${message.displayName} Command on cooldown for ${remainingTime} seconds.`);
      return;
    }

    // Update cooldown
    this.commandCooldowns.set(cooldownKey, now);

    // Execute command
    await this.executeCommand(channel, message, command);
  }

  /**
   * Execute a chat command
   */
  private async executeCommand(
    channel: string,
    message: TwitchChatMessage,
    command: TwitchChatCommand
  ): Promise<void> {
    try {
      let response = '';

      switch (command.action) {
        case 'workout_stats':
          response = this.getWorkoutStatsResponse();
          break;
        case 'current_exercise':
          response = this.getCurrentExerciseResponse();
          break;
        case 'session_time':
          response = this.getSessionTimeResponse();
          break;
        case 'pr_list':
          response = this.getPRListResponse();
          break;
        case 'challenge_user':
          response = await this.handleChallengeCommand(message);
          break;
        default:
          response = command.response || 'Command executed!';
      }

      if (response) {
        await this.sendMessage(channel, response);
      }
    } catch (error) {
      logger.error('Error executing command:', error);
      await this.sendMessage(channel, `@${message.displayName} Sorry, there was an error executing that command.`);
    }
  }

  /**
   * Send a message to chat
   */
  public async sendMessage(channel: string, message: string): Promise<void> {
    if (!this.client || !this.isConnected) {
      logger.warn('Cannot send message: chat bot not connected');
      return;
    }

    try {
      await this.client.say(channel, message);
    } catch (error) {
      logger.error('Error sending chat message:', error);
    }
  }

  /**
   * Update current workout data
   */
  public updateWorkoutData(workoutData: WorkoutUpdate): void {
    this.currentWorkout = workoutData;
  }

  /**
   * Update current session stats
   */
  public updateSessionStats(sessionStats: SessionStats): void {
    this.currentStats = sessionStats;
  }

  /**
   * Setup default chat commands
   */
  private setupDefaultCommands(): void {
    const defaultCommands: TwitchChatCommand[] = [
      {
        command: '!workout',
        description: 'Show current workout information',
        cooldown: 10,
        modOnly: false,
        subscriberOnly: false,
        enabled: true,
        action: 'current_exercise',
      },
      {
        command: '!stats',
        description: 'Show current session statistics',
        cooldown: 15,
        modOnly: false,
        subscriberOnly: false,
        enabled: true,
        action: 'workout_stats',
      },
      {
        command: '!time',
        description: 'Show workout session time',
        cooldown: 10,
        modOnly: false,
        subscriberOnly: false,
        enabled: true,
        action: 'session_time',
      },
      {
        command: '!prs',
        description: 'Show recent personal records',
        cooldown: 30,
        modOnly: false,
        subscriberOnly: false,
        enabled: true,
        action: 'pr_list',
      },
      {
        command: '!challenge',
        description: 'Challenge the streamer to extra reps',
        cooldown: 60,
        modOnly: false,
        subscriberOnly: true,
        enabled: true,
        action: 'challenge_user',
      },
    ];

    defaultCommands.forEach(cmd => {
      this.commands.set(cmd.command, cmd);
    });
  }

  /**
   * Get workout stats response
   */
  private getWorkoutStatsResponse(): string {
    if (!this.currentStats) {
      return 'No workout data available right now.';
    }

    const { totalTime, exercisesCompleted, totalSets, totalReps, totalVolume } = this.currentStats;
    const timeMinutes = Math.floor(totalTime / 60);

    return `💪 Workout Stats: ${timeMinutes}min | ${exercisesCompleted} exercises | ${totalSets} sets | ${totalReps} reps | ${totalVolume}lbs total volume`;
  }

  /**
   * Get current exercise response
   */
  private getCurrentExerciseResponse(): string {
    if (!this.currentWorkout) {
      return 'No active workout right now.';
    }

    const { currentExercise, currentSet, sessionProgress } = this.currentWorkout;
    const progress = Math.round((sessionProgress.exercisesCompleted / sessionProgress.totalExercises) * 100);

    return `🏋️ Current: ${currentExercise.name} | Set ${currentSet.setNumber}: ${currentSet.reps} reps @ ${currentSet.weight}lbs | Progress: ${progress}%`;
  }

  /**
   * Get session time response
   */
  private getSessionTimeResponse(): string {
    if (!this.currentWorkout) {
      return 'No active workout session.';
    }

    const timeElapsed = this.currentWorkout.sessionProgress.timeElapsed;
    const minutes = Math.floor(timeElapsed / 60);
    const seconds = timeElapsed % 60;

    return `⏱️ Session Time: ${minutes}:${seconds.toString().padStart(2, '0')}`;
  }

  /**
   * Get personal records response
   */
  private getPRListResponse(): string {
    if (!this.currentStats || this.currentStats.personalRecords.length === 0) {
      return 'No personal records achieved this session yet!';
    }

    const prs = this.currentStats.personalRecords.slice(0, 3); // Show top 3
    const prList = prs.map(pr => `${pr.exerciseName}: ${pr.value}${pr.type === 'weight' ? 'lbs' : pr.type === 'reps' ? ' reps' : 's'}`).join(' | ');

    return `🏆 Recent PRs: ${prList}`;
  }

  /**
   * Handle challenge command
   */
  private async handleChallengeCommand(message: TwitchChatMessage): Promise<string> {
    if (!this.currentWorkout) {
      return `@${message.displayName} No active workout to challenge right now!`;
    }

    const args = message.message.split(' ').slice(1);
    const reps = parseInt(args[0]) || 5;

    if (reps > 20) {
      return `@${message.displayName} Challenge too intense! Max 20 reps.`;
    }

    const challenge: WorkoutChallenge = {
      id: uuidv4(),
      challengerId: message.userId,
      challengerName: message.displayName,
      targetUserId: this.currentWorkout.userId,
      type: 'reps',
      description: `${message.displayName} challenges you to ${reps} extra reps!`,
      target: reps,
      current: 0,
      status: 'pending',
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 5 * 60 * 1000), // 5 minutes
    };

    this.activeChallenges.set(challenge.id, challenge);
    this.emit('workoutChallenge', challenge);

    return `🔥 ${message.displayName} challenges the streamer to ${reps} extra reps! Will they accept?`;
  }

  /**
   * Add or update a command
   */
  public setCommand(command: TwitchChatCommand): void {
    this.commands.set(command.command, command);
  }

  /**
   * Remove a command
   */
  public removeCommand(commandName: string): void {
    this.commands.delete(commandName);
  }

  /**
   * Get all commands
   */
  public getCommands(): TwitchChatCommand[] {
    return Array.from(this.commands.values());
  }

  /**
   * Event listener management
   */
  public on(event: string, callback: Function): void {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, []);
    }
    this.eventHandlers.get(event)!.push(callback);
  }

  public off(event: string, callback?: Function): void {
    if (!this.eventHandlers.has(event)) return;

    if (callback) {
      const callbacks = this.eventHandlers.get(event)!;
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    } else {
      this.eventHandlers.delete(event);
    }
  }

  private emit(event: string, data?: any): void {
    const callbacks = this.eventHandlers.get(event);
    if (callbacks) {
      callbacks.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          logger.error(`Error in chat bot event callback for ${event}:`, error);
        }
      });
    }
  }

  /**
   * Get connection status
   */
  public getStatus(): {
    isConnected: boolean;
    channels: string[];
    commandCount: number;
    activeChallenges: number;
  } {
    return {
      isConnected: this.isConnected,
      channels: this.config?.channels || [],
      commandCount: this.commands.size,
      activeChallenges: this.activeChallenges.size,
    };
  }
}
