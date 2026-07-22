import React, {useState, useEffect} from 'react'

export default function LikeButton({postId}:{postId:string}){
  const [count,setCount] = useState<number>(0)
  useEffect(()=>{
    fetch('/api/likes?post_id='+postId).then(r=>r.json()).then(d=>{
      if(Array.isArray(d)) setCount(d.length)
      else if(d?.count) setCount(d.count)
    })
  },[postId])
  const like = async ()=>{
    await fetch('/api/likes', { method:'POST', headers:{'content-type':'application/json'}, body: JSON.stringify({post_id: postId}) })
    setCount(c=>c+1)
  }
  return <button onClick={like} className="px-3 py-1 bg-accent text-white rounded">Like ({count})</button>
}
