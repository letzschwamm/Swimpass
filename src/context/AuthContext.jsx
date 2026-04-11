import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext(null)

// ── Demo accounts (kein Supabase nötig) ──────────────────────────────
const DEMO_USERS = {
  'admin@demo.local': {
    id: 'demo-admin', email: 'admin@demo.local', password: 'admin123',
    profile: { id: 'demo-admin', role: 'admin', name: 'Andy', email: 'admin@demo.local', avatar: '🏊', school_id: '00000000-0000-0000-0000-000000000001', schools: { id: '00000000-0000-0000-0000-000000000001', name: 'Letzschwamm Schwimmschule', code: 'LETZSCHWAMM000001' } },
  },
  'lehrer@demo.local': {
    id: 'demo-teacher', email: 'lehrer@demo.local', password: 'lehrer123',
    profile: { id: 'demo-teacher', role: 'teacher', name: 'Ana', email: 'lehrer@demo.local', avatar: '👩', school_id: '00000000-0000-0000-0000-000000000001', schools: { id: '00000000-0000-0000-0000-000000000001', name: 'Letzschwamm Schwimmschule', code: 'LETZSCHWAMM000001' } },
  },
  'eltern@demo.local': {
    id: 'demo-parent', email: 'eltern@demo.local', password: 'eltern123',
    profile: { id: 'demo-parent', role: 'parent', name: 'Familie Müller', email: 'eltern@demo.local', avatar: '👨‍👩‍👧', school_id: '00000000-0000-0000-0000-000000000001', schools: { id: '00000000-0000-0000-0000-000000000001', name: 'Letzschwamm Schwimmschule', code: 'LETZSCHWAMM000001' } },
  },
}

function getDemoEmail() { return localStorage.getItem('swimpass_demo_session') }

export function AuthProvider({ children }) {
  const [session, setSession]   = useState(null)
  const [profile, setProfile]   = useState(null)
  const [loading, setLoading]   = useState(true)
  const [isDemo, setIsDemo]     = useState(false)
  const [profileError, setProfileError] = useState(null)

  useEffect(() => {
    // Check demo session first
    const demoEmail = getDemoEmail()
    if (demoEmail && DEMO_USERS[demoEmail]) {
      const user = DEMO_USERS[demoEmail]
      setSession({ user: { id: user.id, email: user.email } })
      setProfile(user.profile)
      setIsDemo(true)
      setLoading(false)
      return
    }

    // Real Supabase session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      if (session) fetchProfile(session.user)
      else setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (getDemoEmail()) return // ignore Supabase events during demo
      setSession(session)
      if (session) fetchProfile(session.user)
      else { setProfile(null); setIsDemo(false); setLoading(false) }
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
        // Fallback: use basic profile from auth metadata
        setProfile({
          id: user.id,
          email: user.email,
          role: user.user_metadata?.role || 'admin',
          name: user.user_metadata?.name || user.email.split('@')[0],
          avatar: '🏊',
          school_id: user.user_metadata?.school_id || '00000000-0000-0000-0000-000000000001',
          schools: { id: '00000000-0000-0000-0000-000000000001', name: 'Letzschwamm Schwimmschule', code: 'LETZSCHWAMM000001' },
        })
        setLoading(false)
        return
      }

      if (!prof) {
        // Profile row missing — create it automatically
        const { data: newProf } = await supabase.from('profiles').insert({
          id: user.id,
          email: user.email,
          name: user.user_metadata?.name || user.email.split('@')[0],
          role: user.user_metadata?.role || 'admin',
          school_id: user.user_metadata?.school_id || '00000000-0000-0000-0000-000000000001',
          avatar: '🏊',
        }).select().single()
        setProfile(newProf || {
          id: user.id, email: user.email, role: 'admin',
          name: user.email.split('@')[0], avatar: '🏊',
          school_id: '00000000-0000-0000-0000-000000000001',
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
      setProfile({
        id: user.id, email: user.email, role: 'admin',
        name: user.email.split('@')[0], avatar: '🏊',
        school_id: '00000000-0000-0000-0000-000000000001',
      })
    }
    setLoading(false)
  }

  async function signIn(email, password) {
    // Demo login (only for .local demo accounts)
    const demo = DEMO_USERS[email]
    if (demo) {
      if (demo.password !== password) return { error: { message: 'Falsches Demo-Passwort.' } }
      localStorage.setItem('swimpass_demo_session', email)
      setSession({ user: { id: demo.id, email: demo.email } })
      setProfile(demo.profile)
      setIsDemo(true)
      return { data: demo, error: null }
    }

    // Real Supabase login
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (!error) setIsDemo(false)
    return { data, error }
  }

  async function signUp(email, password, meta) {
    return supabase.auth.signUp({ email, password, options: { data: meta } })
  }

  async function signOut() {
    localStorage.removeItem('swimpass_demo_session')
    setIsDemo(false)
    await supabase.auth.signOut()
    setSession(null)
    setProfile(null)
  }

  return (
    <AuthContext.Provider value={{
      session, profile, loading, isDemo, profileError,
      signIn, signUp, signOut,
      refetchProfile: () => session?.user && !isDemo && fetchProfile(session.user),
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
