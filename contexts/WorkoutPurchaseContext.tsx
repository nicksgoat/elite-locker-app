import React, { createContext, ReactNode, useContext, useState, useEffect } from 'react';
import { libraryService, PurchaseRecord, ContentAccess } from '../services/libraryService';

interface PurchasedWorkout {
  workoutId: string;
  purchaseDate: Date;
  price: number;
  creator: string;
}

interface WorkoutPurchaseContextType {
  purchasedWorkouts: PurchasedWorkout[];
  purchaseHistory: PurchaseRecord[];
  isPurchased: (contentId: string, contentType?: string) => boolean;
  hasAccess: (contentId: string, contentType?: string) => Promise<ContentAccess>;
  purchaseWorkout: (workoutId: string, price: number, creator: string, referralCode?: string) => Promise<boolean>;
  purchaseContent: (contentId: string, contentType: string, price: number, paymentMethod: string, referralCode?: string) => Promise<{ success: boolean; error?: string }>;
  getPurchaseHistory: () => PurchasedWorkout[];
  refreshPurchaseHistory: () => Promise<void>;
  addToLibrary: (contentId: string, contentType: string, accessType?: string) => Promise<boolean>;
}

const WorkoutPurchaseContext = createContext<WorkoutPurchaseContextType | undefined>(undefined);

interface WorkoutPurchaseProviderProps {
  children: ReactNode;
}

export function WorkoutPurchaseProvider({ children }: WorkoutPurchaseProviderProps) {
  const [purchasedWorkouts, setPurchasedWorkouts] = useState<PurchasedWorkout[]>([]);
  const [purchaseHistory, setPurchaseHistory] = useState<PurchaseRecord[]>([]);

  // Load purchase history on mount
  useEffect(() => {
    refreshPurchaseHistory();
  }, []);

  const isPurchased = (contentId: string, contentType: string = 'workout'): boolean => {
    return purchaseHistory.some(purchase =>
      purchase.contentId === contentId &&
      purchase.contentType === contentType &&
      purchase.status === 'completed'
    );
  };

  const hasAccess = async (contentId: string, contentType: string = 'workout'): Promise<ContentAccess> => {
    try {
      return await libraryService.checkContentAccess(contentId, contentType);
    } catch (error) {
      console.error('Error checking content access:', error);
      return { hasAccess: false, accessType: 'none', purchaseRequired: true };
    }
  };

  const refreshPurchaseHistory = async (): Promise<void> => {
    try {
      const history = await libraryService.getPurchaseHistory();
      setPurchaseHistory(history);

      // Update legacy purchasedWorkouts for backward compatibility
      const workoutPurchases = history
        .filter(p => p.contentType === 'workout' && p.status === 'completed')
        .map(p => ({
          workoutId: p.contentId,
          purchaseDate: p.purchasedAt,
          price: p.price,
          creator: p.metadata?.creatorName || 'Unknown'
        }));
      setPurchasedWorkouts(workoutPurchases);
    } catch (error) {
      console.error('Error refreshing purchase history:', error);
    }
  };

  const purchaseWorkout = async (workoutId: string, price: number, creator: string, referralCode?: string): Promise<boolean> => {
    try {
      const result = await libraryService.purchaseContent(
        workoutId,
        'workout',
        price,
        'stripe', // Default payment method
        referralCode
      );

      if (result.success) {
        await refreshPurchaseHistory();
        return true;
      } else {
        console.error('Purchase failed:', result.error);
        return false;
      }
    } catch (error) {
      console.error('Purchase failed:', error);
      return false;
    }
  };

  const purchaseContent = async (
    contentId: string,
    contentType: string,
    price: number,
    paymentMethod: string,
    referralCode?: string
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const result = await libraryService.purchaseContent(
        contentId,
        contentType,
        price,
        paymentMethod,
        referralCode
      );

      if (result.success) {
        await refreshPurchaseHistory();
      }

      return result;
    } catch (error) {
      console.error('Purchase failed:', error);
      return { success: false, error: 'Purchase failed' };
    }
  };

  const addToLibrary = async (contentId: string, contentType: string, accessType: string = 'free'): Promise<boolean> => {
    try {
      const result = await libraryService.addToLibrary(
        'current-user', // In real app, get from auth context
        contentId,
        contentType,
        accessType as any
      );

      if (result) {
        await refreshPurchaseHistory();
      }

      return result;
    } catch (error) {
      console.error('Error adding to library:', error);
      return false;
    }
  };

  const getPurchaseHistory = (): PurchasedWorkout[] => {
    return purchasedWorkouts.sort((a, b) => b.purchaseDate.getTime() - a.purchaseDate.getTime());
  };

  const value: WorkoutPurchaseContextType = {
    purchasedWorkouts,
    purchaseHistory,
    isPurchased,
    hasAccess,
    purchaseWorkout,
    purchaseContent,
    getPurchaseHistory,
    refreshPurchaseHistory,
    addToLibrary
  };

  return (
    <WorkoutPurchaseContext.Provider value={value}>
      {children}
    </WorkoutPurchaseContext.Provider>
  );
}

export function useWorkoutPurchase(): WorkoutPurchaseContextType {
  const context = useContext(WorkoutPurchaseContext);
  if (context === undefined) {
    console.warn('useWorkoutPurchase used outside of WorkoutPurchaseProvider, returning default values');
    // Return default values instead of throwing an error
    return {
      purchasedWorkouts: [],
      purchaseHistory: [],
      isPurchased: () => false,
      hasAccess: async () => ({ hasAccess: false, accessType: 'none', purchaseRequired: true }),
      purchaseWorkout: async () => false,
      purchaseContent: async () => ({ success: false, error: 'Not authenticated' }),
      getPurchaseHistory: () => [],
      refreshPurchaseHistory: async () => {},
      addToLibrary: async () => false,
    };
  }
  return context;
}