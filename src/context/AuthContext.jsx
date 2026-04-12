import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [session, setSession]   = useState(null)
  const [profile, setProfile]   = useState(null)
  const [loading, setLoading]   = useState(true)
  const [profileError, setProfileError] = useState(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      if (session) fetchProfile(session.user)
      else setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      if (session) fetchProfile(session.user)
      else { setProfile(null); setLoading(false) }
    })

    return () => subscription.unsubscribe()
  }, [])

  async function fetchProfile(user) {
    setLoading(true)
    setProfileError(null)
    try {
      // Fetch profile without school join first (avoids RLS recursion)
      const { data: prof, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle()

      if (error) {
        console.error('Profile fetch error:', error)
        setProfileError(error.message)
        // Fallback: use role from auth metadata — NEVER default to 'admin'
        const metaRole = user.user_metadata?.role
        if (!metaRole) {
          // Unknown role → sign out to prevent privilege escalation
          await supabase.auth.signOut()
          setSession(null)
          setLoading(false)
          return
        }
        setProfile({
          id: user.id,
          email: user.email,
          role: metaRole,
          name: user.user_metadata?.name || user.email.split('@')[0],
          avatar: '🏊',
          school_id: user.user_metadata?.school_id || null,
          subscription_status: user.user_metadata?.subscription_status || null,
        })
        setLoading(false)
        return
      }

      if (!prof) {
        // Profile row missing — create it automatically
        const metaRole = user.user_metadata?.role || 'parent'
        const { data: newProf } = await supabase.from('profiles').insert({
          id: user.id,
          email: user.email,
          name: user.user_metadata?.name || user.email.split('@')[0],
          role: metaRole,
          school_id: user.user_metadata?.school_id || '00000000-0000-0000-0000-000000000001',
          avatar: '🏊',
        }).select().single()
        setProfile(newProf || {
          id: user.id, email: user.email, role: metaRole,
          name: user.email.split('@')[0], avatar: '🏊',
          school_id: user.user_metadata?.school_id || '00000000-0000-0000-0000-000000000001',
        })
        setLoading(false)
        return
      }

      // Fetch school separately (no RLS join issues)
      let school = null
      if (prof.school_id) {
        const { data: schoolData } = await supabase
          .from('schools')
          .select('id, name, code')
          .eq('id', prof.school_id)
          .maybeSingle()
        school = schoolData
      }

      setProfile({ ...prof, schools: school })
    } catch (err) {
      console.error('fetchProfile exception:', err)
      const metaRole = user.user_metadata?.role
      if (metaRole) {
        setProfile({
          id: user.id, email: user.email, role: metaRole,
          name: user.user_metadata?.name || user.email.split('@')[0], avatar: '🏊',
          school_id: user.user_metadata?.school_id || null,
          subscription_status: user.user_metadata?.subscription_status || null,
        })
      } else {
        // Can't determine role safely → sign out
        await supabase.auth.signOut()
        setSession(null)
      }
    }
    setLoading(false)
  }

  async function signIn(email, password) {
    return supabase.auth.signInWithPassword({ email, password })
  }

  async function signUp(email, password, meta) {
    return supabase.auth.signUp({ email, password, options: { data: meta } })
  }

  async function signOut() {
    await supabase.auth.signOut()
    setSession(null)
    setProfile(null)
  }

  return (
    <AuthContext.Provider value={{
      session, profile, loading, profileError,
      signIn, signUp, signOut,
      refetchProfile: () => session?.user && fetchProfile(session.user),
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
