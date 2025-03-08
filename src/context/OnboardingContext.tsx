// src/context/OnboardingContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useSupabase } from './SupabaseContext';
import { getProfile } from '../services/profileService';

interface OnboardingContextType {
  needsOnboarding: boolean;
  completeOnboarding: () => void;
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

export const OnboardingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [needsOnboarding, setNeedsOnboarding] = useState<boolean>(false);
  const { user } = useSupabase();

  useEffect(() => {
    const checkOnboardingStatus = async () => {
      if (!user) {
        setNeedsOnboarding(false);
        return;
      }

      try {
        // Check if the user has completed their profile
        const { data, error } = await getProfile(user.id);
        
        if (error) throw error;
        
        // Check if any required fields are missing
        const incompleteProfile = !data.department || 
                                !data.study_level || 
                                !data.hall_of_residence;
        
        setNeedsOnboarding(incompleteProfile);
      } catch (error) {
        console.error("Error checking onboarding status:", error);
        // Default to showing onboarding if there's an error
        setNeedsOnboarding(true);
      }
    };

    checkOnboardingStatus();
  }, [user]);

  const completeOnboarding = () => {
    setNeedsOnboarding(false);
  };

  return (
    <OnboardingContext.Provider value={{ needsOnboarding, completeOnboarding }}>
      {children}
    </OnboardingContext.Provider>
  );
};

export const useOnboarding = () => {
  const context = useContext(OnboardingContext);
  if (context === undefined) {
    throw new Error('useOnboarding must be used within an OnboardingProvider');
  }
  return context;
};