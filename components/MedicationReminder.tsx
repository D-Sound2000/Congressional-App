import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getUserProfile, UserProfile } from '@/lib/userProfileService';

interface MedicationReminderProps {
  isDark?: boolean;
}

const MEDICATION_INFO = {
  'Metformin': {
    icon: '💊',
    description: 'Helps lower blood sugar by reducing glucose production in the liver',
    commonSideEffects: ['Nausea', 'Diarrhea', 'Stomach upset'],
    timing: 'Take with meals to reduce stomach upset',
    color: '#4caf50'
  },
  'Insulin': {
    icon: '💉',
    description: 'Essential hormone for blood sugar regulation',
    commonSideEffects: ['Low blood sugar', 'Weight gain', 'Injection site reactions'],
    timing: 'Timing depends on type - follow doctor\'s instructions',
    color: '#2196f3'
  },
  'Glipizide': {
    icon: '💊',
    description: 'Stimulates pancreas to release more insulin',
    commonSideEffects: ['Low blood sugar', 'Nausea', 'Skin rash'],
    timing: 'Take 30 minutes before meals',
    color: '#ff9800'
  },
  'Sitagliptin': {
    icon: '💊',
    description: 'Helps control blood sugar by increasing insulin release',
    commonSideEffects: ['Upper respiratory infection', 'Headache', 'Stomach pain'],
    timing: 'Take once daily with or without food',
    color: '#9c27b0'
  },
  'Canagliflozin': {
    icon: '💊',
    description: 'Helps kidneys remove glucose from blood',
    commonSideEffects: ['Urinary tract infections', 'Increased urination', 'Yeast infections'],
    timing: 'Take before first meal of the day',
    color: '#f44336'
  }
};

export default function MedicationReminder({ isDark = false }: MedicationReminderProps) {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    try {
      const profile = await getUserProfile();
      setUserProfile(profile);
    } catch (error) {
      console.error('Error loading user profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMedicationTaken = (medication: string) => {
    Alert.alert(
      'Medication Logged',
      `Great! You've taken your ${medication}. Keep up the good work!`,
      [{ text: 'OK' }]
    );
  };

  const getMedicationInfo = (medication: string) => {
    return MEDICATION_INFO[medication as keyof typeof MEDICATION_INFO] || {
      icon: '💊',
      description: 'Diabetes medication',
      commonSideEffects: ['Consult your doctor'],
      timing: 'Follow doctor\'s instructions',
      color: '#666'
    };
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: isDark ? '#232b3a' : '#fff' }]}>
        <Text style={[styles.loadingText, { color: isDark ? '#fff' : '#333' }]}>
          Loading medication information...
        </Text>
      </View>
    );
  }

  if (!userProfile?.medications || userProfile.medications.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor: isDark ? '#232b3a' : '#fff' }]}>
        <Text style={[styles.emptyTitle, { color: isDark ? '#fff' : '#333' }]}>
          No Medications Set Up
        </Text>
        <Text style={[styles.emptyText, { color: isDark ? '#ccc' : '#666' }]}>
          Complete your profile setup to get medication reminders
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#232b3a' : '#fff' }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: isDark ? '#fff' : '#333' }]}>
          Medication Reminders
        </Text>
        <Text style={[styles.subtitle, { color: isDark ? '#ccc' : '#666' }]}>
          Your diabetes medications
        </Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {userProfile.medications.map((medication, index) => {
          const medInfo = getMedicationInfo(medication);
          return (
            <View key={index} style={[styles.medicationCard, { backgroundColor: isDark ? '#2d3a4d' : '#f8f9fa' }]}>
              <View style={styles.medicationHeader}>
                <View style={styles.medicationIcon}>
                  <Text style={styles.iconText}>{medInfo.icon}</Text>
                </View>
                <View style={styles.medicationInfo}>
                  <Text style={[styles.medicationName, { color: isDark ? '#fff' : '#333' }]}>
                    {medication}
                  </Text>
                  <Text style={[styles.medicationDescription, { color: isDark ? '#ccc' : '#666' }]}>
                    {medInfo.description}
                  </Text>
                </View>
                <TouchableOpacity
                  style={[styles.takenButton, { backgroundColor: medInfo.color }]}
                  onPress={() => handleMedicationTaken(medication)}
                >
                  <Ionicons name="checkmark" size={20} color="#fff" />
                </TouchableOpacity>
              </View>

              <View style={styles.medicationDetails}>
                <View style={styles.detailRow}>
                  <Text style={[styles.detailLabel, { color: isDark ? '#fff' : '#333' }]}>
                    Timing:
                  </Text>
                  <Text style={[styles.detailValue, { color: isDark ? '#ccc' : '#666' }]}>
                    {medInfo.timing}
                  </Text>
                </View>
                
                <View style={styles.detailRow}>
                  <Text style={[styles.detailLabel, { color: isDark ? '#fff' : '#333' }]}>
                    Common Side Effects:
                  </Text>
                  <Text style={[styles.detailValue, { color: isDark ? '#ccc' : '#666' }]}>
                    {medInfo.commonSideEffects.join(', ')}
                  </Text>
                </View>
              </View>
            </View>
          );
        })}

        {/* Emergency Contact Info */}
        {userProfile.emergency_contact && (
          <View style={[styles.emergencyCard, { backgroundColor: isDark ? '#2d3a4d' : '#f8f9fa' }]}>
            <Text style={[styles.emergencyTitle, { color: isDark ? '#fff' : '#333' }]}>
              Emergency Contact
            </Text>
            <Text style={[styles.emergencyText, { color: isDark ? '#ccc' : '#666' }]}>
              {userProfile.emergency_contact}
            </Text>
          </View>
        )}

        {/* Doctor Info */}
        {userProfile.doctor_info && (
          <View style={[styles.doctorCard, { backgroundColor: isDark ? '#2d3a4d' : '#f8f9fa' }]}>
            <Text style={[styles.doctorTitle, { color: isDark ? '#fff' : '#333' }]}>
              Your Doctor
            </Text>
            <Text style={[styles.doctorText, { color: isDark ? '#ccc' : '#666' }]}>
              {userProfile.doctor_info}
            </Text>
          </View>
        )}

        {/* Glucose Targets */}
        {userProfile.glucose_targets && (
          <View style={[styles.targetsCard, { backgroundColor: isDark ? '#2d3a4d' : '#f8f9fa' }]}>
            <Text style={[styles.targetsTitle, { color: isDark ? '#fff' : '#333' }]}>
              Your Glucose Targets
            </Text>
            <View style={styles.targetsGrid}>
              <View style={styles.targetItem}>
                <Text style={[styles.targetLabel, { color: isDark ? '#fff' : '#333' }]}>
                  Fasting
                </Text>
                <Text style={[styles.targetValue, { color: '#4caf50' }]}>
                  {userProfile.glucose_targets.fasting}
                </Text>
              </View>
              <View style={styles.targetItem}>
                <Text style={[styles.targetLabel, { color: isDark ? '#fff' : '#333' }]}>
                  Before Meals
                </Text>
                <Text style={[styles.targetValue, { color: '#4caf50' }]}>
                  {userProfile.glucose_targets.beforeMeal}
                </Text>
              </View>
              <View style={styles.targetItem}>
                <Text style={[styles.targetLabel, { color: isDark ? '#fff' : '#333' }]}>
                  After Meals
                </Text>
                <Text style={[styles.targetValue, { color: '#4caf50' }]}>
                  {userProfile.glucose_targets.afterMeal}
                </Text>
              </View>
              <View style={styles.targetItem}>
                <Text style={[styles.targetLabel, { color: isDark ? '#fff' : '#333' }]}>
                  Bedtime
                </Text>
                <Text style={[styles.targetValue, { color: '#4caf50' }]}>
                  {userProfile.glucose_targets.bedtime}
                </Text>
              </View>
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    padding: 20,
    margin: 16,
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
  },
  content: {
    flex: 1,
  },
  medicationCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  medicationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  medicationIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#e3f2fd',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  iconText: {
    fontSize: 20,
  },
  medicationInfo: {
    flex: 1,
  },
  medicationName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  medicationDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  takenButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  medicationDetails: {
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: '600',
    width: 120,
  },
  detailValue: {
    fontSize: 14,
    flex: 1,
    lineHeight: 20,
  },
  emergencyCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#f44336',
  },
  emergencyTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  emergencyText: {
    fontSize: 14,
    lineHeight: 20,
  },
  doctorCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#2196f3',
  },
  doctorTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  doctorText: {
    fontSize: 14,
    lineHeight: 20,
  },
  targetsCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#4caf50',
  },
  targetsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  targetsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  targetItem: {
    flex: 1,
    minWidth: '45%',
    alignItems: 'center',
    padding: 12,
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    borderRadius: 8,
  },
  targetLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
  },
  targetValue: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  loadingText: {
    textAlign: 'center',
    fontSize: 16,
    padding: 20,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
});
