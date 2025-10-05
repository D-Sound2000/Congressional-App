import { Stack } from 'expo-router';
import { useState, useEffect } from 'react';
import { Alert } from 'react-native';
import { supabase } from '../lib/supabase';
import Auth from '../components/Auth';
import DiabetesOnboarding from '../components/DiabetesOnboarding';
import { Session } from '@supabase/supabase-js';
import { shouldShowOnboarding, saveUserProfile } from '../lib/userProfileService';

export default function RootLayout() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
  }, []);

  useEffect(() => {
    if (session && !loading) {
      checkOnboardingStatus();
    }
  }, [session, loading]);

  const checkOnboardingStatus = async () => {
    try {
      const needsOnboarding = await shouldShowOnboarding();
      console.log('Should show onboarding:', needsOnboarding);
      setShowOnboarding(needsOnboarding);
    } catch (error) {
      console.error('Error checking onboarding status:', error);
      setShowOnboarding(false);
    }
  };

  const handleOnboardingComplete = async (onboardingData: any) => {
    try {
      console.log('Onboarding completion started with data:', onboardingData);
      await saveUserProfile(onboardingData);
      console.log('User profile saved successfully');
      setShowOnboarding(false);
      console.log('Onboarding state set to false');
    } catch (error) {
      console.error('Error saving onboarding data:', error);
      Alert.alert('Error', 'Failed to save your profile. Please try again.');
    }
  };

  if (loading) {
    return null; // or a loading screen
  }

  // If no session, show auth screen
  if (!session) {
    return <Auth />;
  }

  // If needs onboarding, show onboarding
  if (showOnboarding) {
    return <DiabetesOnboarding onComplete={handleOnboardingComplete} />;
  }

  // If authenticated and onboarded, show the main app with tabs
  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="+not-found" />
    </Stack>
  );
}
