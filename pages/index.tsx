import React from 'react'
import Layout from '../components/Layout'
import Link from 'next/link'
import SubscribeForm from '../components/SubscribeForm'
import { safeSupabaseQuery } from '../lib/supabaseClient'

export default function Home({ posts }:{posts:any[]}){
  const featured = posts[0]
  return (
    <Layout>
      <section className="text-center py-12">
        <img src="/avatar.jpg" alt="avatar" className="w-24 h-24 rounded-full mx-auto mb-4" />
        <h1 className="text-4xl font-serif mb-2">The Daily Brew</h1>
        <p className="text-gray-600 mb-6">Stories that matter, delivered daily.</p>
        {featured && (
          <div className="border rounded p-6 mb-8">
            <h3 className="font-semibold">Featured Post</h3>
            <Link href={`/post/${featured.slug}`} className="text-xl">{featured.title}</Link>
          </div>
        )}
        <section>
          <h2 className="text-2xl font-semibold mb-4">Latest</h2>
          <ul>
            {posts.map(p=> <li key={p.id} className="mb-4"><Link href={`/post/${p.slug}`} className="text-lg">{p.title}</Link></li>)}
          </ul>
        </section>
        <SubscribeForm />
      </section>
    </Layout>
  )
}

export async function getServerSideProps(){
  const posts = await safeSupabaseQuery(async (client:any) => {
    const { data } = await client.from('posts').select('*').eq('status','published').order('published_at',{ascending:false})
    return data || []
  })

  return { props: { posts } }
}
