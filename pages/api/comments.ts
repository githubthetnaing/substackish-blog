import { NextApiRequest, NextApiResponse } from 'next'
import { supabase } from '../../lib/supabaseClient'

export default async function handler(req: NextApiRequest, res: NextApiResponse){
  if (!supabase) {
    return res.status(500).json({ error: 'Supabase is not configured' })
  }

  if(req.method==='GET'){
    const post_id = req.query.post_id as string
    const { data } = await supabase.from('comments').select('*').eq('post_id', post_id).order('created_at',{ascending:true})
    res.status(200).json(data)
    return
  }
  if(req.method==='POST'){
    const { post_id, author, content } = req.body
    const { data, error } = await supabase.from('comments').insert([{post_id, author, content}]).select().maybeSingle()
    if(error) return res.status(500).json({error: error.message})
    res.status(200).json(data)
    return
  }
  res.status(405).end()
}
