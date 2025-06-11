import { fetchData, insertData, updateData, deleteData } from '../lib/api';
import { getCurrentUser } from '../lib/auth';
import { ApiError } from './index';

// Library content types
export interface LibraryContent {
  id: string;
  contentId: string;
  contentType: 'workout' | 'program' | 'exercise' | 'collection';
  userId: string;
  purchaseId?: string;
  addedAt: Date;
  accessType: 'purchased' | 'created' | 'subscribed' | 'free';
  expiresAt?: Date;
  metadata?: {
    originalPrice?: number;
    purchaseDate?: Date;
    referralCode?: string;
    creatorId?: string;
    creatorName?: string;
  };
}

export interface PurchaseRecord {
  id: string;
  userId: string;
  contentId: string;
  contentType: 'workout' | 'program' | 'club' | 'collection';
  price: number;
  currency: string;
  paymentMethod: string;
  stripePaymentIntentId?: string;
  referralCode?: string;
  referrerId?: string;
  affiliateCommission?: number;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  purchasedAt: Date;
  expiresAt?: Date;
  metadata?: any;
}

export interface UserLibrary {
  workouts: LibraryContent[];
  programs: LibraryContent[];
  exercises: LibraryContent[];
  collections: LibraryContent[];
  totalItems: number;
  recentlyAdded: LibraryContent[];
  favorites: LibraryContent[];
}

export interface ContentAccess {
  hasAccess: boolean;
  accessType: 'purchased' | 'created' | 'subscribed' | 'free' | 'none';
  expiresAt?: Date;
  purchaseRequired?: boolean;
  price?: number;
  creatorId?: string;
}

class LibraryService {
  // Get user's complete library
  async getUserLibrary(userId?: string): Promise<UserLibrary> {
    try {
      const user = userId ? { id: userId } : await getCurrentUser();
      if (!user) {
        throw new ApiError('User not authenticated', 401);
      }

      // Fetch all library content for the user
      const libraryData = await fetchData('user_library', {
        select: `
          *,
          content_workout:workouts(*),
          content_program:programs(*),
          content_exercise:exercises(*),
          purchase:purchases(*)
        `,
        filters: { user_id: user.id },
        order: { column: 'added_at', ascending: false }
      });

      if (!libraryData) {
        return this.getEmptyLibrary();
      }

      // Organize content by type
      const workouts = libraryData.filter(item => item.content_type === 'workout');
      const programs = libraryData.filter(item => item.content_type === 'program');
      const exercises = libraryData.filter(item => item.content_type === 'exercise');
      const collections = libraryData.filter(item => item.content_type === 'collection');

      // Get recently added (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const recentlyAdded = libraryData
        .filter(item => new Date(item.added_at) > thirtyDaysAgo)
        .slice(0, 10);

      // Get favorites
      const favorites = await this.getUserFavorites(user.id);

      return {
        workouts,
        programs,
        exercises,
        collections,
        totalItems: libraryData.length,
        recentlyAdded,
        favorites
      };
    } catch (error) {
      console.error('Error fetching user library:', error);
      return this.getEmptyLibrary();
    }
  }

  // Check if user has access to specific content
  async checkContentAccess(contentId: string, contentType: string, userId?: string): Promise<ContentAccess> {
    try {
      const user = userId ? { id: userId } : await getCurrentUser();
      if (!user) {
        return { hasAccess: false, accessType: 'none', purchaseRequired: true };
      }

      // Check if user created the content
      const createdContent = await this.checkIfUserCreated(contentId, contentType, user.id);
      if (createdContent) {
        return { hasAccess: true, accessType: 'created' };
      }

      // Check if content is free
      const contentDetails = await this.getContentDetails(contentId, contentType);
      if (contentDetails && !contentDetails.is_paid) {
        return { hasAccess: true, accessType: 'free' };
      }

      // Check if user has purchased the content
      const purchase = await this.getUserPurchase(user.id, contentId, contentType);
      if (purchase && purchase.status === 'completed') {
        const hasExpired = purchase.expiresAt && new Date() > new Date(purchase.expiresAt);
        if (!hasExpired) {
          return {
            hasAccess: true,
            accessType: 'purchased',
            expiresAt: purchase.expiresAt
          };
        }
      }

      // Check if user has active subscription (for programs/clubs)
      if (contentType === 'program' || contentType === 'club') {
        const subscription = await this.getUserSubscription(user.id, contentId, contentType);
        if (subscription && subscription.status === 'active') {
          return {
            hasAccess: true,
            accessType: 'subscribed',
            expiresAt: subscription.expiresAt
          };
        }
      }

      // No access - return purchase info
      return {
        hasAccess: false,
        accessType: 'none',
        purchaseRequired: true,
        price: contentDetails?.price,
        creatorId: contentDetails?.author_id
      };
    } catch (error) {
      console.error('Error checking content access:', error);
      return { hasAccess: false, accessType: 'none', purchaseRequired: true };
    }
  }

  // Purchase content and add to library
  async purchaseContent(
    contentId: string,
    contentType: string,
    price: number,
    paymentMethod: string,
    referralCode?: string
  ): Promise<{ success: boolean; purchaseId?: string; error?: string }> {
    try {
      const user = await getCurrentUser();
      if (!user) {
        throw new ApiError('User not authenticated', 401);
      }

      // Check if already purchased
      const existingPurchase = await this.getUserPurchase(user.id, contentId, contentType);
      if (existingPurchase && existingPurchase.status === 'completed') {
        return { success: false, error: 'Content already purchased' };
      }

      // Get content details
      const contentDetails = await this.getContentDetails(contentId, contentType);
      if (!contentDetails) {
        return { success: false, error: 'Content not found' };
      }

      // Handle referral
      let referrerId = null;
      let affiliateCommission = 0;
      if (referralCode) {
        const referrer = await this.getReferrerByCode(referralCode);
        if (referrer) {
          referrerId = referrer.id;
          affiliateCommission = price * 0.1; // 10% commission
        }
      }

      // Create purchase record
      const purchaseData = {
        user_id: user.id,
        content_id: contentId,
        content_type: contentType,
        price,
        currency: 'USD',
        payment_method: paymentMethod,
        referral_code: referralCode,
        referrer_id: referrerId,
        affiliate_commission: affiliateCommission,
        status: 'completed', // In real app, would be 'pending' until Stripe confirms
        purchased_at: new Date().toISOString(),
        metadata: {
          creatorId: contentDetails.author_id,
          creatorName: contentDetails.creator_name
        }
      };

      const purchase = await insertData('purchases', purchaseData);
      if (!purchase) {
        return { success: false, error: 'Failed to create purchase record' };
      }

      // Add to user library
      await this.addToLibrary(user.id, contentId, contentType, 'purchased', purchase.id);

      // Update affiliate tracking
      if (referrerId) {
        await this.updateAffiliateTracking(referrerId, contentId, contentType, affiliateCommission);
      }

      return { success: true, purchaseId: purchase.id };
    } catch (error) {
      console.error('Error purchasing content:', error);
      return { success: false, error: 'Purchase failed' };
    }
  }

  // Add content to user library
  async addToLibrary(
    userId: string,
    contentId: string,
    contentType: string,
    accessType: 'purchased' | 'created' | 'subscribed' | 'free',
    purchaseId?: string
  ): Promise<boolean> {
    try {
      // Check if already in library
      const existing = await fetchData('user_library', {
        filters: {
          user_id: userId,
          content_id: contentId,
          content_type: contentType
        },
        limit: 1
      });

      if (existing && existing.length > 0) {
        return true; // Already in library
      }

      // Add to library
      const libraryItem = {
        user_id: userId,
        content_id: contentId,
        content_type: contentType,
        access_type: accessType,
        purchase_id: purchaseId,
        added_at: new Date().toISOString()
      };

      const result = await insertData('user_library', libraryItem);
      return !!result;
    } catch (error) {
      console.error('Error adding to library:', error);
      return false;
    }
  }

  // Remove content from library
  async removeFromLibrary(userId: string, contentId: string, contentType: string): Promise<boolean> {
    try {
      const result = await deleteData('user_library', {
        user_id: userId,
        content_id: contentId,
        content_type: contentType
      });
      return !!result;
    } catch (error) {
      console.error('Error removing from library:', error);
      return false;
    }
  }

  // Get user's purchase history
  async getPurchaseHistory(userId?: string): Promise<PurchaseRecord[]> {
    try {
      const user = userId ? { id: userId } : await getCurrentUser();
      if (!user) {
        throw new ApiError('User not authenticated', 401);
      }

      const purchases = await fetchData('purchases', {
        select: `
          *,
          content_workout:workouts(title, thumbnail_url),
          content_program:programs(title, thumbnail_url),
          referrer:profiles(username, full_name)
        `,
        filters: { user_id: user.id },
        order: { column: 'purchased_at', ascending: false }
      });

      return purchases || [];
    } catch (error) {
      console.error('Error fetching purchase history:', error);
      return [];
    }
  }

  // Private helper methods
  private async checkIfUserCreated(contentId: string, contentType: string, userId: string): Promise<boolean> {
    try {
      const tableName = contentType === 'workout' ? 'workouts' : 
                       contentType === 'program' ? 'programs' : 
                       contentType === 'exercise' ? 'exercises' : 'collections';
      
      const content = await fetchData(tableName, {
        filters: { id: contentId, author_id: userId },
        limit: 1
      });

      return content && content.length > 0;
    } catch (error) {
      return false;
    }
  }

  private async getContentDetails(contentId: string, contentType: string): Promise<any> {
    try {
      const tableName = contentType === 'workout' ? 'workouts' : 
                       contentType === 'program' ? 'programs' : 
                       contentType === 'exercise' ? 'exercises' : 'collections';
      
      const content = await fetchData(tableName, {
        filters: { id: contentId },
        limit: 1
      });

      return content && content.length > 0 ? content[0] : null;
    } catch (error) {
      return null;
    }
  }

  private async getUserPurchase(userId: string, contentId: string, contentType: string): Promise<any> {
    try {
      const purchases = await fetchData('purchases', {
        filters: {
          user_id: userId,
          content_id: contentId,
          content_type: contentType
        },
        order: { column: 'purchased_at', ascending: false },
        limit: 1
      });

      return purchases && purchases.length > 0 ? purchases[0] : null;
    } catch (error) {
      return null;
    }
  }

  private async getUserSubscription(userId: string, contentId: string, contentType: string): Promise<any> {
    try {
      if (contentType === 'program') {
        const subscriptions = await fetchData('program_subscriptions', {
          filters: {
            user_id: userId,
            program_id: contentId,
            status: 'active'
          },
          limit: 1
        });
        return subscriptions && subscriptions.length > 0 ? subscriptions[0] : null;
      }
      // Add club subscriptions logic here
      return null;
    } catch (error) {
      return null;
    }
  }

  private async getUserFavorites(userId: string): Promise<LibraryContent[]> {
    try {
      const favorites = await fetchData('user_favorites', {
        select: `
          *,
          content_workout:workouts(*),
          content_program:programs(*),
          content_exercise:exercises(*)
        `,
        filters: { user_id: userId },
        order: { column: 'created_at', ascending: false }
      });

      return favorites || [];
    } catch (error) {
      return [];
    }
  }

  private async getReferrerByCode(referralCode: string): Promise<any> {
    try {
      const referrer = await fetchData('profiles', {
        filters: { referral_code: referralCode },
        limit: 1
      });
      return referrer && referrer.length > 0 ? referrer[0] : null;
    } catch (error) {
      return null;
    }
  }

  private async updateAffiliateTracking(referrerId: string, contentId: string, contentType: string, commission: number): Promise<void> {
    try {
      // Update or create affiliate tracking record
      const existing = await fetchData('affiliate_tracking', {
        filters: {
          referrer_id: referrerId,
          content_id: contentId,
          content_type: contentType
        },
        limit: 1
      });

      if (existing && existing.length > 0) {
        await updateData('affiliate_tracking', existing[0].id, {
          conversions: existing[0].conversions + 1,
          earnings: existing[0].earnings + commission,
          updated_at: new Date().toISOString()
        });
      } else {
        await insertData('affiliate_tracking', {
          referrer_id: referrerId,
          content_id: contentId,
          content_type: contentType,
          conversions: 1,
          earnings: commission,
          created_at: new Date().toISOString()
        });
      }
    } catch (error) {
      console.error('Error updating affiliate tracking:', error);
    }
  }

  private getEmptyLibrary(): UserLibrary {
    return {
      workouts: [],
      programs: [],
      exercises: [],
      collections: [],
      totalItems: 0,
      recentlyAdded: [],
      favorites: []
    };
  }
}

export const libraryService = new LibraryService();
