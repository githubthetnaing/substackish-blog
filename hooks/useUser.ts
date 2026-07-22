import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

export function useUser(){
  const [user, setUser] = useState<any>(null)
  useEffect(()=>{
    let mounted = true
    supabase.auth.getUser().then(res=>{
      if(mounted) setUser(res.data.user)
    })
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session)=>{
      setUser(session?.user ?? null)
    })
    return ()=>{ mounted=false; sub.subscription.unsubscribe() }
  },[])
  return user
}
