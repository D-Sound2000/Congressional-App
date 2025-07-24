import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { StyleSheet, View, Alert, TextInput, TouchableOpacity, Text } from 'react-native'
import { Session } from '@supabase/supabase-js'

let updateMessage= " "

export default function Account({ session }: { session: Session }) {
  const [loading, setLoading] = useState(true)
  const [username, setUsername] = useState('')
  const [website, setWebsite] = useState('')
  const [avatarUrl, setAvatarUrl] = useState('')
  const [diabetesType, setDiabetesType] = useState('')
  const [insulinDependent, setInsulinDependent] = useState(false)
  const [averageBloodSugar, setAverageBloodSugar] = useState('')
  const [medications, setMedications] = useState('')
  const [emergencyContact, setEmergencyContact] = useState('')

  useEffect(() => {
    if (session) getProfile()
  }, [session])

  async function getProfile() {
    try {
      setLoading(true)
      if (!session?.user) throw new Error('No user on the session!')

      const { data, error, status } = await supabase
        .from('profiles')
        .select(`username, website, avatar_url, diabetes_type, insulin_dependent, average_blood_sugar, medications, emergency_contact`)
        .eq('id', session?.user.id)
        .single()
      if (error && status !== 406) {
        throw error
      }

      if (data) {
        setUsername(data.username)
        setWebsite(data.website)
        setAvatarUrl(data.avatar_url)
        setDiabetesType(data.diabetes_type || '')
        setInsulinDependent(!!data.insulin_dependent)
        setAverageBloodSugar(data.average_blood_sugar ? String(data.average_blood_sugar) : '')
        setMedications(data.medications || '')
        setEmergencyContact(data.emergency_contact || '')
      }
    } catch (error) {
      if (error instanceof Error) {
        Alert.alert(error.message)
      }
    } finally {
      setLoading(false)
    }
  }

  async function updateProfile({
    username,
    website,
    avatar_url,
    diabetes_type,
    insulin_dependent,
    average_blood_sugar,
    medications,
    emergency_contact,
  }: {
    username: string
    website: string
    avatar_url: string
    diabetes_type: string
    insulin_dependent: boolean
    average_blood_sugar: string
    medications: string
    emergency_contact: string
  }) {
    try {
      setLoading(true)
      if (!session?.user) throw new Error('No user on the session!')

      const updates = {
        id: session?.user.id,
        username,
        website,
        avatar_url,
        diabetes_type,
        insulin_dependent,
        average_blood_sugar: average_blood_sugar ? parseFloat(average_blood_sugar) : null,
        medications,
        emergency_contact,
        updated_at: new Date(),
      }

      const { error } = await supabase.from('profiles').upsert(updates)

      updateMessage = "Your Information Has Been Updated!"

      if (error) {
        throw error
      }
    } catch (error) {
      if (error instanceof Error) {
        Alert.alert(error.message)
      }
    } finally {
      setLoading(false)

    }
  }

  return (
    <View style={styles.container}>
      <View style={[styles.verticallySpaced, styles.mt20]}>
        <Text style={styles.label}>Email</Text>
        <TextInput style={[styles.input, styles.disabledInput]} value={session?.user?.email} editable={false} />
      </View>
      <View style={styles.verticallySpaced}>
        <Text style={styles.label}>Username</Text>
        <TextInput style={styles.input} value={username || ''} onChangeText={(text: string) => setUsername(text)} />
      </View>

      <View style={styles.verticallySpaced}>
        <Text style={styles.label}>Diabetes Type</Text>
        <TextInput style={styles.input} value={diabetesType} onChangeText={setDiabetesType} placeholder="e.g. Type 1, Type 2" />
      </View>
      <View style={styles.verticallySpaced}>
        <Text style={styles.label}>Insulin Dependent</Text>
        <TextInput 
          style={[styles.input, styles.disabledInput]} 
          value={insulinDependent ? 'Yes' : 'No'}
          onFocus={() => setInsulinDependent(!insulinDependent)}
          editable={false}
        />
      </View>
      <View style={styles.verticallySpaced}>
        <Text style={styles.label}>Average Blood Sugar</Text>
        <TextInput style={styles.input} value={averageBloodSugar} onChangeText={setAverageBloodSugar} placeholder="mg/dL" keyboardType="numeric" />
      </View>
      <View style={styles.verticallySpaced}>
        <Text style={styles.label}>Medications</Text>
        <TextInput style={styles.input} value={medications} onChangeText={setMedications} placeholder="List medications" />
      </View>
      <View style={styles.verticallySpaced}>
        <Text style={styles.label}>Emergency Contact</Text>
        <TextInput style={styles.input} value={emergencyContact} onChangeText={setEmergencyContact} placeholder="Name and phone number" />
      </View>

      <View style={[styles.verticallySpaced, styles.mt20]}>
        <TouchableOpacity 
          style={[styles.button, loading && styles.buttonDisabled]} 
          onPress={() => updateProfile({ username, website, avatar_url: avatarUrl, diabetes_type: diabetesType, insulin_dependent: insulinDependent, average_blood_sugar: averageBloodSugar, medications, emergency_contact: emergencyContact })}
          disabled={loading}
        >
          <Text style={styles.buttonText}>{loading ? 'Loading ...' : 'Update'}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.verticallySpaced}>
        <TouchableOpacity style={styles.button} onPress={() => supabase.auth.signOut()}>
          <Text style={styles.buttonText}>Sign Out</Text>
        </TouchableOpacity>
      </View>
      <Text style={styles.updateMessage}>
        {updateMessage}
      </Text>
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
  disabledInput: {
    backgroundColor: '#f5f5f5',
    color: '#666',
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  updateMessage: {
    color: 'red',
    textAlign: 'center',
    marginTop: 10,
  },
})