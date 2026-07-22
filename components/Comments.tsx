import React, {useEffect, useState} from 'react'

export default function Comments({postId}:{postId:string}){
  const [comments, setComments] = useState<any[]>([])
  const [text, setText] = useState('')
  useEffect(()=>{ fetchComments() },[postId])
  const fetchComments = async ()=>{
    const res = await fetch('/api/comments?post_id='+postId)
    if(res.ok){ const data = await res.json(); setComments(data||[]) }
  }
  const submit = async (e:any)=>{
    e.preventDefault()
    await fetch('/api/comments', { method:'POST', headers:{'content-type':'application/json'}, body: JSON.stringify({ post_id: postId, author: 'Reader', content: text }) })
    setText('')
    fetchComments()
  }
  return (
    <div>
      <h3 className="text-lg font-semibold mb-2">Comments</h3>
      <form onSubmit={submit} className="mb-4">
        <textarea className="w-full border p-2 mb-2" rows={3} value={text} onChange={e=>setText(e.target.value)} />
        <button className="px-3 py-1 bg-accent text-white rounded">Post comment</button>
      </form>
      <div>
        {comments.map(c=> (
          <div key={c.id} className="border-b py-2">
            <div className="text-sm text-gray-600">{c.author} • {new Date(c.created_at).toLocaleString()}</div>
            <div>{c.content}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
