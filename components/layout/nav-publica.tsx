'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Church, Menu, X } from 'lucide-react'
import { cn } from '@/lib/utils'

const links = [
  { href: '/eventos', label: 'Eventos' },
  { href: '/blog', label: 'Blog' },
  { href: '/ao-vivo', label: 'Ao Vivo' },
]

export function NavPublica() {
  const [aberta, setAberta] = useState(false)
  const caminho = usePathname()

  return (
    <header className="sticky top-0 z-40 border-b border-pao bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link href="/" className="flex items-center gap-2 text-porta">
          <Church className="h-6 w-6 text-sangue" />
          <span className="font-bold">Igreja Alcance</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-6 md:flex">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={cn(
                'text-sm transition-colors hover:text-porta',
                caminho === l.href ? 'font-medium text-porta' : 'text-pao'
              )}
            >
              {l.label}
            </Link>
          ))}
          <Link
            href="/auth/login"
            className="rounded-md bg-sangue px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-porta"
          >
            Entrar
          </Link>
        </nav>

        {/* Mobile hamburguer */}
        <button
          className="rounded-md p-2 text-porta md:hidden"
          onClick={() => setAberta(!aberta)}
          aria-label="Menu"
        >
          {aberta ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      {aberta && (
        <div className="border-t border-pao bg-white px-4 py-4 md:hidden">
          <nav className="flex flex-col gap-3">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setAberta(false)}
                className={cn(
                  'rounded-md px-3 py-2 text-sm font-medium transition-colors',
                  caminho === l.href
                    ? 'bg-cordeiro text-porta'
                    : 'text-pao hover:bg-cordeiro hover:text-porta'
                )}
              >
                {l.label}
              </Link>
            ))}
            <Link
              href="/auth/login"
              onClick={() => setAberta(false)}
              className="mt-1 rounded-md bg-sangue px-3 py-2 text-center text-sm font-medium text-white hover:bg-porta"
            >
              Entrar
            </Link>
          </nav>
        </div>
      )}
    </header>
  )
}
