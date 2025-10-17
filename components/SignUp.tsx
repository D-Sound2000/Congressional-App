import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Modal,
  Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../lib/supabase';

// Sign up component with diabetes info collection - this got complex fast
interface SignUpProps {
  onSwitchToSignIn: () => void;
}

export default function SignUp({ onSwitchToSignIn }: SignUpProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showModal, setShowModal] = useState(false);
  
  // Diabetes info
  const [diabetesType, setDiabetesType] = useState('');
  const [insulinDependent, setInsulinDependent] = useState(false);
  const [averageBloodSugar, setAverageBloodSugar] = useState('');
  const [medications, setMedications] = useState('');
  const [emergencyContact, setEmergencyContact] = useState('');

  const getErrorMessage = (error: any) => {
    if (!error) return '';
    
    const message = error.message.toLowerCase();
    
    if (message.includes('user already registered')) {
      return 'An account with this email already exists. Please sign in instead.';
    } else if (message.includes('invalid email')) {
      return 'Please enter a valid email address.';
    } else if (message.includes('password')) {
      return 'Password must be at least 6 characters long and contain a mix of letters and numbers.';
    } else if (message.includes('network')) {
      return 'Network error. Please check your internet connection and try again.';
    } else if (message.includes('rate limit')) {
      return 'Too many attempts. Please wait a few minutes before trying again.';
    }
    
    return error.message;
  };

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password: string) => {
    // At least 6 characters
    if (password.length < 6) return false;
    return true;
  };

  const handleSignUp = async () => {
    setErrorMessage('');
    
    // Validation
    if (!email.trim()) {
      setErrorMessage('Please enter your email address.');
      return;
    }
    
    if (!validateEmail(email)) {
      setErrorMessage('Please enter a valid email address (e.g., name@example.com).');
      return;
    }
    
    if (!password) {
      setErrorMessage('Please enter a password.');
      return;
    }
    
    if (!validatePassword(password)) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }
    
    if (!confirmPassword) {
      setErrorMessage('Please confirm your password.');
      return;
    }
    
    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match. Please make sure both passwords are the same.');
      return;
    }

    setLoading(true);

    const {
      data: { session },
      error,
    } = await supabase.auth.signUp({
      email: email.trim().toLowerCase(),
      password: password,
    });

    if (error) {
      setErrorMessage(getErrorMessage(error));
      setLoading(false);
    } else if (!session) {
      // Email confirmation required
      setErrorMessage('Success! Please check your email inbox to verify your account before signing in.');
      setLoading(false);
    } else {
      // Signed up successfully, show diabetes info modal
      setShowModal(true);
      setLoading(false);
    }
  };

  const saveDiabetesInfo = async () => {
    setLoading(true);
    const user = (await supabase.auth.getUser()).data.user;
    
    if (!user) {
      setErrorMessage('User not found. Please try signing in again.');
      setLoading(false);
      return;
    }

    const updates = {
      id: user.id,
      diabetes_type: diabetesType,
      insulin_dependent: insulinDependent,
      average_blood_sugar: averageBloodSugar ? parseFloat(averageBloodSugar) : null,
      medications,
      emergency_contact: emergencyContact,
      updated_at: new Date(),
    };

    const { error } = await supabase.from('profiles').upsert(updates);
    
    if (error) {
      setErrorMessage('Failed to save profile information. You can add this later in your profile settings.');
    }
    
    setShowModal(false);
    setLoading(false);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <Ionicons name="person-add" size={50} color="#007AFF" />
          </View>
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Join DiaBite to manage your diabetes</Text>
        </View>

        {/* Error/Success Message */}
        {errorMessage ? (
          <View style={[styles.messageContainer, errorMessage.includes('Success') ? styles.successContainer : styles.errorContainer]}>
            <Ionicons
              name={errorMessage.includes('Success') ? 'checkmark-circle' : 'alert-circle'}
              size={20}
              color={errorMessage.includes('Success') ? '#2e7d32' : '#d32f2f'}
            />
            <Text style={[styles.messageText, errorMessage.includes('Success') ? styles.successText : styles.errorText]}>
              {errorMessage}
            </Text>
          </View>
        ) : null}

        {/* Form */}
        <View style={styles.form}>
          {/* Email Input */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Email Address</Text>
            <View style={[styles.inputWrapper, errorMessage && !email ? styles.inputError : null]}>
              <Ionicons name="mail-outline" size={20} color="#666" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={(text) => {
                  setEmail(text);
                  setErrorMessage('');
                }}
                placeholder="Enter your email"
                placeholderTextColor="#999"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>
          </View>

          {/* Password Input */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Password</Text>
            <View style={[styles.inputWrapper, errorMessage && !password ? styles.inputError : null]}>
              <Ionicons name="lock-closed-outline" size={20} color="#666" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={password}
                onChangeText={(text) => {
                  setPassword(text);
                  setErrorMessage('');
                }}
                placeholder="Create a password (min 6 characters)"
                placeholderTextColor="#999"
                secureTextEntry={!showPassword}
                autoCapitalize="none"
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                style={styles.eyeIcon}
              >
                <Ionicons
                  name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                  size={20}
                  color="#666"
                />
              </TouchableOpacity>
            </View>
            <Text style={styles.hint}>Must be at least 6 characters</Text>
          </View>

          {/* Confirm Password Input */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Confirm Password</Text>
            <View style={[styles.inputWrapper, errorMessage && !confirmPassword ? styles.inputError : null]}>
              <Ionicons name="lock-closed-outline" size={20} color="#666" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={confirmPassword}
                onChangeText={(text) => {
                  setConfirmPassword(text);
                  setErrorMessage('');
                }}
                placeholder="Re-enter your password"
                placeholderTextColor="#999"
                secureTextEntry={!showConfirmPassword}
                autoCapitalize="none"
              />
              <TouchableOpacity
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                style={styles.eyeIcon}
              >
                <Ionicons
                  name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'}
                  size={20}
                  color="#666"
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Sign Up Button */}
          <TouchableOpacity
            style={[styles.signUpButton, loading && styles.buttonDisabled]}
            onPress={handleSignUp}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.signUpButtonText}>Create Account</Text>
            )}
          </TouchableOpacity>

          {/* Privacy Text */}
          <Text style={styles.privacyText}>
            By signing up, you agree to our Terms of Service and Privacy Policy
          </Text>

          {/* Divider */}
          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>OR</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Sign In Link */}
          <View style={styles.signInContainer}>
            <Text style={styles.signInText}>Already have an account? </Text>
            <TouchableOpacity onPress={onSwitchToSignIn}>
              <Text style={styles.signInLink}>Sign In</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Diabetes Info Modal */}
      <Modal
        visible={showModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Tell Us About Your Diabetes</Text>
            <Text style={styles.modalSubtitle}>This helps us personalize your experience</Text>
          </View>

          <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Diabetes Type</Text>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.input}
                  value={diabetesType}
                  onChangeText={setDiabetesType}
                  placeholder="e.g., Type 1, Type 2, Gestational"
                  placeholderTextColor="#999"
                />
              </View>
            </View>

            <View style={styles.switchContainer}>
              <View style={styles.switchLabel}>
                <Text style={styles.label}>Insulin Dependent</Text>
                <Text style={styles.hint}>Do you take insulin?</Text>
              </View>
              <Switch
                value={insulinDependent}
                onValueChange={setInsulinDependent}
                trackColor={{ false: '#e0e0e0', true: '#007AFF' }}
                thumbColor={insulinDependent ? '#fff' : '#f4f3f4'}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Average Blood Sugar</Text>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.input}
                  value={averageBloodSugar}
                  onChangeText={setAverageBloodSugar}
                  placeholder="mg/dL (optional)"
                  placeholderTextColor="#999"
                  keyboardType="numeric"
                />
              </View>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Medications</Text>
              <View style={[styles.inputWrapper, { minHeight: 80 }]}>
                <TextInput
                  style={[styles.input, { textAlignVertical: 'top' }]}
                  value={medications}
                  onChangeText={setMedications}
                  placeholder="List your medications (optional)"
                  placeholderTextColor="#999"
                  multiline
                  numberOfLines={3}
                />
              </View>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Emergency Contact</Text>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.input}
                  value={emergencyContact}
                  onChangeText={setEmergencyContact}
                  placeholder="Name and phone number (optional)"
                  placeholderTextColor="#999"
                />
              </View>
            </View>

            <TouchableOpacity
              style={[styles.signUpButton, loading && styles.buttonDisabled]}
              onPress={saveDiabetesInfo}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.signUpButtonText}>Complete Setup</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.skipButton}
              onPress={() => setShowModal(false)}
            >
              <Text style={styles.skipButtonText}>Skip for Now</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContent: {
    flexGrow: 1,
    padding: 24,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#E3F2FD',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  messageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    marginBottom: 24,
  },
  errorContainer: {
    backgroundColor: '#ffebee',
    borderColor: '#f44336',
  },
  successContainer: {
    backgroundColor: '#e8f5e9',
    borderColor: '#4caf50',
  },
  messageText: {
    flex: 1,
    fontSize: 14,
    marginLeft: 10,
    lineHeight: 20,
  },
  errorText: {
    color: '#d32f2f',
  },
  successText: {
    color: '#2e7d32',
  },
  form: {
    width: '100%',
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    backgroundColor: '#f9f9f9',
    paddingHorizontal: 12,
  },
  inputError: {
    borderColor: '#f44336',
    backgroundColor: '#ffebee',
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 16,
    color: '#1a1a1a',
  },
  eyeIcon: {
    padding: 4,
  },
  hint: {
    fontSize: 12,
    color: '#999',
    marginTop: 6,
  },
  signUpButton: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
    marginTop: 8,
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
    shadowOpacity: 0.1,
  },
  signUpButtonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '600',
  },
  privacyText: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
    marginTop: 16,
    lineHeight: 18,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 30,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#e0e0e0',
  },
  dividerText: {
    marginHorizontal: 16,
    color: '#999',
    fontSize: 14,
  },
  signInContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  signInText: {
    fontSize: 15,
    color: '#666',
  },
  signInLink: {
    fontSize: 15,
    color: '#007AFF',
    fontWeight: '600',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  modalHeader: {
    padding: 24,
    paddingTop: 60,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 15,
    color: '#666',
  },
  modalContent: {
    flex: 1,
    padding: 24,
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    marginBottom: 20,
  },
  switchLabel: {
    flex: 1,
  },
  skipButton: {
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 12,
    marginBottom: 32,
  },
  skipButtonText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

