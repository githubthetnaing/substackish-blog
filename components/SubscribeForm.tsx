import React, {useState} from 'react'

export default function SubscribeForm(){
  const [email,setEmail] = useState('')
  const [sent,setSent] = useState(false)
  const submit = async (e:any)=>{
    e.preventDefault()
    const res = await fetch('/api/subscribers', { method:'POST', headers:{'content-type':'application/json'}, body: JSON.stringify({email}) })
    if(res.ok) setSent(true)
  }
  return (
    <form onSubmit={submit} className="mt-4">
      {sent ? <div className="p-3 bg-green-50 border rounded">Thanks — you're subscribed.</div> : (
        <div className="flex">
          <input className="flex-1 border p-2 mr-2" placeholder="Your email" value={email} onChange={e=>setEmail(e.target.value)} />
          <button className="px-4 py-2 bg-accent text-white rounded">Subscribe</button>
        </div>
      )}
    </form>
  )
}
