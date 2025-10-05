import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Dimensions,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface DiabetesOnboardingProps {
  onComplete: (data: OnboardingData) => void;
  isDark?: boolean;
}

interface OnboardingData {
  username: string;
  diabetesType: string;
  insulinDependent: boolean;
  medications: string[];
  emergencyContact: string;
  doctorInfo: string;
}

const { width } = Dimensions.get('window');

const DIABETES_TYPES = [
  {
    id: 'type1',
    title: 'Type 1 Diabetes',
    description: 'Your body doesn\'t produce insulin. You need insulin injections.',
    icon: '💉',
    characteristics: ['Insulin dependent', 'Usually diagnosed young', 'Autoimmune condition'],
    management: ['Regular insulin', 'Carb counting', 'Frequent monitoring']
  },
  {
    id: 'type2',
    title: 'Type 2 Diabetes',
    description: 'Your body doesn\'t use insulin properly. Managed with diet, exercise, and medication.',
    icon: '🍎',
    characteristics: ['Insulin resistant', 'Often lifestyle related', 'Can be managed with diet'],
    management: ['Healthy eating', 'Regular exercise', 'Medication as needed']
  },
  {
    id: 'gestational',
    title: 'Gestational Diabetes',
    description: 'Develops during pregnancy. Usually resolves after birth.',
    icon: '🤱',
    characteristics: ['Pregnancy related', 'Temporary condition', 'Requires monitoring'],
    management: ['Diet control', 'Exercise', 'Regular monitoring']
  },
  {
    id: 'prediabetes',
    title: 'Prediabetes',
    description: 'Blood sugar higher than normal but not diabetic yet.',
    icon: '⚠️',
    characteristics: ['Early warning sign', 'Reversible with lifestyle', 'High risk for diabetes'],
    management: ['Lifestyle changes', 'Weight management', 'Regular checkups']
  }
];

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

export default function DiabetesOnboarding({ onComplete, isDark = false }: DiabetesOnboardingProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [username, setUsername] = useState('');
  const [diabetesType, setDiabetesType] = useState<string | null>(null);
  const [insulinDependent, setInsulinDependent] = useState(false);
  const [medications, setMedications] = useState<string[]>([]);
  const [emergencyContact, setEmergencyContact] = useState('');
  const [doctorInfo, setDoctorInfo] = useState('');

  const steps = [
    { title: 'Welcome to DiaBite', subtitle: 'Your diabetes management companion' },
    { title: 'What\'s your name?', subtitle: 'We\'ll use this to personalize your experience' },
    { title: 'What type of diabetes do you have?', subtitle: 'This helps us personalize your experience' },
    { title: 'Are you insulin dependent?', subtitle: 'This affects your meal planning' },
    { title: 'What medications do you take?', subtitle: 'We\'ll remind you about them' },
    { title: 'Emergency information', subtitle: 'Important contacts for emergencies' },
    { title: 'Your glucose targets', subtitle: 'Personalized based on your diabetes type' }
  ];

  const handleNext = () => {
    // Validation for each step
    if (currentStep === 1 && !username.trim()) {
      Alert.alert('Please enter your name', 'We need your name to personalize your experience.');
      return;
    }
    
    if (currentStep === 2 && !diabetesType) {
      Alert.alert('Please select your diabetes type', 'This helps us personalize your experience.');
      return;
    }
    
    if (currentStep === 5 && (!emergencyContact.trim() || !doctorInfo.trim())) {
      Alert.alert('Please fill in contact information', 'Emergency contacts are important for your safety.');
      return;
    }

    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Complete onboarding with data
      const onboardingData: OnboardingData = {
        username: username.trim(),
        diabetesType: diabetesType || 'type2',
        insulinDependent,
        medications,
        emergencyContact,
        doctorInfo,
      };
      onComplete(onboardingData);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <View style={styles.stepContent}>
            <View style={styles.welcomeIcon}>
              <Text style={styles.welcomeEmoji}>🩺</Text>
            </View>
            <Text style={[styles.stepTitle, { color: isDark ? '#fff' : '#333' }]}>
              Welcome to DiaBite
            </Text>
            <Text style={[styles.stepDescription, { color: isDark ? '#ccc' : '#666' }]}>
              We're here to help you manage your diabetes with personalized meal planning, 
              glucose tracking, and smart recommendations tailored to your needs.
            </Text>
            <View style={styles.featureList}>
              <View style={styles.featureItem}>
                <Text style={styles.featureIcon}>📊</Text>
                <Text style={[styles.featureText, { color: isDark ? '#fff' : '#333' }]}>
                  Track your glucose levels
                </Text>
              </View>
              <View style={styles.featureItem}>
                <Text style={styles.featureIcon}>🍽️</Text>
                <Text style={[styles.featureText, { color: isDark ? '#fff' : '#333' }]}>
                  Get personalized meal plans
                </Text>
              </View>
              <View style={styles.featureItem}>
                <Text style={styles.featureIcon}>💊</Text>
                <Text style={[styles.featureText, { color: isDark ? '#fff' : '#333' }]}>
                  Medication reminders
                </Text>
              </View>
              <View style={styles.featureItem}>
                <Text style={styles.featureIcon}>🤖</Text>
                <Text style={[styles.featureText, { color: isDark ? '#fff' : '#333' }]}>
                  AI-powered insights
                </Text>
              </View>
            </View>
          </View>
        );

      case 1:
        return (
          <View style={styles.stepContent}>
            <Text style={[styles.stepTitle, { color: isDark ? '#fff' : '#333' }]}>
              What's your name?
            </Text>
            <Text style={[styles.stepDescription, { color: isDark ? '#ccc' : '#666' }]}>
              We'll use this to personalize your experience.
            </Text>
            <View style={styles.inputGroup}>
              <TextInput
                style={[
                  styles.textInput,
                  { 
                    backgroundColor: isDark ? '#2d3a4d' : '#f8f9fa',
                    color: isDark ? '#fff' : '#333',
                    borderColor: isDark ? '#444' : '#ddd'
                  }
                ]}
                value={username}
                onChangeText={setUsername}
                placeholder="Enter your name"
                placeholderTextColor={isDark ? '#ccc' : '#666'}
                autoFocus
              />
            </View>
          </View>
        );

      case 2:
        return (
          <View style={styles.stepContent}>
            <Text style={[styles.stepTitle, { color: isDark ? '#fff' : '#333' }]}>
              What type of diabetes do you have?
            </Text>
            <Text style={[styles.stepDescription, { color: isDark ? '#ccc' : '#666' }]}>
              This helps us personalize your meal plans and glucose targets.
            </Text>
            <View style={styles.optionsList}>
              {DIABETES_TYPES.map((type) => (
                <TouchableOpacity
                  key={type.id}
                  style={[
                    styles.optionCard,
                    diabetesType === type.id && styles.optionCardSelected,
                    { backgroundColor: isDark ? '#2d3a4d' : '#f8f9fa' }
                  ]}
                  onPress={() => setDiabetesType(type.id)}
                >
                  <Text style={styles.optionIcon}>{type.icon}</Text>
                  <Text style={[styles.optionTitle, { color: isDark ? '#fff' : '#333' }]}>
                    {type.title}
                  </Text>
                  <Text style={[styles.optionDescription, { color: isDark ? '#ccc' : '#666' }]}>
                    {type.description}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        );

      case 3:
        return (
          <View style={styles.stepContent}>
            <Text style={[styles.stepTitle, { color: isDark ? '#fff' : '#333' }]}>
              Are you insulin dependent?
            </Text>
            <Text style={[styles.stepDescription, { color: isDark ? '#ccc' : '#666' }]}>
              This affects how we calculate your meal timing and carb recommendations.
            </Text>
            <View style={styles.yesNoOptions}>
              <TouchableOpacity
                style={[
                  styles.yesNoCard,
                  insulinDependent && styles.yesNoCardSelected,
                  { backgroundColor: isDark ? '#2d3a4d' : '#f8f9fa' }
                ]}
                onPress={() => setInsulinDependent(true)}
              >
                <Text style={styles.yesNoIcon}>💉</Text>
                <Text style={[styles.yesNoText, { color: isDark ? '#fff' : '#333' }]}>
                  Yes, I take insulin
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.yesNoCard,
                  !insulinDependent && styles.yesNoCardSelected,
                  { backgroundColor: isDark ? '#2d3a4d' : '#f8f9fa' }
                ]}
                onPress={() => setInsulinDependent(false)}
              >
                <Text style={styles.yesNoIcon}>💊</Text>
                <Text style={[styles.yesNoText, { color: isDark ? '#fff' : '#333' }]}>
                  No, I manage with diet/medication
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        );

      case 4:
        return (
          <View style={styles.stepContent}>
            <Text style={[styles.stepTitle, { color: isDark ? '#fff' : '#333' }]}>
              What medications do you take?
            </Text>
            <Text style={[styles.stepDescription, { color: isDark ? '#ccc' : '#666' }]}>
              We'll help you track and remind you about your medications.
            </Text>
            <View style={styles.medicationGrid}>
              {['Metformin', 'Insulin', 'Glipizide', 'Sitagliptin', 'Canagliflozin', 'Other'].map((med) => (
                <TouchableOpacity
                  key={med}
                  style={[
                    styles.medicationCard,
                    medications.includes(med) && styles.medicationCardSelected,
                    { backgroundColor: isDark ? '#2d3a4d' : '#f8f9fa' }
                  ]}
                  onPress={() => {
                    if (medications.includes(med)) {
                      setMedications(medications.filter(m => m !== med));
                    } else {
                      setMedications([...medications, med]);
                    }
                  }}
                >
                  <Text style={[styles.medicationText, { color: isDark ? '#fff' : '#333' }]}>
                    {med}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        );

      case 5:
        return (
          <View style={styles.stepContent}>
            <Text style={[styles.stepTitle, { color: isDark ? '#fff' : '#333' }]}>
              Emergency information
            </Text>
            <Text style={[styles.stepDescription, { color: isDark ? '#ccc' : '#666' }]}>
              In case of emergency, we'll have your important contacts ready.
            </Text>
            <View style={styles.emergencyForm}>
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: isDark ? '#fff' : '#333' }]}>
                  Emergency Contact
                </Text>
                <TextInput
                  style={[
                    styles.textInput,
                    { 
                      backgroundColor: isDark ? '#2d3a4d' : '#f8f9fa',
                      color: isDark ? '#fff' : '#333',
                      borderColor: isDark ? '#444' : '#ddd'
                    }
                  ]}
                  value={emergencyContact}
                  onChangeText={setEmergencyContact}
                  placeholder="Name and phone number"
                  placeholderTextColor={isDark ? '#ccc' : '#666'}
                />
              </View>
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: isDark ? '#fff' : '#333' }]}>
                  Doctor Information
                </Text>
                <TextInput
                  style={[
                    styles.textInput,
                    { 
                      backgroundColor: isDark ? '#2d3a4d' : '#f8f9fa',
                      color: isDark ? '#fff' : '#333',
                      borderColor: isDark ? '#444' : '#ddd'
                    }
                  ]}
                  value={doctorInfo}
                  onChangeText={setDoctorInfo}
                  placeholder="Doctor name and contact"
                  placeholderTextColor={isDark ? '#ccc' : '#666'}
                />
              </View>
            </View>
          </View>
        );

      case 6:
        const targets = diabetesType ? GLUCOSE_TARGETS[diabetesType as keyof typeof GLUCOSE_TARGETS] : null;
        return (
          <View style={styles.stepContent}>
            <Text style={[styles.stepTitle, { color: isDark ? '#fff' : '#333' }]}>
              Your glucose targets
            </Text>
            <Text style={[styles.stepDescription, { color: isDark ? '#ccc' : '#666' }]}>
              Based on your diabetes type, here are your recommended glucose targets.
            </Text>
            {targets && (
              <View style={styles.targetsContainer}>
                <View style={[styles.targetCard, { backgroundColor: isDark ? '#2d3a4d' : '#f8f9fa' }]}>
                  <Text style={styles.targetIcon}>🌅</Text>
                  <Text style={[styles.targetLabel, { color: isDark ? '#fff' : '#333' }]}>
                    Fasting
                  </Text>
                  <Text style={[styles.targetValue, { color: '#4caf50' }]}>
                    {targets.fasting}
                  </Text>
                </View>
                <View style={[styles.targetCard, { backgroundColor: isDark ? '#2d3a4d' : '#f8f9fa' }]}>
                  <Text style={styles.targetIcon}>🍽️</Text>
                  <Text style={[styles.targetLabel, { color: isDark ? '#fff' : '#333' }]}>
                    Before Meals
                  </Text>
                  <Text style={[styles.targetValue, { color: '#4caf50' }]}>
                    {targets.beforeMeal}
                  </Text>
                </View>
                <View style={[styles.targetCard, { backgroundColor: isDark ? '#2d3a4d' : '#f8f9fa' }]}>
                  <Text style={styles.targetIcon}>⏰</Text>
                  <Text style={[styles.targetLabel, { color: isDark ? '#fff' : '#333' }]}>
                    After Meals
                  </Text>
                  <Text style={[styles.targetValue, { color: '#4caf50' }]}>
                    {targets.afterMeal}
                  </Text>
                </View>
                <View style={[styles.targetCard, { backgroundColor: isDark ? '#2d3a4d' : '#f8f9fa' }]}>
                  <Text style={styles.targetIcon}>🌙</Text>
                  <Text style={[styles.targetLabel, { color: isDark ? '#fff' : '#333' }]}>
                    Bedtime
                  </Text>
                  <Text style={[styles.targetValue, { color: '#4caf50' }]}>
                    {targets.bedtime}
                  </Text>
                </View>
              </View>
            )}
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#181a20' : '#f6f8fa' }]}>
      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View 
            style={[
              styles.progressFill, 
              { width: `${((currentStep + 1) / steps.length) * 100}%` }
            ]} 
          />
        </View>
        <Text style={[styles.progressText, { color: isDark ? '#ccc' : '#666' }]}>
          {currentStep + 1} of {steps.length}
        </Text>
      </View>

      {/* Step Header */}
      <View style={styles.header}>
        <Text style={[styles.stepTitle, { color: isDark ? '#fff' : '#333' }]}>
          {steps[currentStep].title}
        </Text>
        <Text style={[styles.stepSubtitle, { color: isDark ? '#ccc' : '#666' }]}>
          {steps[currentStep].subtitle}
        </Text>
      </View>

      {/* Step Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {renderStep()}
      </ScrollView>

      {/* Navigation */}
      <View style={styles.navigation}>
        {currentStep > 0 && (
          <TouchableOpacity
            style={[styles.navButton, styles.backButton]}
            onPress={handlePrevious}
          >
            <Ionicons name="chevron-back" size={20} color="#007AFF" />
            <Text style={styles.backButtonText}>Back</Text>
          </TouchableOpacity>
        )}
        
        <TouchableOpacity
          style={[
            styles.navButton, 
            styles.nextButton,
            { backgroundColor: '#007AFF' }
          ]}
          onPress={handleNext}
        >
          <Text style={styles.nextButtonText}>
            {currentStep === steps.length - 1 ? 'Get Started' : 'Next'}
          </Text>
          <Ionicons name="chevron-forward" size={20} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
  },
  progressBar: {
    flex: 1,
    height: 4,
    backgroundColor: '#e0e0e0',
    borderRadius: 2,
    marginRight: 12,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#007AFF',
    borderRadius: 2,
  },
  progressText: {
    fontSize: 12,
    fontWeight: '500',
  },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  stepSubtitle: {
    fontSize: 16,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  stepContent: {
    flex: 1,
  },
  welcomeIcon: {
    alignItems: 'center',
    marginBottom: 30,
  },
  welcomeEmoji: {
    fontSize: 80,
  },
  stepDescription: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 30,
    textAlign: 'center',
  },
  featureList: {
    gap: 16,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
  },
  featureIcon: {
    fontSize: 24,
    marginRight: 16,
  },
  featureText: {
    fontSize: 16,
    fontWeight: '500',
  },
  optionsList: {
    gap: 16,
  },
  optionCard: {
    padding: 20,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  optionCardSelected: {
    borderColor: '#007AFF',
    backgroundColor: '#e3f2fd',
  },
  optionIcon: {
    fontSize: 32,
    marginBottom: 12,
  },
  optionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  optionDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  yesNoOptions: {
    gap: 16,
  },
  yesNoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  yesNoCardSelected: {
    borderColor: '#007AFF',
    backgroundColor: '#e3f2fd',
  },
  yesNoIcon: {
    fontSize: 24,
    marginRight: 16,
  },
  yesNoText: {
    fontSize: 16,
    fontWeight: '500',
  },
  medicationGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  medicationCard: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  medicationCardSelected: {
    borderColor: '#007AFF',
    backgroundColor: '#e3f2fd',
  },
  medicationText: {
    fontSize: 14,
    fontWeight: '500',
  },
  emergencyForm: {
    gap: 24,
  },
  inputGroup: {
    gap: 8,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  inputHint: {
    fontSize: 14,
  },
  textInput: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginTop: 8,
  },
  targetsContainer: {
    gap: 16,
  },
  targetCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
  },
  targetIcon: {
    fontSize: 24,
    marginRight: 16,
  },
  targetLabel: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
  },
  targetValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  navigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 20,
    paddingBottom: 40,
  },
  navButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
  },
  backButton: {
    backgroundColor: 'transparent',
  },
  backButtonText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 4,
  },
  nextButton: {
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  nextButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginRight: 4,
  },
});
