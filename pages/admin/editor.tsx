import React, {useState} from 'react'
import Layout from '../../components/Layout'
import { supabase } from '../../lib/supabaseClient'
import RichTextEditor from '../../components/RichTextEditor'

type Block = { id: string; type: string; data: any }

export default function Editor(){
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
  const [title, setTitle] = useState('')
  const [subtitle, setSubtitle] = useState('')
  const [contentHtml, setContentHtml] = useState('<p></p>')

  const [publishing, setPublishing] = useState(false)
  const save = async (publish=false) =>{
    const post = { title, subtitle, blocks: [{ id: 'body-1', type: 'richtext', data: { html: contentHtml } }] }
    if (!supabase) {
      alert('Supabase is not configured yet')
      return
    }
    const user = (await supabase.auth.getUser()).data.user
    const author_email = user?.email || ''
    const payload = { author_email, title, subtitle, content: post, status: publish? 'published' : 'draft', slug: title.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,''), tags: [] }
    setPublishing(publish)
    const res = await fetch('/api/posts', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(payload) })
    if(res.ok){
      alert(publish? 'Published' : 'Saved draft')
    } else {
      const err = await res.json()
      alert('Error: '+(err?.error||'unknown'))
    }
    setPublishing(false)
  }

  return (
    <Layout>
      <h1 className="text-2xl mb-4">New Post</h1>
      <input className="w-full border p-2 mb-2" placeholder="Title" value={title} onChange={e=>setTitle(e.target.value)} />
      <input className="w-full border p-2 mb-4" placeholder="Subtitle" value={subtitle} onChange={e=>setSubtitle(e.target.value)} />

      <div className="mb-4">
        <RichTextEditor value={contentHtml} onChange={setContentHtml} />
      </div>

      <div className="flex mt-6">
        <button onClick={()=>save(false)} className="px-4 py-2 bg-gray-200 rounded mr-2">Save draft</button>
        <button onClick={()=>save(true)} className="px-4 py-2 bg-accent text-white rounded">{publishing? 'Publishing...' : 'Publish'}</button>
      </div>
    </Layout>
  )
}

function AudioRecorder({onRecord}:{onRecord:(d:string)=>void}){
  const [recPath, setRecPath] = React.useState<string | null>(null)
  const [recording, setRecording] = React.useState(false)
  const mediaRef = React.useRef<MediaRecorder | null>(null)
  const chunksRef = React.useRef<any[]>([])

  const start = async ()=>{
    const stream = await navigator.mediaDevices.getUserMedia({audio:true})
    const mr = new MediaRecorder(stream)
    mediaRef.current = mr
    mr.ondataavailable = e=> chunksRef.current.push(e.data)
    mr.onstop = ()=>{
      const blob = new Blob(chunksRef.current,{type:'audio/webm'})
      const reader = new FileReader()
      reader.onload = ()=>{
        onRecord(reader.result as string)
        setRecPath(reader.result as string)
      }
      reader.readAsDataURL(blob)
      chunksRef.current = []
    }
    mr.start()
    setRecording(true)
  }
  const stop = ()=>{
    mediaRef.current?.stop()
    setRecording(false)
  }
  return (
    <div>
      {recording ? <button onClick={stop} className="px-2 py-1 border">Stop</button> : <button onClick={start} className="px-2 py-1 border">Record</button>}
      {recPath && <audio controls src={recPath} />}
    </div>
  )
}
