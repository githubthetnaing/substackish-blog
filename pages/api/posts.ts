import { NextApiRequest, NextApiResponse } from 'next'
import { supabase } from '../../lib/supabaseClient'

export default async function handler(req: NextApiRequest, res: NextApiResponse){
  if (!supabase) {
    return res.status(500).json({ error: 'Supabase is not configured' })
  }

  if(req.method === 'GET'){
    const { slug } = req.query
    if(slug){
      const { data, error } = await supabase.from('posts').select('*').eq('slug', slug).maybeSingle()
      if(error) return res.status(500).json({error: error.message})
      return res.status(200).json(data)
    }
    const { data, error } = await supabase.from('posts').select('*').eq('status','published').order('published_at',{ascending:false})
    if(error) return res.status(500).json({error: error.message})
    return res.status(200).json(data)
  }

  if(req.method === 'POST'){
    const allowed = process.env.ALLOWED_ADMINS || ''
    const { author_email, title, subtitle, content, status, slug, cover_url, tags } = req.body
    const isAllowed = !allowed || allowed.split(',').map(s=>s.trim()).includes(author_email)
    if(!isAllowed){
      return res.status(403).json({ error: 'not_allowed' })
    }

    // find or create user
    const { data: user } = await supabase.from('users').select('*').ilike('email', author_email).maybeSingle()
    let author_id = user?.id
    if(!author_id){
      const { data: newUser } = await supabase.from('users').insert([{ email: author_email }]).select().maybeSingle()
      author_id = newUser?.id
    }

    const insert: Record<string, any> = {
      title, subtitle, content, status: status||'draft', author_id, slug, cover_url, tags
    }
    if(status==='published') insert.published_at = new Date().toISOString()

    const { data, error } = await supabase.from('posts').insert([insert]).select().maybeSingle()
    if(error) return res.status(500).json({error: error.message})
    return res.status(200).json(data)
  }

  if(req.method === 'PUT'){
    const { id, author_email, ...updates } = req.body
    const allowed = process.env.ALLOWED_ADMINS || ''
    const isAllowed = !allowed || allowed.split(',').map(s=>s.trim()).includes(author_email)
    if(!isAllowed){
      return res.status(403).json({ error: 'not_allowed' })
    }
    if(updates.status==='published') updates.published_at = new Date().toISOString()
    const { data, error } = await supabase.from('posts').update(updates).eq('id', id).select().maybeSingle()
    if(error) return res.status(500).json({error: error.message})
    return res.status(200).json(data)
  }

  if(req.method === 'DELETE'){
    const { id, author_email } = req.body
    const allowed = process.env.ALLOWED_ADMINS || ''
    const isAllowed = !allowed || allowed.split(',').map(s=>s.trim()).includes(author_email)
    if(!isAllowed){
      return res.status(403).json({ error: 'not_allowed' })
    }
    const { error } = await supabase.from('posts').delete().eq('id', id)
    if(error) return res.status(500).json({error: error.message})
    return res.status(200).json({ok:true})
  }

  res.status(405).end()
}
