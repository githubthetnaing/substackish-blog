import { NextApiRequest, NextApiResponse } from 'next'
import { supabase } from '../../lib/supabaseClient'

export default async function handler(req: NextApiRequest, res: NextApiResponse){
  if (!supabase) {
    return res.status(500).json({ error: 'Supabase is not configured' })
  }

  if(req.method==='POST'){
    const { poll_id, option } = req.body
    // increment vote count in Supabase
    const { data, error } = await supabase.from('poll_votes').insert([{poll_id, option}])
    if(error) return res.status(500).json({error:error.message})
    res.status(200).json({ok:true})
    return
  }
  res.status(405).end()
}
