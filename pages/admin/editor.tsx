import React, {useState} from 'react'
import Layout from '../../components/Layout'
import { supabase } from '../../lib/supabaseClient'

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
  const [blocks, setBlocks] = useState<Block[]>([{id: 'b1', type: 'paragraph', data: {text: ''}}])

  const addBlock = (type: string) => {
    setBlocks(b=>[...b, {id: String(Date.now()), type, data: type==='paragraph'?{text:''}:{}}])
  }

  const [publishing, setPublishing] = useState(false)
  const save = async (publish=false) =>{
    const post = { title, subtitle, blocks }
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
        <button onClick={()=>addBlock('paragraph')} className="mr-2 px-2 py-1 border">Paragraph</button>
        <button onClick={()=>addBlock('callout')} className="mr-2 px-2 py-1 border">Callout</button>
        <button onClick={()=>addBlock('pullquote')} className="mr-2 px-2 py-1 border">Pull Quote</button>
        <button onClick={()=>addBlock('divider')} className="mr-2 px-2 py-1 border">Divider</button>
        <button onClick={()=>addBlock('gallery')} className="mr-2 px-2 py-1 border">Gallery</button>
        <button onClick={()=>addBlock('poll')} className="mr-2 px-2 py-1 border">Poll</button>
        <button onClick={()=>addBlock('code')} className="mr-2 px-2 py-1 border">Code</button>
        <button onClick={()=>addBlock('audio')} className="mr-2 px-2 py-1 border">Voice note</button>
      </div>

      <div>
        {blocks.map((block, idx)=> (
          <div key={block.id} className="mb-4 border p-3">
            <div className="mb-2 text-sm text-gray-600">{block.type}</div>
            {block.type==='paragraph' && (
              <textarea className="w-full border p-2" rows={4} value={block.data.text} onChange={e=>{
                const text = e.target.value
                setBlocks(bs=>bs.map(b=>b.id===block.id?{...b,data:{text}}:b))
              }} />
            )}
            {block.type==='callout' && (
              <div>
                <input className="w-full border p-2 mb-2" placeholder="Emoji or icon" onChange={e=>{
                  const icon = e.target.value
                  setBlocks(bs=>bs.map(b=>b.id===block.id?{...b,data:{...b.data,icon}}:b))
                }} />
                <textarea className="w-full border p-2" rows={3} placeholder="Callout text" onChange={e=>{
                  const text = e.target.value
                  setBlocks(bs=>bs.map(b=>b.id===block.id?{...b,data:{...b.data,text}}:b))
                }} />
              </div>
            )}
            {block.type==='pullquote' && (
              <textarea className="w-full border p-2" rows={3} onChange={e=>{
                const text = e.target.value
                setBlocks(bs=>bs.map(b=>b.id===block.id?{...b,data:{text}}:b))
              }} />
            )}
            {block.type==='divider' && (
              <select className="border p-2" onChange={e=>{
                const style = e.target.value
                setBlocks(bs=>bs.map(b=>b.id===block.id?{...b,data:{style}}:b))
              }}>
                <option value="line">Line</option>
                <option value="dots">Dots</option>
                <option value="ornament">Ornament</option>
              </select>
            )}
            {block.type==='gallery' && (
              <div>
                <input type="file" multiple accept="image/*" onChange={e=>{
                  const files = e.target.files
                  if(!files) return
                  Array.from(files).slice(0,9).forEach(file=>{
                    const reader = new FileReader()
                    reader.onload = ()=>{
                      const url = reader.result as string
                      setBlocks(bs=>bs.map(b=>b.id===block.id?{...b,data:{images: [...(b.data.images||[]), url]}}:b))
                    }
                    reader.readAsDataURL(file)
                  })
                }} />
                <div className="grid grid-cols-3 gap-2 mt-2">
                  {(block.data.images||[]).map((img:string, i:number)=> <img key={i} src={img} className="w-full h-24 object-cover" />)}
                </div>
              </div>
            )}
            {block.type==='poll' && (
              <div>
                <input className="w-full border p-2 mb-2" placeholder="Question" onChange={e=>{
                  const q = e.target.value
                  setBlocks(bs=>bs.map(b=>b.id===block.id?{...b,data:{...b.data,question:q}}:b))
                }} />
                <div>
                  {(block.data.options||['','']).map((opt:string, i:number)=> (
                    <input key={i} className="w-full border p-2 mb-1" placeholder={`Option ${i+1}`} value={opt} onChange={e=>{
                      const v = e.target.value
                      setBlocks(bs=>bs.map(b=>b.id===block.id?{...b,data:{...b.data,options: bs.find(x=>x.id===block.id)?.data.options.map((o:any,idx:number)=> idx===i?v:o)}}:b))
                    }} />
                  ))}
                  <button className="mt-2 px-2 py-1 border" onClick={()=>{
                    setBlocks(bs=>bs.map(b=>b.id===block.id?{...b,data:{...b.data,options:[...(b.data.options||[]),'']}}:b))
                  }}>Add option</button>
                </div>
              </div>
            )}
            {block.type==='code' && (
              <textarea className="w-full font-mono bg-gray-900 text-white p-2" rows={6} onChange={e=>{
                const code = e.target.value
                setBlocks(bs=>bs.map(b=>b.id===block.id?{...b,data:{code}}:b))
              }} />
            )}
            {block.type==='audio' && (
              <AudioRecorder onRecord={(dataUrl:string)=>{
                setBlocks(bs=>bs.map(b=>b.id===block.id?{...b,data:{audio:dataUrl}}:b))
              }} />
            )}
          </div>
        ))}
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
