import { supabase } from './supabase';

// User profile interface - had to add a lot of diabetes-specific fields
export interface UserProfile {
  id: string;
  username?: string;
  diabetes_type?: 'type1' | 'type2' | 'gestational' | 'prediabetes';
  insulin_dependent?: boolean;
  medications?: string[];
  emergency_contact?: string;
  doctor_info?: string;
  glucose_targets?: {
    fasting: string;
    beforeMeal: string;
    afterMeal: string;
    bedtime: string;
  };
  created_at?: string;
  updated_at?: string;
}

export interface OnboardingData {
  username: string;
  diabetesType: string;
  insulinDependent: boolean;
  medications: string[];
  emergencyContact: string;
  doctorInfo: string;
}

const GLUCOSE_TARGETS = {
  type1: {
    fasting: '80-130 mg/dL',
    beforeMeal: '80-130 mg/dL',
    afterMeal: 'Less than 180 mg/dL',
    bedtime: '90-150 mg/dL'
  },
  type2: {
    fasting: '80-130 mg/dL',
    beforeMeal: '80-130 mg/dL',
    afterMeal: 'Less than 180 mg/dL',
    bedtime: '90-150 mg/dL'
  },
  gestational: {
    fasting: 'Less than 95 mg/dL',
    beforeMeal: 'Less than 95 mg/dL',
    afterMeal: 'Less than 140 mg/dL',
    bedtime: 'Less than 120 mg/dL'
  },
  prediabetes: {
    fasting: '70-100 mg/dL',
    beforeMeal: '70-100 mg/dL',
    afterMeal: 'Less than 140 mg/dL',
    bedtime: '70-100 mg/dL'
  }
};

export const saveUserProfile = async (onboardingData: OnboardingData): Promise<UserProfile> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const glucoseTargets = GLUCOSE_TARGETS[onboardingData.diabetesType as keyof typeof GLUCOSE_TARGETS] || GLUCOSE_TARGETS.type2;

    // Save basic profile data - only save what we know exists in the database
    const profileData = {
      id: user.id,
      username: onboardingData.username, // Use the username from onboarding
      diabetes_type: onboardingData.diabetesType,
      insulin_dependent: onboardingData.insulinDependent,
      medications: onboardingData.medications,
      emergency_contact: onboardingData.emergencyContact,
      doctor_info: onboardingData.doctorInfo,
      glucose_targets: glucoseTargets,
    };

    console.log('Saving profile data:', profileData);

    const { data, error } = await supabase
      .from('profiles')
      .upsert(profileData)
      .select()
      .single();

    if (error) {
      console.error('Error saving user profile:', error);
      throw error;
    }

    console.log('Profile saved successfully:', data);
    return data;
  } catch (error) {
    console.error('Error in saveUserProfile:', error);
    throw error;
  }
};

export const getUserProfile = async (): Promise<UserProfile | null> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found
      console.error('Error fetching user profile:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error in getUserProfile:', error);
    throw error;
  }
};

export const updateUserProfile = async (updates: Partial<UserProfile>): Promise<UserProfile> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', user.id)
      .select()
      .single();

    if (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error in updateUserProfile:', error);
    throw error;
  }
};

export const getGlucoseTargets = (diabetesType: string) => {
  return GLUCOSE_TARGETS[diabetesType as keyof typeof GLUCOSE_TARGETS] || GLUCOSE_TARGETS.type2;
};

export const shouldShowOnboarding = async (): Promise<boolean> => {
  try {
    const profile = await getUserProfile();
    console.log('Current user profile:', profile);
    
    // Show onboarding if no profile exists OR if username is missing
    if (!profile || !profile.username) {
      console.log('No profile or username found, showing onboarding');
      return true;
    }
    
    console.log('Profile and username exist, skipping onboarding');
    return false;
  } catch (error) {
    console.error('Error checking onboarding status:', error);
    return true; // Show onboarding on error
  }
};
