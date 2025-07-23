import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { StyleSheet, View, Alert } from 'react-native'
import { Button, Input } from '@rneui/themed'
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
        <Input label="Email" value={session?.user?.email} disabled />
      </View>
      <View style={styles.verticallySpaced}>
        <Input label="Username" value={username || ''} onChangeText={(text) => setUsername(text)} />
      </View>

      <View style={styles.verticallySpaced}>
        <Input label="Diabetes Type" value={diabetesType} onChangeText={setDiabetesType} placeholder="e.g. Type 1, Type 2" />
      </View>
      <View style={styles.verticallySpaced}>
        <Input label="Insulin Dependent" value={insulinDependent ? 'Yes' : 'No'}
          onFocus={() => setInsulinDependent(!insulinDependent)}
          editable={false}
          rightIcon={{ type: 'font-awesome', name: insulinDependent ? 'toggle-on' : 'toggle-off' }}
        />
      </View>
      <View style={styles.verticallySpaced}>
        <Input label="Average Blood Sugar" value={averageBloodSugar} onChangeText={setAverageBloodSugar} placeholder="mg/dL" keyboardType="numeric" />
      </View>
      <View style={styles.verticallySpaced}>
        <Input label="Medications" value={medications} onChangeText={setMedications} placeholder="List medications" />
      </View>
      <View style={styles.verticallySpaced}>
        <Input label="Emergency Contact" value={emergencyContact} onChangeText={setEmergencyContact} placeholder="Name and phone number" />
      </View>

      <View style={[styles.verticallySpaced, styles.mt20]}>
        <Button
          title={loading ? 'Loading ...' : 'Update'}
          onPress={() => updateProfile({ username, website, avatar_url: avatarUrl, diabetes_type: diabetesType, insulin_dependent: insulinDependent, average_blood_sugar: averageBloodSugar, medications, emergency_contact: emergencyContact })}
          disabled={loading}
        />
      </View>

      <View style={styles.verticallySpaced}>
        <Button title="Sign Out" onPress={() => supabase.auth.signOut()} />
      </View>
        <p style={{color:"red", textAlign:"center"}}>
          {updateMessage}
        </p>
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