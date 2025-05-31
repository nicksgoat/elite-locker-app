import {
    StreamingError,
    TwitchChannelPointRedemption,
    TwitchChannelPointReward,
    TwitchStream,
    TwitchTokens,
    TwitchUser
} from '@elite-locker/shared-types';
import axios, { AxiosInstance } from 'axios';
import { logger } from '../utils/logger';

export class TwitchService {
  private apiClient: AxiosInstance | null = null;
  private clientId: string;
  private clientSecret: string;
  private redirectUri: string;
  private appAccessToken: string | null = null;

  constructor() {
    this.clientId = process.env.TWITCH_CLIENT_ID || '';
    this.clientSecret = process.env.TWITCH_CLIENT_SECRET || '';
    this.redirectUri = process.env.TWITCH_REDIRECT_URI || 'http://localhost:3001/api/twitch/callback';

    if (!this.clientId || !this.clientSecret) {
      logger.warn('Twitch client ID and secret not configured - Twitch features will be disabled');
      // Don't throw error for testing purposes
      return;
    }

    logger.info('Twitch service initialized successfully with API credentials');

    this.apiClient = axios.create({
      baseURL: 'https://api.twitch.tv/helix',
      headers: {
        'Client-ID': this.clientId,
      },
    });

    // Initialize app access token (don't await to avoid blocking constructor)
    this.getAppAccessToken().catch(error => {
      logger.warn('Failed to initialize app access token:', error.message);
    });
  }

  /**
   * Check if Twitch service is properly configured
   */
  private isConfigured(): boolean {
    return this.apiClient !== null && !!this.clientId && !!this.clientSecret;
  }

  /**
   * Get Twitch OAuth authorization URL
   */
  public getAuthorizationUrl(state: string): string {
    if (!this.isConfigured()) {
      throw new StreamingError('Twitch service not configured', 'TWITCH_NOT_CONFIGURED', 500);
    }

    const scopes = [
      'user:read:email',
      'channel:read:stream_key',
      'channel:manage:broadcast',
      'channel:read:subscriptions',
      'channel:manage:redemptions',
      'chat:read',
      'chat:edit',
      'moderator:read:followers',
      'moderator:read:chatters',
    ].join(' ');

    const params = new URLSearchParams({
      client_id: this.clientId,
      redirect_uri: this.redirectUri,
      response_type: 'code',
      scope: scopes,
      state,
    });

    return `https://id.twitch.tv/oauth2/authorize?${params.toString()}`;
  }

  /**
   * Exchange authorization code for access tokens
   */
  public async exchangeCodeForTokens(code: string): Promise<TwitchTokens> {
    if (!this.isConfigured()) {
      throw new StreamingError('Twitch service not configured', 'TWITCH_NOT_CONFIGURED', 500);
    }

    try {
      const response = await axios.post('https://id.twitch.tv/oauth2/token', {
        client_id: this.clientId,
        client_secret: this.clientSecret,
        code,
        grant_type: 'authorization_code',
        redirect_uri: this.redirectUri,
      });

      const tokens: TwitchTokens = {
        accessToken: response.data.access_token,
        refreshToken: response.data.refresh_token,
        expiresIn: response.data.expires_in,
        scope: response.data.scope,
        tokenType: response.data.token_type,
      };

      logger.info('Successfully exchanged code for Twitch tokens');
      return tokens;
    } catch (error) {
      logger.error('Error exchanging code for tokens:', error);
      throw new StreamingError('Failed to authenticate with Twitch', 'TWITCH_AUTH_ERROR', 400);
    }
  }

  /**
   * Refresh access token
   */
  public async refreshAccessToken(refreshToken: string): Promise<TwitchTokens> {
    if (!this.isConfigured()) {
      throw new StreamingError('Twitch service not configured', 'TWITCH_NOT_CONFIGURED', 500);
    }

    try {
      const response = await axios.post('https://id.twitch.tv/oauth2/token', {
        client_id: this.clientId,
        client_secret: this.clientSecret,
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
      });

      const tokens: TwitchTokens = {
        accessToken: response.data.access_token,
        refreshToken: response.data.refresh_token,
        expiresIn: response.data.expires_in,
        scope: response.data.scope,
        tokenType: response.data.token_type,
      };

      logger.info('Successfully refreshed Twitch tokens');
      return tokens;
    } catch (error) {
      logger.error('Error refreshing tokens:', error);
      throw new StreamingError('Failed to refresh Twitch tokens', 'TWITCH_REFRESH_ERROR', 401);
    }
  }

  /**
   * Get app access token for API calls that don't require user authentication
   */
  private async getAppAccessToken(): Promise<string> {
    if (!this.isConfigured()) {
      throw new StreamingError('Twitch service not configured', 'TWITCH_NOT_CONFIGURED', 500);
    }

    if (this.appAccessToken) {
      return this.appAccessToken;
    }

    try {
      const response = await axios.post('https://id.twitch.tv/oauth2/token', {
        client_id: this.clientId,
        client_secret: this.clientSecret,
        grant_type: 'client_credentials',
      });

      this.appAccessToken = response.data.access_token;

      // Set up automatic refresh before expiration
      const expiresIn = response.data.expires_in * 1000; // Convert to milliseconds
      setTimeout(() => {
        this.appAccessToken = null;
        this.getAppAccessToken();
      }, expiresIn - 60000); // Refresh 1 minute before expiration

      return this.appAccessToken!;
    } catch (error) {
      logger.error('Error getting app access token:', error);
      throw new StreamingError('Failed to get Twitch app access token', 'TWITCH_APP_TOKEN_ERROR', 500);
    }
  }

  /**
   * Get user information
   */
  public async getUser(accessToken: string, userId?: string): Promise<TwitchUser> {
    if (!this.isConfigured() || !this.apiClient) {
      throw new StreamingError('Twitch service not configured', 'TWITCH_NOT_CONFIGURED', 500);
    }

    try {
      const params = userId ? { id: userId } : {};
      const response = await this.apiClient!.get('/users', {
        headers: { Authorization: `Bearer ${accessToken}` },
        params,
      });

      if (!response.data.data || response.data.data.length === 0) {
        throw new StreamingError('User not found', 'USER_NOT_FOUND', 404);
      }

      const userData = response.data.data[0];
      return {
        id: userData.id,
        login: userData.login,
        displayName: userData.display_name,
        type: userData.type,
        broadcasterType: userData.broadcaster_type,
        description: userData.description,
        profileImageUrl: userData.profile_image_url,
        offlineImageUrl: userData.offline_image_url,
        viewCount: userData.view_count,
        email: userData.email,
        createdAt: userData.created_at,
      };
    } catch (error) {
      logger.error('Error getting user:', error);
      throw new StreamingError('Failed to get user information', 'TWITCH_USER_ERROR', 500);
    }
  }

  /**
   * Get stream information
   */
  public async getStream(userId: string): Promise<TwitchStream | null> {
    if (!this.isConfigured() || !this.apiClient) {
      throw new StreamingError('Twitch service not configured', 'TWITCH_NOT_CONFIGURED', 500);
    }

    try {
      const appToken = await this.getAppAccessToken();
      const response = await this.apiClient!.get('/streams', {
        headers: { Authorization: `Bearer ${appToken}` },
        params: { user_id: userId },
      });

      if (!response.data.data || response.data.data.length === 0) {
        return null; // Stream is offline
      }

      const streamData = response.data.data[0];
      return {
        id: streamData.id,
        userId: streamData.user_id,
        userLogin: streamData.user_login,
        userName: streamData.user_name,
        gameId: streamData.game_id,
        gameName: streamData.game_name,
        type: streamData.type,
        title: streamData.title,
        viewerCount: streamData.viewer_count,
        startedAt: streamData.started_at,
        language: streamData.language,
        thumbnailUrl: streamData.thumbnail_url,
        tagIds: streamData.tag_ids || [],
        tags: streamData.tags || [],
        isMature: streamData.is_mature,
      };
    } catch (error) {
      logger.error('Error getting stream:', error);
      throw new StreamingError('Failed to get stream information', 'TWITCH_STREAM_ERROR', 500);
    }
  }

  /**
   * Update stream title and category
   */
  public async updateStream(
    accessToken: string,
    broadcasterId: string,
    title?: string,
    categoryId?: string
  ): Promise<void> {
    if (!this.isConfigured() || !this.apiClient) {
      throw new StreamingError('Twitch service not configured', 'TWITCH_NOT_CONFIGURED', 500);
    }

    try {
      const data: any = {};
      if (title) data.title = title;
      if (categoryId) data.game_id = categoryId;

      await this.apiClient!.patch(`/channels?broadcaster_id=${broadcasterId}`, data, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      logger.info(`Updated stream for broadcaster ${broadcasterId}`, { title, categoryId });
    } catch (error) {
      logger.error('Error updating stream:', error);
      throw new StreamingError('Failed to update stream', 'TWITCH_UPDATE_STREAM_ERROR', 500);
    }
  }

  /**
   * Get channel point rewards
   */
  public async getChannelPointRewards(
    accessToken: string,
    broadcasterId: string
  ): Promise<TwitchChannelPointReward[]> {
    if (!this.isConfigured() || !this.apiClient) {
      throw new StreamingError('Twitch service not configured', 'TWITCH_NOT_CONFIGURED', 500);
    }

    try {
      const response = await this.apiClient!.get('/channel_points/custom_rewards', {
        headers: { Authorization: `Bearer ${accessToken}` },
        params: { broadcaster_id: broadcasterId },
      });

      return response.data.data.map((reward: any) => ({
        id: reward.id,
        title: reward.title,
        prompt: reward.prompt,
        cost: reward.cost,
        image: reward.image,
        defaultImage: reward.default_image,
        backgroundColor: reward.background_color,
        isEnabled: reward.is_enabled,
        isUserInputRequired: reward.is_user_input_required,
        maxPerStreamSetting: reward.max_per_stream_setting,
        maxPerUserPerStreamSetting: reward.max_per_user_per_stream_setting,
        globalCooldownSetting: reward.global_cooldown_setting,
        isPaused: reward.is_paused,
        isInStock: reward.is_in_stock,
        shouldRedemptionsSkipRequestQueue: reward.should_redemptions_skip_request_queue,
        redemptionsRedeemedCurrentStream: reward.redemptions_redeemed_current_stream,
        cooldownExpiresAt: reward.cooldown_expires_at,
      }));
    } catch (error) {
      logger.error('Error getting channel point rewards:', error);
      throw new StreamingError('Failed to get channel point rewards', 'TWITCH_REWARDS_ERROR', 500);
    }
  }

  /**
   * Create channel point reward
   */
  public async createChannelPointReward(
    accessToken: string,
    broadcasterId: string,
    reward: Partial<TwitchChannelPointReward>
  ): Promise<TwitchChannelPointReward> {
    if (!this.isConfigured() || !this.apiClient) {
      throw new StreamingError('Twitch service not configured', 'TWITCH_NOT_CONFIGURED', 500);
    }

    try {
      const response = await this.apiClient!.post('/channel_points/custom_rewards', reward, {
        headers: { Authorization: `Bearer ${accessToken}` },
        params: { broadcaster_id: broadcasterId },
      });

      const rewardData = response.data.data[0];
      return {
        id: rewardData.id,
        title: rewardData.title,
        prompt: rewardData.prompt,
        cost: rewardData.cost,
        image: rewardData.image,
        defaultImage: rewardData.default_image,
        backgroundColor: rewardData.background_color,
        isEnabled: rewardData.is_enabled,
        isUserInputRequired: rewardData.is_user_input_required,
        maxPerStreamSetting: rewardData.max_per_stream_setting,
        maxPerUserPerStreamSetting: rewardData.max_per_user_per_stream_setting,
        globalCooldownSetting: rewardData.global_cooldown_setting,
        isPaused: rewardData.is_paused,
        isInStock: rewardData.is_in_stock,
        shouldRedemptionsSkipRequestQueue: rewardData.should_redemptions_skip_request_queue,
        redemptionsRedeemedCurrentStream: rewardData.redemptions_redeemed_current_stream,
        cooldownExpiresAt: rewardData.cooldown_expires_at,
      };
    } catch (error) {
      logger.error('Error creating channel point reward:', error);
      throw new StreamingError('Failed to create channel point reward', 'TWITCH_CREATE_REWARD_ERROR', 500);
    }
  }

  /**
   * Get channel point redemptions
   */
  public async getChannelPointRedemptions(
    accessToken: string,
    broadcasterId: string,
    rewardId: string,
    status?: 'UNFULFILLED' | 'FULFILLED' | 'CANCELED'
  ): Promise<TwitchChannelPointRedemption[]> {
    if (!this.isConfigured() || !this.apiClient) {
      throw new StreamingError('Twitch service not configured', 'TWITCH_NOT_CONFIGURED', 500);
    }

    try {
      const params: any = {
        broadcaster_id: broadcasterId,
        reward_id: rewardId,
      };
      if (status) params.status = status;

      const response = await this.apiClient!.get('/channel_points/custom_rewards/redemptions', {
        headers: { Authorization: `Bearer ${accessToken}` },
        params,
      });

      return response.data.data.map((redemption: any) => ({
        id: redemption.id,
        userId: redemption.user_id,
        userName: redemption.user_name,
        userDisplayName: redemption.user_display_name,
        userInput: redemption.user_input,
        status: redemption.status,
        redeemedAt: redemption.redeemed_at,
        reward: redemption.reward,
      }));
    } catch (error) {
      logger.error('Error getting channel point redemptions:', error);
      throw new StreamingError('Failed to get channel point redemptions', 'TWITCH_REDEMPTIONS_ERROR', 500);
    }
  }

  /**
   * Update channel point redemption status
   */
  public async updateChannelPointRedemption(
    accessToken: string,
    broadcasterId: string,
    rewardId: string,
    redemptionId: string,
    status: 'FULFILLED' | 'CANCELED'
  ): Promise<void> {
    if (!this.isConfigured() || !this.apiClient) {
      throw new StreamingError('Twitch service not configured', 'TWITCH_NOT_CONFIGURED', 500);
    }

    try {
      await this.apiClient!.patch('/channel_points/custom_rewards/redemptions',
        { status },
        {
          headers: { Authorization: `Bearer ${accessToken}` },
          params: {
            broadcaster_id: broadcasterId,
            reward_id: rewardId,
            id: redemptionId,
          },
        }
      );

      logger.info(`Updated redemption ${redemptionId} status to ${status}`);
    } catch (error) {
      logger.error('Error updating channel point redemption:', error);
      throw new StreamingError('Failed to update channel point redemption', 'TWITCH_UPDATE_REDEMPTION_ERROR', 500);
    }
  }

  /**
   * Validate access token
   */
  public async validateToken(accessToken: string): Promise<boolean> {
    try {
      await axios.get('https://id.twitch.tv/oauth2/validate', {
        headers: { Authorization: `OAuth ${accessToken}` },
      });
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Revoke access token
   */
  public async revokeToken(accessToken: string): Promise<void> {
    if (!this.isConfigured()) {
      throw new StreamingError('Twitch service not configured', 'TWITCH_NOT_CONFIGURED', 500);
    }

    try {
      await axios.post('https://id.twitch.tv/oauth2/revoke', {
        client_id: this.clientId,
        token: accessToken,
      });
      logger.info('Successfully revoked Twitch token');
    } catch (error) {
      logger.error('Error revoking token:', error);
      throw new StreamingError('Failed to revoke Twitch token', 'TWITCH_REVOKE_ERROR', 500);
    }
  }
}
