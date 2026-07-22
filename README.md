# Substack-ish Blog

Minimal, editorial blogging site scaffold using Next.js, Tailwind CSS, and Supabase.

Features:
- Public reading experience (home, post, archive, about)
- Admin/writer area (Supabase magic link auth, block editor)
- Block-based editor with callouts, quotes, dividers, galleries, audio notes, footnotes, code, polls
- Deployable to Vercel

Quick start:

1. Install dependencies

```bash
npm install
```

2. Create a Supabase project and get `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.

3. Add a `.env.local` in project root with:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

4. Run dev server

```bash
npm run dev
```

Deploy: push to GitHub and link to Vercel. Set the environment variables in Vercel.

Notes:
- This scaffold provides core components and a simple JSON-block editor. Extend blocks and storage as needed.
