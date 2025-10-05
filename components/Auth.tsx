import React, { useState } from 'react'
import { Alert, StyleSheet, View, AppState, TextInput, TouchableOpacity, Text, Modal, Switch } from 'react-native'
import { supabase } from '../lib/supabase'

// Tells Supabase Auth to continuously refresh the session automatically if
// the app is in the foreground. When this is added, you will continue to receive
// `onAuthStateChange` events with the `TOKEN_REFRESHED` or `SIGNED_OUT` event
// if the user's session is terminated. This should only be registered once.
AppState.addEventListener('change', (state) => {
  if (state === 'active') {
    supabase.auth.startAutoRefresh()
  } else {
    supabase.auth.stopAutoRefresh()
  }
})

export default function Auth() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [diabetesType, setDiabetesType] = useState('')
  const [insulinDependent, setInsulinDependent] = useState(false)
  const [averageBloodSugar, setAverageBloodSugar] = useState('')
  const [medications, setMedications] = useState('')
  const [emergencyContact, setEmergencyContact] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)

  async function signInWithEmail() {
    setLoading(true)
    setErrorMessage('')
    
    if (!email || !password) {
      setErrorMessage('Please fill in all fields')
      setLoading(false)
      return
    }

    const { error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    })

    if (error) {
      setErrorMessage(error.message)
    }
    setLoading(false)
  }

  async function signUpWithEmail() {
    setLoading(true)
    setErrorMessage('')
    
    if (!email || !password) {
      setErrorMessage('Please fill in all fields')
      setLoading(false)
      return
    }

    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters long')
      setLoading(false)
      return
    }

    const {
      data: { session },
      error,
    } = await supabase.auth.signUp({
      email: email,
      password: password,
    })

    if (error) {
      setErrorMessage(error.message)
    } else if (!session) {
      setErrorMessage('Please check your inbox for email verification!')
    } else {
      setShowModal(true)
    }
    setLoading(false)
  }

  async function saveDiabetesInfo() {
    setLoading(true)
    const user = (await supabase.auth.getUser()).data.user
    if (!user) {
      Alert.alert('User not found!')
      setLoading(false)
      return
    }
    const updates = {
      id: user.id,
      diabetes_type: diabetesType,
      insulin_dependent: insulinDependent,
      average_blood_sugar: averageBloodSugar ? parseFloat(averageBloodSugar) : null,
      medications,
      emergency_contact: emergencyContact,
      updated_at: new Date(),
    }
    const { error } = await supabase.from('profiles').upsert(updates)
    if (error) {
      Alert.alert(error.message)
    } else {
      setShowModal(false)
    }
    setLoading(false)
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Welcome to DiaBite</Text>
        <Text style={styles.subtitle}>Please sign in to continue</Text>
      </View>

      {errorMessage ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{errorMessage}</Text>
        </View>
      ) : null}

      <View style={[styles.verticallySpaced, styles.mt20]}>
        <Text style={styles.label}>Email</Text>
        <TextInput
          style={styles.input}
          onChangeText={(text: string) => {
            setEmail(text)
            setErrorMessage('')
          }}
          value={email}
          placeholder="email@address.com"
          autoCapitalize={'none'}
          keyboardType="email-address"
        />
      </View>
      <View style={styles.verticallySpaced}>
        <Text style={styles.label}>Password</Text>
        <TextInput
          style={styles.input}
          onChangeText={(text: string) => {
            setPassword(text)
            setErrorMessage('')
          }}
          value={password}
          secureTextEntry={true}
          placeholder="Password"
          autoCapitalize={'none'}
        />
      </View>
      <View style={[styles.verticallySpaced, styles.mt20]}>
        <TouchableOpacity 
          style={[styles.button, loading && styles.buttonDisabled]} 
          disabled={loading} 
          onPress={() => signInWithEmail()}
        >
          <Text style={styles.buttonText}>{loading ? 'Signing in...' : 'Sign in'}</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.verticallySpaced}>
        <TouchableOpacity 
          style={[styles.button, styles.secondaryButton, loading && styles.buttonDisabled]} 
          disabled={loading} 
          onPress={() => signUpWithEmail()}
        >
          <Text style={styles.secondaryButtonText}>{loading ? 'Signing up...' : 'Sign up'}</Text>
        </TouchableOpacity>
      </View>
      <Modal
        visible={showModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowModal(false)}
      >
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <View style={{ backgroundColor: 'white', padding: 20, borderRadius: 10, width: '90%' }}>
            <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10 }}>Tell us about your diabetes</Text>
            <Text style={styles.label}>Diabetes Type</Text>
            <TextInput
              style={styles.input}
              value={diabetesType}
              onChangeText={setDiabetesType}
              placeholder="e.g. Type 1, Type 2"
            />
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
              <Text style={{ marginRight: 10 }}>Insulin Dependent</Text>
              <Switch value={insulinDependent} onValueChange={setInsulinDependent} />
            </View>
            <Text style={styles.label}>Average Blood Sugar</Text>
            <TextInput
              style={styles.input}
              value={averageBloodSugar}
              onChangeText={setAverageBloodSugar}
              placeholder="mg/dL"
              keyboardType="numeric"
            />
            <Text style={styles.label}>Medications</Text>
            <TextInput
              style={styles.input}
              value={medications}
              onChangeText={setMedications}
              placeholder="List medications"
            />
            <Text style={styles.label}>Emergency Contact</Text>
            <TextInput
              style={styles.input}
              value={emergencyContact}
              onChangeText={setEmergencyContact}
              placeholder="Name and phone number"
            />
            <TouchableOpacity style={[styles.button, loading && styles.buttonDisabled]} disabled={loading} onPress={saveDiabetesInfo}>
              <Text style={styles.buttonText}>{loading ? 'Saving...' : 'Save'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    backgroundColor: '#f5f5f5',
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    backgroundColor: '#ffebee',
    borderColor: '#f44336',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
  },
  errorText: {
    color: '#d32f2f',
    fontSize: 14,
    textAlign: 'center',
  },
  verticallySpaced: {
    paddingTop: 4,
    paddingBottom: 4,
    alignSelf: 'stretch',
  },
  mt20: {
    marginTop: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
    borderColor: '#ccc',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButtonText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
  },
})