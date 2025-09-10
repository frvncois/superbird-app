'use client'

import { createClient } from '@/lib/supabase/client'
import { useAuthStore } from '@/lib/stores/auth-store'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect } from 'react'

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { setUser, setProfile, setLoading, signOut } = useAuthStore()
  const router = useRouter()
  const pathname = usePathname()
  const supabase = createClient()

  useEffect(() => {
    let mounted = true

    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('❌ Session error:', error)
          if (mounted) setLoading(false)
          return
        }

        console.log('🔍 Session found:', session?.user?.email || 'No session')

        if (session?.user && mounted) {
          setUser(session.user)
          
          // Small delay to ensure auth context is established
          await new Promise(resolve => setTimeout(resolve, 100))
          
          console.log('🔍 Fetching profile for:', session.user.id)
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single()
          
          console.log('🔍 Profile fetch result:', { profile, profileError })
          
          if (profile && mounted) {
            console.log('✅ Profile found and set')
            setProfile(profile)
          } else if (profileError) {
            console.error('❌ Profile fetch error:', profileError)
          }
        }
        
        if (mounted) {
          console.log('✅ Setting loading to false')
          setLoading(false)
        }
      } catch (error) {
        console.error('❌ Auth initialization error:', error)
        if (mounted) setLoading(false)
      }
    }

    getInitialSession()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔄 Auth state change:', event, session?.user?.email)
        
        if (event === 'SIGNED_IN' && session?.user) {
          console.log('✅ Sign in detected, setting user...')
          setUser(session.user)
          
          // Force refresh session to establish auth context
          console.log('🔄 Refreshing session for auth context...')
          await supabase.auth.refreshSession()
          
          console.log('🔍 Fetching profile after sign in...')
          try {
            const { data: profile, error } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', session.user.id)
              .single()

            console.log('🔍 Profile fetch result:', { profile, error })

            if (profile) {
              console.log('✅ Profile found and set')
              setProfile(profile)
            } else if (error) {
              console.error('❌ Error fetching profile:', error)
              
              // If it's a "not found" error, the profile exists but RLS is blocking it
              if (error.code === 'PGRST116') {
                console.log('⚠️ Profile not found (this is unexpected since we know it exists)')
              } else {
                console.log('⚠️ Possible RLS or auth context issue')
              }
            }
          } catch (profileErr) {
            console.error('❌ Profile operation failed:', profileErr)
          } finally {
            console.log('✅ Setting loading to false')
            setLoading(false)
          }

          // Redirect from auth pages
          if (pathname.startsWith('/auth')) {
            console.log('🔄 Redirecting to dashboard...')
            router.push('/dashboard')
          }
        } else if (event === 'SIGNED_OUT') {
          console.log('🚪 Sign out detected')
          signOut()
          if (!pathname.startsWith('/auth')) {
            router.push('/auth/login')
          }
        } else {
          console.log('🔄 Other auth event, setting loading to false')
          setLoading(false)
        }
      }
    )

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [supabase.auth, setUser, setProfile, setLoading, signOut, router, pathname])

  return <>{children}</>
}