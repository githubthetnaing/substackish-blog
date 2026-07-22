import React, { useEffect, useState } from 'react'
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

      <EditorContent editor={editor} />

      <div className="border-t p-3 bg-white space-y-3">
        <div className="flex gap-2">
          <input className="flex-1 border p-2" placeholder="Image URL" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} />
          <button type="button" onClick={addImage} className="px-3 py-2 border">Add image</button>
        </div>
        <div className="flex gap-2">
          <input className="flex-1 border p-2" placeholder="YouTube URL" value={youtubeUrl} onChange={(e) => setYoutubeUrl(e.target.value)} />
          <button type="button" onClick={addYoutube} className="px-3 py-2 border">Embed video</button>
        </div>
      </div>
    </div>
  )
}
