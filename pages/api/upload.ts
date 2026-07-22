import type { NextApiRequest, NextApiResponse } from 'next'
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

const supabaseAdmin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY)

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end()
  const { fileName, dataUrl } = req.body as { fileName?: string; dataUrl?: string }
  if (!fileName || !dataUrl) return res.status(400).json({ error: 'missing' })

  try {
    const matches = dataUrl.match(/^data:(.+);base64,(.+)$/)
    if (!matches) return res.status(400).json({ error: 'invalid_dataurl' })
    const mime = matches[1]
    const b64 = matches[2]
    const buffer = Buffer.from(b64, 'base64')
    const path = `images/${Date.now()}-${fileName}`

    const { error: uploadErr } = await supabaseAdmin.storage.from('images').upload(path, buffer, {
      contentType: mime,
      upsert: false,
    })
    if (uploadErr) throw uploadErr

    const { data } = supabaseAdmin.storage.from('images').getPublicUrl(path)
    return res.status(200).json({ publicUrl: data.publicUrl })
  } catch (err: any) {
    return res.status(500).json({ error: err.message || String(err) })
  }
}
