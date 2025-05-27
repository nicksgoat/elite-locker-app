import React, { createContext, ReactNode, useContext, useState } from 'react';

interface PurchasedWorkout {
  workoutId: string;
  purchaseDate: Date;
  price: number;
  creator: string;
}

interface WorkoutPurchaseContextType {
  purchasedWorkouts: PurchasedWorkout[];
  isPurchased: (workoutId: string) => boolean;
  purchaseWorkout: (workoutId: string, price: number, creator: string) => Promise<boolean>;
  getPurchaseHistory: () => PurchasedWorkout[];
}

const WorkoutPurchaseContext = createContext<WorkoutPurchaseContextType | undefined>(undefined);

interface WorkoutPurchaseProviderProps {
  children: ReactNode;
}

export function WorkoutPurchaseProvider({ children }: WorkoutPurchaseProviderProps) {
  const [purchasedWorkouts, setPurchasedWorkouts] = useState<PurchasedWorkout[]>([]);

  const isPurchased = (workoutId: string): boolean => {
    return purchasedWorkouts.some(workout => workout.workoutId === workoutId);
  };

  const purchaseWorkout = async (workoutId: string, price: number, creator: string): Promise<boolean> => {
    try {
      // In production, this would integrate with Stripe or other payment processor
      // For now, simulate a successful purchase

      const newPurchase: PurchasedWorkout = {
        workoutId,
        purchaseDate: new Date(),
        price,
        creator
      };

      setPurchasedWorkouts(prev => [...prev, newPurchase]);

      // Here you would also:
      // 1. Process payment via Stripe
      // 2. Update backend with purchase record
      // 3. Handle affiliate payouts
      // 4. Send confirmation email

      return true;
    } catch (error) {
      console.error('Purchase failed:', error);
      return false;
    }
  };

  const getPurchaseHistory = (): PurchasedWorkout[] => {
    return purchasedWorkouts.sort((a, b) => b.purchaseDate.getTime() - a.purchaseDate.getTime());
  };

  const value: WorkoutPurchaseContextType = {
    purchasedWorkouts,
    isPurchased,
    purchaseWorkout,
    getPurchaseHistory
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
      isPurchased: () => false,
      purchaseWorkout: async () => false,
      getPurchaseHistory: () => [],
    };
  }
  return context;
}