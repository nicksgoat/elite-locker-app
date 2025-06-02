import React, { createContext, ReactNode, useContext, useState } from 'react';

interface PurchasedWorkout {
  workoutId: string;
  purchaseDate: Date;
  price: number;
  creator: string;
  type: 'workout' | 'program' | 'club';
  title?: string;
  addedToLibrary?: boolean;
}

interface WorkoutPurchaseContextType {
  purchasedWorkouts: PurchasedWorkout[];
  isPurchased: (workoutId: string) => boolean;
  purchaseWorkout: (workoutId: string, price: number, creator: string, type: 'workout' | 'program' | 'club', title?: string) => Promise<boolean>;
  purchaseProgram: (programId: string, price: number, creator: string, title?: string) => Promise<boolean>;
  purchaseClub: (clubId: string, price: number, creator: string, title?: string) => Promise<boolean>;
  getPurchaseHistory: () => PurchasedWorkout[];
  addToLibrary: (purchaseId: string) => Promise<boolean>;
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

  const purchaseWorkout = async (
    workoutId: string,
    price: number,
    creator: string,
    type: 'workout' | 'program' | 'club' = 'workout',
    title?: string
  ): Promise<boolean> => {
    try {
      // In production, this would integrate with Stripe or other payment processor
      // For now, simulate a successful purchase

      const newPurchase: PurchasedWorkout = {
        workoutId,
        purchaseDate: new Date(),
        price,
        creator,
        type,
        title,
        addedToLibrary: false
      };

      setPurchasedWorkouts(prev => [...prev, newPurchase]);

      // Automatically add to user's library
      await addToLibrary(workoutId);

      // Here you would also:
      // 1. Process payment via Stripe
      // 2. Update backend with purchase record
      // 3. Handle affiliate payouts
      // 4. Send confirmation email
      // 5. Add to user's personal library

      return true;
    } catch (error) {
      console.error('Purchase failed:', error);
      return false;
    }
  };

  const purchaseProgram = async (
    programId: string,
    price: number,
    creator: string,
    title?: string
  ): Promise<boolean> => {
    return purchaseWorkout(programId, price, creator, 'program', title);
  };

  const purchaseClub = async (
    clubId: string,
    price: number,
    creator: string,
    title?: string
  ): Promise<boolean> => {
    return purchaseWorkout(clubId, price, creator, 'club', title);
  };

  const addToLibrary = async (purchaseId: string): Promise<boolean> => {
    try {
      const purchase = purchasedWorkouts.find(p => p.workoutId === purchaseId);
      if (!purchase) return false;

      // Add to user's library based on type
      switch (purchase.type) {
        case 'workout':
          // Add workout to user's personal workout collection
          // This would typically involve copying the workout template to user's library
          console.log(`Adding workout ${purchaseId} to user library`);
          break;
        case 'program':
          // Subscribe user to the program
          console.log(`Adding program ${purchaseId} to user library`);
          break;
        case 'club':
          // Subscribe user to the club
          console.log(`Adding club ${purchaseId} to user library`);
          break;
      }

      // Update purchase record
      setPurchasedWorkouts(prev =>
        prev.map(p =>
          p.workoutId === purchaseId
            ? { ...p, addedToLibrary: true }
            : p
        )
      );

      return true;
    } catch (error) {
      console.error('Failed to add to library:', error);
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
    purchaseProgram,
    purchaseClub,
    getPurchaseHistory,
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
      isPurchased: () => false,
      purchaseWorkout: async () => false,
      purchaseProgram: async () => false,
      purchaseClub: async () => false,
      getPurchaseHistory: () => [],
      addToLibrary: async () => false,
    };
  }
  return context;
}