import { NextApiRequest, NextApiResponse } from 'next'
import { supabase } from '../../lib/supabaseClient'

export default async function handler(req: NextApiRequest, res: NextApiResponse){
  if (!supabase) {
    return res.status(500).json({ error: 'Supabase is not configured' })
  }

  if(req.method === 'POST'){
    const { post_id } = req.body
    const { data, error } = await supabase.from('likes').insert([{ post_id }]).select().maybeSingle()
    if(error) return res.status(500).json({error: error.message})
    return res.status(200).json(data)
  }
  if(req.method === 'GET'){
    const post_id = req.query.post_id as string
    if(post_id){
      const { data, error, count } = await supabase.from('likes').select('*', { count: 'exact' }).eq('post_id', post_id)
      if(error) return res.status(500).json({error: error.message})
      return res.status(200).json({ count })
    }
    res.status(400).json({ error: 'missing_post_id' })
    return
  }
  res.status(405).end()
}
