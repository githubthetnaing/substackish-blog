import React, { useEffect, useMemo, useState } from 'react'
import Layout from '../../components/Layout'
import { supabase } from '../../lib/supabaseClient'
import RichTextEditor from '../../components/RichTextEditor'
import { useRouter } from 'next/router'

type Post = {
  id: string
  title: string
  subtitle: string | null
  status: string
  published_at: string | null
  created_at: string
  updated_at: string
  content: any
  slug: string
}

const formatDate = (value: string | null) => {
  if (!value) return 'Unknown date'
  return new Date(value).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export default function Dashboard() {
  const router = useRouter()
  const [posts, setPosts] = useState<Post[]>([])
  const [selectedPost, setSelectedPost] = useState<Post | null>(null)
  const [title, setTitle] = useState('')
  const [subtitle, setSubtitle] = useState('')
  const [contentHtml, setContentHtml] = useState('<p></p>')
  const [search, setSearch] = useState('')
  const [publishing, setPublishing] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    ;(async () => {
      const client = (await import('../../lib/supabaseClient')).supabase
      if (!client) {
        router.push('/admin/login')
        return
      }
      const { data } = await client.auth.getUser()
      if (!data.user) {
        router.push('/admin/login')
        return
      }
      await loadPosts()
    })()
  }, [router])

  const loadPosts = async () => {
    if (!supabase) {
      setLoading(false)
      return
    }

    setLoading(true)
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .order('updated_at', { ascending: false })
    if (error) {
      console.error(error)
      setLoading(false)
      return
    }
    const list = (data || []) as Post[]
    setPosts(list)
    if (!selectedPost && list.length > 0) {
      selectPost(list[0])
    }
    setLoading(false)
  }

  const selectPost = (post: Post | null) => {
    setSelectedPost(post)
    setTitle(post?.title || '')
    setSubtitle(post?.subtitle || '')
    setContentHtml(post?.content?.blocks?.[0]?.data?.html || '<p></p>')
  }

  const newPost = () => {
    setSelectedPost(null)
    setTitle('')
    setSubtitle('')
    setContentHtml('<p></p>')
  }

  const save = async (publish = false) => {
    if (!title.trim()) {
      alert('Please add a title before saving.')
      return
    }

    if (!supabase) {
      alert('Supabase is not configured yet.')
      return
    }

    const user = (await supabase.auth.getUser()).data.user
    const author_email = user?.email || ''
    const payload = {
      id: selectedPost?.id,
      author_email,
      title,
      subtitle,
      content: { blocks: [{ id: 'body-1', type: 'richtext', data: { html: contentHtml } }] },
      status: publish ? 'published' : 'draft',
      slug: title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
      tags: [],
    }

    setPublishing(true)

    const method = selectedPost?.id ? 'PUT' : 'POST'
    const response = await fetch('/api/posts', {
      method,
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(payload),
    })

    if (response.ok) {
      const data = await response.json()
      setSelectedPost(data)
      await loadPosts()
      alert(publish ? 'Published' : 'Saved draft')
    } else {
      const error = await response.json()
      alert('Error: ' + (error?.error || 'unknown'))
    }

    setPublishing(false)
  }

  const filteredPosts = useMemo(() => {
    const query = search.toLowerCase().trim()
    if (!query) return posts
    return posts.filter(
      (post) =>
        post.title?.toLowerCase().includes(query) ||
        post.subtitle?.toLowerCase().includes(query) ||
        post.content?.blocks?.[0]?.data?.html?.toLowerCase().includes(query)
    )
  }, [posts, search])

  return (
    <Layout>
      <div className="max-w-[1400px] mx-auto px-6 py-8">
        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-gray-500">Writer Studio</p>
              <h1 className="mt-2 text-4xl font-semibold tracking-tight">Your notes, polished.</h1>
              <p className="mt-2 max-w-2xl text-sm text-gray-600">Draft, edit, and publish articles with the same clean writer experience.</p>
            </div>
            <button
              type="button"
              onClick={newPost}
              className="inline-flex items-center justify-center rounded-full bg-black px-5 py-3 text-sm font-semibold text-white transition hover:bg-gray-900"
            >
              New note
            </button>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[320px_1fr]">
            <aside className="rounded-[32px] border border-gray-200 bg-white p-5 shadow-sm">
              <div className="mb-5 flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-gray-500">Publications</p>
                  <h2 className="mt-2 text-xl font-semibold">Your drafts</h2>
                </div>
                <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-gray-600">
                  {filteredPosts.length}
                </span>
              </div>
              <div className="mb-5">
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search articles & drafts..."
                  className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-black"
                />
              </div>
              <div className="space-y-3 overflow-y-auto max-h-[calc(100vh-270px)] pr-1">
                {loading ? (
                  <div className="text-sm text-gray-500">Loading notes...</div>
                ) : filteredPosts.length > 0 ? (
                  filteredPosts.map((post) => (
                    <button
                      key={post.id}
                      onClick={() => selectPost(post)}
                      className={`w-full rounded-[28px] border p-4 text-left transition ${
                        selectedPost?.id === post.id
                          ? 'border-black bg-gray-100'
                          : 'border-transparent hover:border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="text-sm font-semibold text-gray-900">{post.title || 'Untitled note'}</div>
                          <p className="mt-2 line-clamp-2 text-sm leading-5 text-gray-600">{post.subtitle || 'No subtitle yet'}</p>
                        </div>
                        <span className="rounded-full bg-gray-100 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.25em] text-gray-600">
                          {post.status === 'published' ? 'Published' : 'Draft'}
                        </span>
                      </div>
                      <div className="mt-3 text-xs text-gray-500">{formatDate(post.updated_at || post.created_at)}</div>
                    </button>
                  ))
                ) : (
                  <div className="text-sm text-gray-500">No notes yet. Click “New note” to begin.</div>
                )}
              </div>
              <div className="mt-6 flex items-center justify-between border-t border-gray-200 pt-4 text-sm text-gray-500">
                <span>Archive</span>
                <span>Trash</span>
              </div>
            </aside>

            <section className="rounded-[32px] border border-gray-200 bg-white p-6 shadow-sm">
              <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.35em] text-gray-500">Editor</p>
                  <h2 className="mt-3 text-3xl font-semibold">
                    {selectedPost ? 'Edit note' : 'New note'}
                  </h2>
                  {selectedPost && (
                    <p className="mt-2 text-sm text-gray-600">
                      {selectedPost.status === 'published'
                        ? `Published ${formatDate(selectedPost.published_at)}`
                        : `Draft · updated ${formatDate(selectedPost.updated_at)}`}
                    </p>
                  )}
                </div>
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => save(false)}
                    className="rounded-full border border-gray-300 bg-white px-5 py-3 text-sm font-medium text-gray-900 transition hover:bg-gray-50"
                  >
                    Save draft
                  </button>
                  <button
                    onClick={() => save(true)}
                    disabled={publishing}
                    className="rounded-full bg-black px-5 py-3 text-sm font-semibold text-white transition hover:bg-gray-900 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {publishing ? 'Publishing...' : selectedPost?.status === 'published' ? 'Update & publish' : 'Publish'}
                  </button>
                </div>
              </div>

              <div className="mt-6 space-y-4">
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Title"
                  className="w-full rounded-3xl border border-gray-200 bg-gray-50 px-5 py-4 text-2xl font-semibold outline-none transition focus:border-black"
                />
                <input
                  value={subtitle || ''}
                  onChange={(e) => setSubtitle(e.target.value)}
                  placeholder="Add an elegant subtitle..."
                  className="w-full rounded-3xl border border-gray-200 bg-gray-50 px-5 py-3 text-base text-gray-700 outline-none transition focus:border-black"
                />
              </div>

              <div className="mt-8 min-h-[580px]">
                <RichTextEditor value={contentHtml} onChange={setContentHtml} />
              </div>
            </section>
          </div>
        </div>
      </div>
    </Layout>
  )
}
