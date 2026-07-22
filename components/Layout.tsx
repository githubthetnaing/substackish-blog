import React from 'react'
import Link from 'next/link'

export const Layout: React.FC<{children: React.ReactNode}> = ({children}) => {
  return (
    <div className="min-h-screen flex flex-col items-center">
      <header className="w-full border-b py-6">
        <div className="max-w-3xl mx-auto px-4 flex justify-between items-center">
          <Link href="/" className="text-xl font-semibold">The Daily Brew</Link>
          <nav>
            <Link href="/archive" className="mr-4">Archive</Link>
              <Link href="/about" className="mr-4">About</Link>
              <Link href="/admin/login">Writer</Link>
          </nav>
        </div>
      </header>
      <main className="w-full flex-1 py-12">
        <div className="max-w-3xl mx-auto px-4">{children}</div>
      </main>
      <footer className="w-full border-t py-6">
        <div className="max-w-3xl mx-auto px-4 text-sm text-gray-600">© {new Date().getFullYear()} The Daily Brew</div>
      </footer>
    </div>
  )
}
export default Layout
