import React, { useEffect } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '../../lib/supabaseClient'
import Layout from '../../components/Layout'

export default function AuthCallback(){
  const router = useRouter()

  useEffect(()=>{
    const finishLogin = async () => {
      if (!supabase) {
        router.replace('/admin/login')
        return
      }

      const { data, error } = await supabase.auth.getSession()
      if (error) {
        router.replace('/admin/login')
        return
      }

      if (data.session) {
        router.replace('/admin/dashboard')
      } else {
        router.replace('/admin/login')
      }
    }

    finishLogin()
  }, [router])

  return (
    <Layout>
      <h1 className="text-2xl mb-4">Finishing sign in...</h1>
      <p>Please wait while we redirect you to the dashboard.</p>
    </Layout>
  )
}
