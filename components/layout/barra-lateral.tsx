'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Users,
  Calendar,
  DollarSign,
  FileText,
  LayoutDashboard,
  Church,
  LogOut,
  Ticket,
  Menu,
  X,
  Radio,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { criarClienteSupabase } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import type { PapelUsuario } from '@/types/supabase'

interface PropsBarraLateral {
  papelUsuario: PapelUsuario
}

const itensNav = [
  {
    href: '/dashboard',
    rotulo: 'Painel',
    icone: LayoutDashboard,
    papeis: ['admin', 'pastor', 'lider', 'membro'] as PapelUsuario[],
  },
  {
    href: '/dashboard/membros',
    rotulo: 'Membros',
    icone: Users,
    papeis: ['admin', 'pastor', 'lider'] as PapelUsuario[],
  },
  {
    href: '/dashboard/eventos',
    rotulo: 'Eventos',
    icone: Calendar,
    papeis: ['admin', 'pastor', 'lider', 'membro'] as PapelUsuario[],
  },
  {
    href: '/dashboard/financeiro',
    rotulo: 'Financeiro',
    icone: DollarSign,
    papeis: ['admin', 'pastor'] as PapelUsuario[],
  },
  {
    href: '/dashboard/blog',
    rotulo: 'Blog',
    icone: FileText,
    papeis: ['admin', 'pastor', 'lider'] as PapelUsuario[],
  },
  {
    href: '/dashboard/transmissoes',
    rotulo: 'Transmissões',
    icone: Radio,
    papeis: ['admin', 'pastor', 'lider'] as PapelUsuario[],
  },
  {
    href: '/dashboard/convites',
    rotulo: 'Convites',
    icone: Ticket,
    papeis: ['admin', 'pastor'] as PapelUsuario[],
  },
]

export function BarraLateral({ papelUsuario }: PropsBarraLateral) {
  const [aberta, setAberta] = useState(false)
  const caminho = usePathname()
  const router = useRouter()
  const supabase = criarClienteSupabase()

  async function sair() {
    await supabase.auth.signOut()
    router.push('/auth/login')
    router.refresh()
  }

  const itensVisiveis = itensNav.filter((item) =>
    item.papeis.includes(papelUsuario)
  )

  return (
    <>
      {/* Botão hamburguer — mobile only */}
      <button
        className="fixed left-0 top-0 z-50 flex h-14 w-14 items-center justify-center text-porta lg:hidden"
        onClick={() => setAberta(true)}
        aria-label="Abrir menu"
      >
        <Menu className="h-6 w-6" />
      </button>

      {/* Backdrop — mobile only */}
      {aberta && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setAberta(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex h-screen w-64 flex-col border-r border-white/10 bg-porta transition-transform duration-300',
          'lg:relative lg:z-auto lg:translate-x-0',
          aberta ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Botão fechar — mobile only */}
        <button
          className="absolute right-3 top-3 text-white/60 hover:text-white lg:hidden"
          onClick={() => setAberta(false)}
          aria-label="Fechar menu"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Logo */}
        <div className="flex h-16 items-center gap-2 border-b border-white/10 px-6">
          <Church className="h-7 w-7 text-sangue" />
          <span className="text-lg font-bold text-white">Alcance</span>
        </div>

        {/* Navegação */}
        <nav className="flex-1 overflow-y-auto p-4">
          <ul className="space-y-1">
            {itensVisiveis.map((item) => {
              const Icone = item.icone
              const ativo =
                caminho === item.href ||
                (item.href !== '/dashboard' && caminho.startsWith(item.href))

              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={() => setAberta(false)}
                    className={cn(
                      'flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors',
                      ativo
                        ? 'bg-sangue text-white'
                        : 'text-cordeiro/80 hover:bg-white/10 hover:text-white'
                    )}
                  >
                    <Icone className="h-5 w-5 flex-shrink-0" />
                    {item.rotulo}
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>

        {/* Sair */}
        <div className="border-t border-white/10 p-4">
          <button
            onClick={sair}
            className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-cordeiro/80 transition-colors hover:bg-white/10 hover:text-white"
          >
            <LogOut className="h-5 w-5" />
            Sair
          </button>
        </div>
      </aside>
    </>
  )
}
