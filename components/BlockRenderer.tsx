import React from 'react'
import LikeButton from './LikeButton'

export default function BlockRenderer({blocks}:{blocks:any[]}){
  return (
    <div>
      {blocks.map((b,i)=>{
        if (b.type === 'richtext') {
          return <div key={i} dangerouslySetInnerHTML={{ __html: b.data?.html || '' }} />
        }
        switch(b.type){
          case 'paragraph': return <p key={i}>{b.data.text}</p>
          case 'callout': return <div key={i} className="p-4 bg-yellow-50 border-l-4 border-yellow-300">{b.data.icon && <div className="text-2xl">{b.data.icon}</div>}<div>{b.data.text}</div></div>
          case 'pullquote': return <blockquote key={i} className="text-xl text-center font-serif my-6">{b.data.text}</blockquote>
          case 'divider': return <hr key={i} className="my-6" />
          case 'gallery': return <div key={i} className="grid grid-cols-3 gap-2">{(b.data.images||[]).map((src:string,idx:number)=><img key={idx} src={src} className="w-full h-40 object-cover" />)}</div>
          case 'code': return <pre key={i} className="bg-gray-900 text-white p-4 overflow-auto font-mono"><code>{b.data.code}</code></pre>
          case 'audio': return <audio key={i} controls src={b.data.audio} />
          case 'poll': return <PollBlock key={i} data={b.data} pollId={b.id} />
          default: return <div key={i}>Unsupported block: {b.type}</div>
        }
      })}
    </div>
  )
}

function PollBlock({data,pollId}:{data:any,pollId:string}){
  const [voted,setVoted] = React.useState(false)
  const [results,setResults] = React.useState<number[]>(data?.options?.map((_:any)=>0) || [])
  const vote = async (idx:number)=>{
    await fetch('/api/polls', { method:'POST', headers:{'content-type':'application/json'}, body: JSON.stringify({ poll_id: pollId, option: idx }) })
    setVoted(true)
    setResults(r=>r.map((v,i)=> i===idx? v+1 : v ))
  }
  return (
    <div className="p-4 border rounded">
      <div className="font-semibold mb-2">{data.question}</div>
      {!voted ? data.options.map((opt:string, i:number)=> <button key={i} onClick={()=>vote(i)} className="block w-full text-left p-2 border mb-2">{opt}</button>) : (
        <div>
          {results.map((r:number,i:number)=> <div key={i} className="mb-2">{data.options[i]} — {r} votes</div>)}
        </div>
      )}
    </div>
  )
}
