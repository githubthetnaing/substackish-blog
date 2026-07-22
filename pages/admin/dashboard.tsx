import React from 'react'
import Layout from '../../components/Layout'
import Link from 'next/link'

export default function Dashboard(){
  const router = require('next/router').useRouter()
  React.useEffect(()=>{
    (async ()=>{
      const client = (await import('../../lib/supabaseClient')).supabase
      if (!client) {
        router.push('/admin/login')
        return
      }
      const { data } = await client.auth.getUser()
      if(!data.user) router.push('/admin/login')
    })()
  },[])
  return (
    <Layout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl">Writer Dashboard</h1>
        <Link href="/admin/editor" className="px-3 py-1 bg-accent text-white rounded">New Post</Link>
      </div>
      <p>List of drafts and published posts (placeholder).</p>
    </Layout>
  )
}
