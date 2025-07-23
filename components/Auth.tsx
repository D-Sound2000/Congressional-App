import React, { useState } from 'react'
import { Alert, StyleSheet, View, AppState, Modal, Text, Switch } from 'react-native'
import { supabase } from '../lib/supabase'
import { Button, Input } from '@rneui/themed'

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

  async function signInWithEmail() {
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    })

    if (error) Alert.alert(error.message)
    setLoading(false)
  }

  async function signUpWithEmail() {
    setLoading(true)
    const {
      data: { session },
      error,
    } = await supabase.auth.signUp({
      email: email,
      password: password,
    })

    if (error) Alert.alert(error.message)
    if (!session) Alert.alert('Please check your inbox for email verification!')
    setLoading(false)
    if (!error && session) {
      setShowModal(true)
    }
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
      <View style={[styles.verticallySpaced, styles.mt20]}>
        <Input
          label="Email"
          leftIcon={{ type: 'font-awesome', name: 'envelope' }}
          onChangeText={(text) => setEmail(text)}
          value={email}
          placeholder="email@address.com"
          autoCapitalize={'none'}
        />
      </View>
      <View style={styles.verticallySpaced}>
        <Input
          label="Password(More Than 4 Characters)"
          leftIcon={{ type: 'font-awesome', name: 'lock' }}
          onChangeText={(text) => setPassword(text)}
          value={password}
          secureTextEntry={true}
          placeholder="Password"
          autoCapitalize={'none'}
        />
      </View>
      <View style={[styles.verticallySpaced, styles.mt20]}>
        <Button title="Sign in" disabled={loading} onPress={() => signInWithEmail()} />
      </View>
      <View style={styles.verticallySpaced}>
        <Button title="Sign up" disabled={loading} onPress={() => signUpWithEmail()} />
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
            <Input label="Diabetes Type" value={diabetesType} onChangeText={setDiabetesType} placeholder="e.g. Type 1, Type 2" />
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
              <Text style={{ marginRight: 10 }}>Insulin Dependent</Text>
              <Switch value={insulinDependent} onValueChange={setInsulinDependent} />
            </View>
            <Input label="Average Blood Sugar" value={averageBloodSugar} onChangeText={setAverageBloodSugar} placeholder="mg/dL" keyboardType="numeric" />
            <Input label="Medications" value={medications} onChangeText={setMedications} placeholder="List medications" />
            <Input label="Emergency Contact" value={emergencyContact} onChangeText={setEmergencyContact} placeholder="Name and phone number" />
            <Button title={loading ? 'Saving...' : 'Save'} onPress={saveDiabetesInfo} disabled={loading} />
          </View>
        </View>
      </Modal>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    marginTop: 40,
    padding: 12,
  },
  verticallySpaced: {
    paddingTop: 4,
    paddingBottom: 4,
    alignSelf: 'stretch',
  },
  mt20: {
    marginTop: 20,
  },
})