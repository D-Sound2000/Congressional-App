import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  Switch,
  Image,
  Pressable,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '@/lib/supabase';
import { Session } from '@supabase/supabase-js';
import { getUserProfile, updateUserProfile } from '@/lib/userProfileService';
import { getGlucoseLogs, GlucoseLog } from '@/lib/mealPlannerService';

interface UserProfile {
  id: string;
  username?: string;
  diabetes_type?: 'type1' | 'type2' | 'gestational' | 'prediabetes';
  insulin_dependent?: boolean;
  medications?: string[];
  emergency_contact?: string;
  doctor_info?: string;
  avatar_url?: string;
  created_at?: string;
  updated_at?: string;
}

export default function ProfileScreen() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  // Removed dark mode - using light theme only
  const [showEditModal, setShowEditModal] = useState(false);
  const [recentGlucose, setRecentGlucose] = useState<GlucoseLog[]>([]);
  
  // Profile state
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [editableProfile, setEditableProfile] = useState<Partial<UserProfile>>({});
  
  // Edit form state
  const [editUsername, setEditUsername] = useState('');
  const [editDiabetesType, setEditDiabetesType] = useState('');
  const [editInsulinDependent, setEditInsulinDependent] = useState(false);
  const [editMedications, setEditMedications] = useState('');
  const [editEmergencyContact, setEditEmergencyContact] = useState('');
  const [editDoctorInfo, setEditDoctorInfo] = useState('');

  useEffect(() => {
    getSession();
  }, []);

  useEffect(() => {
    if (session) {
      loadProfile();
      loadRecentGlucose();
    }
  }, [session]);

  const getSession = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    setSession(session);
    setLoading(false);
  };

  const loadProfile = async () => {
    try {
      if (!session?.user) return;
      
      const profileData = await getUserProfile();
      setProfile(profileData);
      setEditableProfile(profileData || {});
      
      // Set edit form values
      if (profileData) {
        setEditUsername(profileData.username || '');
        setEditDiabetesType(profileData.diabetes_type || '');
        setEditInsulinDependent(profileData.insulin_dependent || false);
        setEditMedications(Array.isArray(profileData.medications) ? profileData.medications.join(', ') : '');
        setEditEmergencyContact(profileData.emergency_contact || '');
        setEditDoctorInfo(profileData.doctor_info || '');
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      Alert.alert('Error', 'Failed to load profile data');
    }
  };

  const loadRecentGlucose = async () => {
    try {
      const glucoseLogs = await getGlucoseLogs(5);
      setRecentGlucose(glucoseLogs);
    } catch (error) {
      console.error('Error loading glucose logs:', error);
    }
  };

  const handleSaveProfile = async () => {
    try {
      setSaving(true);
      
      const updatedProfile = {
        username: editUsername,
        diabetes_type: editDiabetesType as 'type1' | 'type2' | 'gestational' | 'prediabetes' | undefined,
        insulin_dependent: editInsulinDependent,
        medications: editMedications.split(',').map(m => m.trim()).filter(m => m),
        emergency_contact: editEmergencyContact,
        doctor_info: editDoctorInfo,
      };

      await updateUserProfile(updatedProfile);
      await loadProfile(); // Reload profile data
      setShowEditModal(false);
      
      Alert.alert('Success', 'Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert('Error', 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleSignOut = async () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            await supabase.auth.signOut();
          },
        },
      ]
    );
  };

  const getGlucoseColor = (value: number) => {
    if (value < 70) return '#f44336'; // Low - Red
    if (value < 140) return '#4caf50'; // Normal - Green
    if (value < 200) return '#ff9800'; // High - Orange
    return '#f44336'; // Very High - Red
  };

  const getDiabetesTypeIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'type 1': return '💙';
      case 'type 2': return '💚';
      case 'gestational': return '💜';
      case 'prediabetes': return '💛';
      default: return '🩺';
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: '#f6f8fa' }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={[styles.loadingText, { color: '#333' }]}>
            Loading profile...
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: '#f6f8fa' }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: '#fff' }]}>
        <View style={styles.headerContent}>
          <Text style={[styles.headerTitle, { color: '#333' }]}>
            Profile
          </Text>
          <View style={styles.headerActions}>
            <TouchableOpacity 
              style={styles.editButton}
              onPress={() => setShowEditModal(true)}
            >
              <Ionicons name="create-outline" size={20} color={'#333'} />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Profile Card */}
        <View style={[styles.profileCard, { backgroundColor: '#fff' }]}>
          <View style={styles.avatarSection}>
            <View style={[styles.avatar, { backgroundColor: '#f0f0f0' }]}>
              {profile?.avatar_url ? (
                <Image source={{ uri: profile.avatar_url }} style={styles.avatarImage} />
              ) : (
                <Ionicons name="person" size={40} color={'#666'} />
              )}
            </View>
            <View style={styles.profileInfo}>
              <Text style={[styles.profileName, { color: '#333' }]}>
                {profile?.username || 'User'}
              </Text>
              <Text style={[styles.profileEmail, { color: '#666' }]}>
                {session?.user?.email}
              </Text>
              {profile?.diabetes_type && (
                <View style={styles.diabetesTypeBadge}>
                  <Text style={styles.diabetesTypeIcon}>
                    {getDiabetesTypeIcon(profile.diabetes_type)}
                  </Text>
                  <Text style={[styles.diabetesTypeText, { color: '#333' }]}>
                    {profile.diabetes_type}
                  </Text>
                </View>
              )}
            </View>
          </View>
        </View>

        {/* Health Overview */}
        <View style={[styles.section, { backgroundColor: '#fff' }]}>
          <Text style={[styles.sectionTitle, { color: '#333' }]}>
            Health Overview
          </Text>
          
          <View style={styles.healthStats}>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: getGlucoseColor(recentGlucose[0]?.glucose_value || 100) }]}>
                {recentGlucose[0]?.glucose_value || '--'}
              </Text>
              <Text style={[styles.statLabel, { color: '#666' }]}>
                Latest Glucose (mg/dL)
              </Text>
            </View>
            
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: '#333' }]}>
                {profile?.medications?.length || 0}
              </Text>
              <Text style={[styles.statLabel, { color: '#666' }]}>
                Medications
              </Text>
            </View>
            
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: '#333' }]}>
                {profile?.insulin_dependent ? '💉' : '🚫'}
              </Text>
              <Text style={[styles.statLabel, { color: '#666' }]}>
                {profile?.insulin_dependent ? 'Insulin Dependent' : 'No Insulin'}
              </Text>
            </View>
          </View>
        </View>

        {/* Medical Information */}
        <View style={[styles.section, { backgroundColor: '#fff' }]}>
          <Text style={[styles.sectionTitle, { color: '#333' }]}>
            Medical Information
          </Text>
          
          <View style={styles.infoGrid}>
            <View style={styles.infoItem}>
              <Ionicons name="medical" size={20} color="#007AFF" />
              <View style={styles.infoContent}>
                <Text style={[styles.infoLabel, { color: '#666' }]}>
                  Diabetes Type
                </Text>
                <Text style={[styles.infoValue, { color: '#333' }]}>
                  {profile?.diabetes_type || 'Not specified'}
                </Text>
              </View>
            </View>
            
            <View style={styles.infoItem}>
              <Ionicons name="fitness" size={20} color="#34C759" />
              <View style={styles.infoContent}>
                <Text style={[styles.infoLabel, { color: '#666' }]}>
                  Profile Created
                </Text>
                <Text style={[styles.infoValue, { color: '#333' }]}>
                  {profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : 'Recently'}
                </Text>
              </View>
            </View>
            
            <View style={styles.infoItem}>
              <Ionicons name="medical" size={20} color="#FF9500" />
              <View style={styles.infoContent}>
                <Text style={[styles.infoLabel, { color: '#666' }]}>
                  Medications
                </Text>
                <Text style={[styles.infoValue, { color: '#333' }]}>
                  {profile?.medications?.length ? profile.medications.join(', ') : 'None listed'}
                </Text>
              </View>
            </View>
            
            <View style={styles.infoItem}>
              <Ionicons name="call" size={20} color="#FF3B30" />
              <View style={styles.infoContent}>
                <Text style={[styles.infoLabel, { color: '#666' }]}>
                  Emergency Contact
                </Text>
                <Text style={[styles.infoValue, { color: '#333' }]}>
                  {profile?.emergency_contact || 'Not set'}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Recent Glucose Logs */}
        {recentGlucose.length > 0 && (
          <View style={[styles.section, { backgroundColor: '#fff' }]}>
            <Text style={[styles.sectionTitle, { color: '#333' }]}>
              Recent Glucose Readings
            </Text>
            
            <View style={styles.glucoseList}>
              {recentGlucose.slice(0, 3).map((log, index) => (
                <View key={index} style={styles.glucoseItem}>
                  <View style={styles.glucoseInfo}>
                    <Text style={[styles.glucoseValue, { color: getGlucoseColor(log.glucose_value) }]}>
                      {log.glucose_value}
                    </Text>
                    <Text style={[styles.glucoseUnit, { color: '#666' }]}>
                      mg/dL
                    </Text>
                  </View>
                  <View style={styles.glucoseDetails}>
                    <Text style={[styles.glucoseContext, { color: '#333' }]}>
                      {log.context || 'General'}
                    </Text>
                    <Text style={[styles.glucoseTime, { color: '#666' }]}>
                      {new Date(log.measurement_time).toLocaleDateString()}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Sign Out Button */}
        <TouchableOpacity 
          style={[styles.signOutButton, { backgroundColor: '#f0f0f0' }]}
          onPress={handleSignOut}
        >
          <Ionicons name="log-out-outline" size={20} color="#FF3B30" />
          <Text style={[styles.signOutText, { color: '#FF3B30' }]}>
            Sign Out
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Edit Profile Modal */}
      <Modal
        visible={showEditModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowEditModal(false)}
      >
        <EditProfileModal
          isDark={false}
          profile={editableProfile}
          editUsername={editUsername}
          editDiabetesType={editDiabetesType}
          editInsulinDependent={editInsulinDependent}
          editMedications={editMedications}
          editEmergencyContact={editEmergencyContact}
          editDoctorInfo={editDoctorInfo}
          setEditUsername={setEditUsername}
          setEditDiabetesType={setEditDiabetesType}
          setEditInsulinDependent={setEditInsulinDependent}
          setEditMedications={setEditMedications}
          setEditEmergencyContact={setEditEmergencyContact}
          setEditDoctorInfo={setEditDoctorInfo}
          onSave={handleSaveProfile}
          onCancel={() => setShowEditModal(false)}
          saving={saving}
        />
      </Modal>
    </View>
  );
}

// Edit Profile Modal Component
interface EditProfileModalProps {
  isDark: boolean;
  profile: Partial<UserProfile> | null;
  editUsername: string;
  editDiabetesType: string;
  editInsulinDependent: boolean;
  editMedications: string;
  editEmergencyContact: string;
  editDoctorInfo: string;
  setEditUsername: (value: string) => void;
  setEditDiabetesType: (value: string) => void;
  setEditInsulinDependent: (value: boolean) => void;
  setEditMedications: (value: string) => void;
  setEditEmergencyContact: (value: string) => void;
  setEditDoctorInfo: (value: string) => void;
  onSave: () => void;
  onCancel: () => void;
  saving: boolean;
}

function EditProfileModal({
  isDark,
  editUsername,
  editDiabetesType,
  editInsulinDependent,
  editMedications,
  editEmergencyContact,
  editDoctorInfo,
  setEditUsername,
  setEditDiabetesType,
  setEditInsulinDependent,
  setEditMedications,
  setEditEmergencyContact,
  setEditDoctorInfo,
  onSave,
  onCancel,
  saving,
}: EditProfileModalProps) {
  return (
    <View style={[styles.modalContainer, { backgroundColor: '#f6f8fa' }]}>
      <View style={[styles.modalHeader, { backgroundColor: '#fff' }]}>
        <Text style={[styles.modalTitle, { color: '#333' }]}>
          Edit Profile
        </Text>
        <TouchableOpacity onPress={onCancel} style={styles.closeButton}>
          <Ionicons name="close" size={24} color={'#333'} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
        <View style={styles.formGroup}>
          <Text style={[styles.formLabel, { color: '#666' }]}>
            Username
          </Text>
          <TextInput
            style={[styles.formInput, { 
              backgroundColor: '#fff',
              color: '#333',
              borderColor: '#ddd'
            }]}
            value={editUsername}
            onChangeText={setEditUsername}
            placeholder="Enter your username"
            placeholderTextColor={'#999'}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={[styles.formLabel, { color: '#666' }]}>
            Diabetes Type
          </Text>
          <TextInput
            style={[styles.formInput, { 
              backgroundColor: '#fff',
              color: '#333',
              borderColor: '#ddd'
            }]}
            value={editDiabetesType}
            onChangeText={setEditDiabetesType}
            placeholder="e.g., Type 1, Type 2, Gestational, Prediabetes"
            placeholderTextColor={'#999'}
          />
        </View>

        <View style={styles.formGroup}>
          <View style={styles.switchRow}>
            <Text style={[styles.formLabel, { color: '#666' }]}>
              Insulin Dependent
            </Text>
            <Switch
              value={editInsulinDependent}
              onValueChange={setEditInsulinDependent}
              trackColor={{ false: '#ddd', true: '#007AFF' }}
              thumbColor={editInsulinDependent ? '#fff' : ('#f4f3f4')}
            />
          </View>
        </View>


        <View style={styles.formGroup}>
          <Text style={[styles.formLabel, { color: '#666' }]}>
            Medications
          </Text>
          <TextInput
            style={[styles.formInput, { 
              backgroundColor: '#fff',
              color: '#333',
              borderColor: '#ddd'
            }]}
            value={editMedications}
            onChangeText={setEditMedications}
            placeholder="e.g., Metformin, Insulin, Lisinopril"
            placeholderTextColor={'#999'}
            multiline
            numberOfLines={2}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={[styles.formLabel, { color: '#666' }]}>
            Emergency Contact
          </Text>
          <TextInput
            style={[styles.formInput, { 
              backgroundColor: '#fff',
              color: '#333',
              borderColor: '#ddd'
            }]}
            value={editEmergencyContact}
            onChangeText={setEditEmergencyContact}
            placeholder="Name and phone number"
            placeholderTextColor={'#999'}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={[styles.formLabel, { color: '#666' }]}>
            Doctor Information
          </Text>
          <TextInput
            style={[styles.formInput, { 
              backgroundColor: '#fff',
              color: '#333',
              borderColor: '#ddd'
            }]}
            value={editDoctorInfo}
            onChangeText={setEditDoctorInfo}
            placeholder="Doctor name and contact info"
            placeholderTextColor={'#999'}
            multiline
            numberOfLines={2}
          />
        </View>

        <TouchableOpacity 
          style={[styles.saveButton, saving && styles.saveButtonDisabled]} 
          onPress={onSave}
          disabled={saving}
        >
          {saving ? (
            <View style={styles.saveButtonContent}>
              <ActivityIndicator size="small" color="#fff" />
              <Text style={styles.saveButtonText}>Saving...</Text>
            </View>
          ) : (
            <Text style={styles.saveButtonText}>Save Changes</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  header: {
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  editButton: {
    padding: 8,
  },
  themeToggle: {
    padding: 8,
  },
  themeIcon: {
    fontSize: 18,
  },
  scroll: {
    flex: 1,
  },
  profileCard: {
    margin: 16,
    padding: 20,
    borderRadius: 16,
    boxShadow: '0 1px 6px rgba(0,0,0,0.08)',
    elevation: 3,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  avatarSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 16,
    marginBottom: 8,
  },
  diabetesTypeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  diabetesTypeIcon: {
    fontSize: 16,
  },
  diabetesTypeText: {
    fontSize: 14,
    fontWeight: '600',
  },
  section: {
    margin: 16,
    marginTop: 8,
    padding: 20,
    borderRadius: 16,
    boxShadow: '0 1px 6px rgba(0,0,0,0.08)',
    elevation: 3,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  healthStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    textAlign: 'center',
  },
  infoGrid: {
    gap: 16,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 14,
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '500',
  },
  glucoseList: {
    gap: 12,
  },
  glucoseItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
  },
  glucoseInfo: {
    alignItems: 'center',
    marginRight: 16,
  },
  glucoseValue: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  glucoseUnit: {
    fontSize: 12,
  },
  glucoseDetails: {
    flex: 1,
  },
  glucoseContext: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 2,
  },
  glucoseTime: {
    fontSize: 14,
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  signOutText: {
    fontSize: 16,
    fontWeight: '600',
  },
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 50,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 5,
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  formGroup: {
    marginBottom: 20,
  },
  formLabel: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
  },
  formInput: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  saveButton: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 40,
  },
  saveButtonDisabled: {
    backgroundColor: '#ccc',
  },
  saveButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
