import React, {useState} from 'react'
import { supabase } from '../../lib/supabaseClient'
import Layout from '../../components/Layout'

export default function Login(){
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)

  const handleSubmit = async (e: any) =>{
    e.preventDefault()
    if (!supabase) {
      alert('Supabase is not configured yet')
      return
    }
    const { error } = await supabase.auth.signInWithOtp({ email })
    if(!error) setSent(true)
  }

  return (
    <Layout>
      <h1 className="text-2xl mb-4">Writer login</h1>
      {sent ? <p>Check your email for a magic link.</p> : (
      <form onSubmit={handleSubmit} className="max-w-md">
        <input className="w-full border p-2 mb-2" value={email} onChange={e=>setEmail(e.target.value)} placeholder="your email" />
        <button className="px-4 py-2 bg-accent text-white rounded">Send magic link</button>
      </form>)}
    </Layout>
  )
}
