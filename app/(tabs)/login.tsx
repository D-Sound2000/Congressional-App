import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import Auth from '@/components/Auth'
import Account from '@/components/Account'
import { View, StyleSheet } from 'react-native'
import { Session } from '@supabase/supabase-js'
import HeaderNavBar from '@/components/HeaderNavBar'

export default function App() {
  const [session, setSession] = useState<Session | null>(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
    })

    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })
  }, [])

  return (
    <View>
      {session ? <Account key={session.user.id} session={session} /> : <Auth />}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#abc',
    // justifyContent: 'center',
    // alignItems: 'center',
  },
  text: {
    color: '#gff',
  },
});
