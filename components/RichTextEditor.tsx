import React, { useEffect, useState, useRef } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import Link from '@tiptap/extension-link'
import Image from '@tiptap/extension-image'
import Youtube from '@tiptap/extension-youtube'
import { Table } from '@tiptap/extension-table'
import { TableRow } from '@tiptap/extension-table-row'
import { TableCell } from '@tiptap/extension-table-cell'
import { TableHeader } from '@tiptap/extension-table-header'
import { TextStyle } from '@tiptap/extension-text-style'
import { Color } from '@tiptap/extension-color'
import { supabase } from '../lib/supabaseClient'

type Props = {
  value?: string
  onChange?: (value: string) => void
}

const MenuButton = ({ label, onClick, active = false }: { label: string; onClick: () => void; active?: boolean }) => (
  <button
    type="button"
    onClick={onClick}
    className={`px-2 py-1 text-sm rounded border ${active ? 'bg-black text-white' : 'bg-white text-black'}`}
  >
    {label}
  </button>
)

export default function RichTextEditor({ value = '', onChange }: Props) {
  const [imageUrl, setImageUrl] = useState('')
  const [youtubeUrl, setYoutubeUrl] = useState('')
  const [showSlashMenu, setShowSlashMenu] = useState(false)
  const [slashMenuPos, setSlashMenuPos] = useState<{ top: number; left: number } | null>(null)
  const [slashQuery, setSlashQuery] = useState('')
  const editorRef = useRef<any>(null)
  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [1, 2, 3] } }),
      Placeholder.configure({ placeholder: 'Write your post here...' }),
      Link.configure({ openOnClick: false }),
      Image.configure({ allowBase64: true }),
      Youtube.configure({ width: 640, height: 360 }),
      Table.configure({ resizable: true }),
      TableRow,
      TableCell,
      TableHeader,
      TextStyle,
      Color,
    ],
    content: value || '<p></p>',
    editorProps: {
      attributes: {
        class: 'min-h-[240px] border rounded p-4 prose prose-sm max-w-none focus:outline-none'
      }
    },
    onUpdate: ({ editor }) => {
      onChange?.(editor.getHTML())
    }
  })

  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value || '<p></p>')
    }
  }, [value, editor])

  // keep ref
  useEffect(()=>{ editorRef.current = editor }, [editor])

  if (!editor) return null

  const addImage = () => {
    if (!imageUrl) return
    editor.chain().focus().setImage({ src: imageUrl }).run()
    setImageUrl('')
  }

  const addYoutube = () => {
    if (!youtubeUrl) return
    editor.commands.setYoutubeVideo({ src: youtubeUrl })
    setYoutubeUrl('')
  }

  // upload File to Supabase storage if available, fallback to base64
  const uploadImageFile = async (file: File) => {
    try{
      if (supabase) {
        const filePath = `images/${Date.now()}-${file.name}`
        const { data, error } = await supabase.storage.from('images').upload(filePath, file, { cacheControl: '3600', upsert: false })
        if(error) throw error
        const { data: urlData } = supabase.storage.from('images').getPublicUrl(filePath)
        return urlData.publicUrl
      }
    }catch(e){
      // fallback to base64
    }
    return await new Promise<string>((resolve)=>{
      const reader = new FileReader()
      reader.onload = ()=> resolve(String(reader.result))
      reader.readAsDataURL(file)
    })
  }

  const handleFileInput = async (e: React.ChangeEvent<HTMLInputElement>) =>{
    const f = e.target.files?.[0]
    if(!f || !editor) return

    const reader = new FileReader()
    reader.onload = async ()=>{
      const dataUrl = String(reader.result)
      try{
        const resp = await fetch('/api/upload', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ fileName: f.name, dataUrl })
        })
        const json = await resp.json()
        if(resp.ok && json.publicUrl){
          editor.chain().focus().setImage({ src: json.publicUrl }).run()
        } else {
          // fallback to base64
          editor.chain().focus().setImage({ src: dataUrl }).run()
        }
      }catch(err){
        // fallback to base64
        editor.chain().focus().setImage({ src: dataUrl }).run()
      }
    }
    reader.readAsDataURL(f)
    e.target.value = ''
  }

  // Slash menu handlers
  const insertFromSlash = (action: string) => {
    if(!editor) return
    switch(action){
      case 'h1': editor.chain().focus().toggleHeading({ level: 1 }).run(); break
      case 'h2': editor.chain().focus().toggleHeading({ level: 2 }).run(); break
      case 'h3': editor.chain().focus().toggleHeading({ level: 3 }).run(); break
      case 'table': editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run(); break
      case 'blockquote': editor.chain().focus().toggleBlockquote().run(); break
      case 'code': editor.chain().focus().toggleCodeBlock().run(); break
      case 'image': editor.chain().focus().setImage({ src: imageUrl || '' }).run(); break
      default: break
    }
    setShowSlashMenu(false)
    setSlashQuery('')
  }

  const handleKeyDown = (e: React.KeyboardEvent) =>{
    if(!editor) return
    // detect slash at start of block
    if(e.key === '/' ){
      const sel = editor.state.selection
      const { from } = sel
      const dom = editor.view.domAtPos(from)
      const rect = (dom.node as HTMLElement).getBoundingClientRect()
      setSlashMenuPos({ top: rect.top + 24, left: rect.left })
      setShowSlashMenu(true)
      setSlashQuery('')
      return
    }
    if(showSlashMenu){
      if(e.key === 'Escape'){
        setShowSlashMenu(false)
        setSlashQuery('')
      }
    }
  }

  return (
    <div className="border rounded">
      <div className="flex flex-wrap gap-2 border-b p-2 bg-gray-50">
        <MenuButton label="Bold" onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive('bold')} />
        <MenuButton label="Italic" onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive('italic')} />
        <MenuButton label="H1" onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} active={editor.isActive('heading', { level: 1 })} />
        <MenuButton label="H2" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editor.isActive('heading', { level: 2 })} />
        <MenuButton label="H3" onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} active={editor.isActive('heading', { level: 3 })} />
        <MenuButton label="Bullet List" onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive('bulletList')} />
        <MenuButton label="Ordered List" onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive('orderedList')} />
        <MenuButton label="Quote" onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive('blockquote')} />
        <MenuButton label="Code" onClick={() => editor.chain().focus().toggleCodeBlock().run()} active={editor.isActive('codeBlock')} />
        <MenuButton label="Link" onClick={() => editor.chain().focus().setLink({ href: 'https://example.com' }).run()} />
        <MenuButton label="Table" onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()} />
      </div>
      <div onKeyDown={handleKeyDown}>
        <EditorContent editor={editor} />

        {showSlashMenu && slashMenuPos && (
          <div style={{ position: 'absolute', top: slashMenuPos.top, left: slashMenuPos.left, zIndex: 50 }} className="bg-white border rounded shadow p-2">
            <div className="text-sm mb-1">Insert</div>
            <button className="block text-left w-full p-1 hover:bg-gray-100" onClick={()=>insertFromSlash('h1')}>Heading 1</button>
            <button className="block text-left w-full p-1 hover:bg-gray-100" onClick={()=>insertFromSlash('h2')}>Heading 2</button>
            <button className="block text-left w-full p-1 hover:bg-gray-100" onClick={()=>insertFromSlash('h3')}>Heading 3</button>
            <button className="block text-left w-full p-1 hover:bg-gray-100" onClick={()=>insertFromSlash('table')}>Table</button>
            <button className="block text-left w-full p-1 hover:bg-gray-100" onClick={()=>insertFromSlash('image')}>Image</button>
            <button className="block text-left w-full p-1 hover:bg-gray-100" onClick={()=>insertFromSlash('code')}>Code block</button>
          </div>
        )}

        <div className="border-t p-3 bg-white space-y-3">
          <div className="flex gap-2 items-center">
            <input type="file" accept="image/*" onChange={handleFileInput} className="" />
            <input className="flex-1 border p-2" placeholder="Image URL" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} />
            <button type="button" onClick={addImage} className="px-3 py-2 border">Add image</button>
          </div>
          <div className="flex gap-2">
            <input className="flex-1 border p-2" placeholder="YouTube URL" value={youtubeUrl} onChange={(e) => setYoutubeUrl(e.target.value)} />
            <button type="button" onClick={addYoutube} className="px-3 py-2 border">Embed video</button>
          </div>
        </div>
      </div>
    </div>
  )
}
