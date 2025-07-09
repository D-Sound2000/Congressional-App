import AsyncStorage from '@react-native-async-storage/async-storage'
import { createClient } from '@supabase/supabase-js'
import{Platform} from 'react-native'

const supabaseUrl = 'https://phmmuurmjzcfbtyekhvi.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBobW11dXJtanpjZmJ0eWVraHZpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIwMTkxODUsImV4cCI6MjA2NzU5NTE4NX0.1wf-baE0V7IzS4aeGhefZNEjG-X1gqXZM7Nu9Zimvh8'

const isWeb = Platform.OS == 'web'

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: isWeb ? undefined : AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
})