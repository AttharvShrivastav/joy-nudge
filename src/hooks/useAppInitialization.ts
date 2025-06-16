
import { useState, useEffect } from "react";

export const useAppInitialization = (user: any, tutorialLoading: boolean, gardenData: any) => {
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [showMoodSelector, setShowMoodSelector] = useState(false);

  useEffect(() => {
    const initializeApp = async () => {
      await new Promise(resolve => setTimeout(resolve, 2000));
      setIsInitialLoading(false);
      
      const lastMoodDate = localStorage.getItem('lastMoodDate');
      const today = new Date().toDateString();
      
      if (lastMoodDate !== today && !gardenData.todaysMood) {
        setTimeout(() => setShowMoodSelector(true), 500);
      }
    };

    if (user && !tutorialLoading) {
      initializeApp();
    }
  }, [user, tutorialLoading, gardenData.todaysMood]);

  return {
    isInitialLoading,
    showMoodSelector,
    setShowMoodSelector
  };
};
