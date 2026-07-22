import React from 'react'
import Layout from '../../components/Layout'
import { safeSupabaseQuery } from '../../lib/supabaseClient'
import BlockRenderer from '../../components/BlockRenderer'
import Comments from '../../components/Comments'
import LikeButton from '../../components/LikeButton'

export default function Post({ post }:{post:any}){
  if(!post) return <Layout><div>Not found</div></Layout>
  return (
    <Layout>
      <article className="prose mx-auto">
        <h1 className="font-serif text-4xl">{post.title}</h1>
        {post.subtitle && <p className="text-gray-600">{post.subtitle}</p>}
        <div className="text-sm text-gray-500 mb-4">By Author • {new Date(post.published_at).toLocaleDateString()}</div>
        {post.cover_url && <img src={post.cover_url} alt="cover" className="w-full rounded mb-4" />}
        <BlockRenderer blocks={post.content.blocks || post.content} />
        <div className="mt-6 flex items-center gap-3">
          <LikeButton postId={post.id} />
        </div>
        <section id="comments" className="mt-8">
          <Comments postId={post.id} />
        </section>
      </article>
    </Layout>
  )
}

export async function getServerSideProps(context:any){
  const { slug } = context.params
  const post = await safeSupabaseQuery(async (client:any) => {
    const { data } = await client.from('posts').select('*').eq('slug', slug).maybeSingle()
    return data || null
  })

  return { props: { post } }
}
