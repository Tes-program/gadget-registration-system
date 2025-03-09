/* eslint-disable @typescript-eslint/no-explicit-any */
// src/context/SupabaseContext.tsx
import { createContext, useContext, useEffect, useState } from 'react'
import { Session, User } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'

type UserRole = 'student' | 'staff'

type Profile = {
  id: string
  email: string
  full_name: string
  matric_number?: string
  staff_id?: string
  role: UserRole
  phone_number?: string
  department?: string
  study_level?: string
  hall_of_residence?: string
  home_address?: string
  biography?: string
}

interface SupabaseContextType {
  session: Session | null
  user: User | null
  profile: Profile | null
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, userData: Partial<Profile>) => Promise<void>
  signOut: () => Promise<void>
  loading: boolean
  isStaff: boolean
}

const SupabaseContext = createContext<SupabaseContextType | undefined>(undefined)

export function SupabaseProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  // Check for session on load
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  // Fetch user profile when user changes
  useEffect(() => {
    async function loadProfile() {
      if (user) {
        try {
          const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single()

          if (error) throw error
          setProfile(data)
        } catch (error) {
          console.error('Error loading profile:', error)
        }
      } else {
        setProfile(null)
      }
    }

    loadProfile()
  }, [user])

  // Sign In function
  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true)
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error

      // Redirect based on role
      if (data.session) {
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', data.session.user.id)
          .single()

        if (profileError) throw profileError

        if (profileData.role === 'staff') {
          navigate('/staff/dashboard')
        } else {
          navigate('/student/dashboard')
        }

        toast.success('Signed in successfully')
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to sign in')
    } finally {
      setLoading(false)
    }
  }

  // Sign Up function
  const signUp = async (email: string, password: string, userData: Partial<Profile>) => {
    try {
      setLoading(true)
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: userData.full_name,
            role: userData.role || 'student'
          }
        }
      })

      if (error) throw error

      // Additional profile data
      if (data.user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .update({
            ...userData
          })
          .eq('id', data.user.id)

        if (profileError) throw profileError

        toast.success('Account created successfully.')
        navigate('/login')
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to create account')
    } finally {
      setLoading(false)
    }
  }

  // Sign Out function
  const signOut = async () => {
    try {
      setLoading(true)
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      navigate('/')
      toast.success('Signed out successfully')
    } catch (error: any) {
      toast.error(error.message || 'Failed to sign out')
    } finally {
      setLoading(false)
    }
  }

  const isStaff = profile?.role === 'staff'

  return (
    <SupabaseContext.Provider
      value={{
        session,
        user,
        profile,
        signIn,
        signUp,
        signOut,
        loading,
        isStaff
      }}
    >
      {children}
    </SupabaseContext.Provider>
  )
}

// Hook to use the Supabase context
export function useSupabase() {
  const context = useContext(SupabaseContext)
  if (context === undefined) {
    throw new Error('useSupabase must be used within a SupabaseProvider')
  }
  return context
}