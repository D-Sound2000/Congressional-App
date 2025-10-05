import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import DiabetesOnboarding from '@/components/DiabetesOnboarding';
import { supabase } from '@/lib/supabase';
import { saveUserPreferences } from '@/lib/mealPlannerService';

export default function OnboardingScreen() {
  const [isDark, setIsDark] = useState(false);

  const handleOnboardingComplete = async (onboardingData: any) => {
    try {
      // Save user preferences to database
      await saveUserPreferences({
        max_daily_carbs: 150,
        max_daily_calories: 2000,
        dietary_restrictions: [],
        disliked_ingredients: [],
        preferred_cuisines: [],
        meal_complexity: 'medium',
      });

      // Navigate to main app
      // This would typically use router.replace('/') or similar
      console.log('Onboarding completed with data:', onboardingData);
    } catch (error) {
      console.error('Error saving onboarding data:', error);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#181a20' : '#f6f8fa' }]}>
      <DiabetesOnboarding
        onComplete={handleOnboardingComplete}
        isDark={isDark}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
