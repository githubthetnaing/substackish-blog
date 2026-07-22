import React from 'react'
import { useRouter } from 'next/router'
import Layout from '../../components/Layout'

export default function Login(){
  const router = useRouter()

  const handleAccess = () => {
    router.push('/admin/dashboard')
  }

  return (
    <Layout>
      <h1 className="text-2xl mb-4">Writer access</h1>
      <p className="mb-4">Admin access is enabled for now so you can start using the dashboard and editor immediately.</p>
      <button onClick={handleAccess} className="px-4 py-2 bg-accent text-white rounded">Open dashboard</button>
    </Layout>
  )
}
