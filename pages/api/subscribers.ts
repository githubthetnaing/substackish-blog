import { NextApiRequest, NextApiResponse } from 'next'
import { supabase } from '../../lib/supabaseClient'

export default async function handler(req: NextApiRequest, res: NextApiResponse){
  if (!supabase) {
    return res.status(500).json({ error: 'Supabase is not configured' })
  }

  if(req.method === 'POST'){
    const { email } = req.body
    if(!email) return res.status(400).json({ error: 'missing_email' })
    const { data, error } = await supabase.from('subscribers').upsert([{ email }], { onConflict: 'email' }).select().maybeSingle()
    if(error) return res.status(500).json({error: error.message})
    return res.status(200).json(data)
  }
  res.status(405).end()
}
