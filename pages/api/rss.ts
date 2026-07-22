import { NextApiRequest, NextApiResponse } from 'next'
import { supabase } from '../../lib/supabaseClient'

export default async function handler(req: NextApiRequest, res: NextApiResponse){
  const { data } = await supabase.from('posts').select('*').eq('status','published').order('published_at',{ascending:false})
  const items = (data||[]).map((p:any)=>`<item><title>${escapeXml(p.title)}</title><link>${process.env.NEXT_PUBLIC_SITE_URL || 'https://example.com'}/post/${p.slug}</link><pubDate>${new Date(p.published_at).toUTCString()}</pubDate><description>${escapeXml(p.subtitle||'')}</description></item>`).join('\n')
  const rss = `<?xml version="1.0" encoding="UTF-8" ?>\n<rss version="2.0"><channel><title>The Daily Brew</title><link>${process.env.NEXT_PUBLIC_SITE_URL||'https://example.com'}</link><description>Newsletter-style blog</description>${items}</channel></rss>`
  res.setHeader('Content-Type','application/rss+xml')
  res.status(200).send(rss)
}

function escapeXml(str:string){
  return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;')
}
