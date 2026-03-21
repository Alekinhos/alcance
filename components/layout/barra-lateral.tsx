'use client'

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
]

export function BarraLateral({ papelUsuario }: PropsBarraLateral) {
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
    <aside className="flex h-screen w-64 flex-col border-r border-gray-200 bg-white">
      {/* Logo */}
      <div className="flex h-16 items-center gap-2 border-b border-gray-200 px-6">
        <Church className="h-7 w-7 text-blue-600" />
        <span className="text-lg font-bold text-gray-900">Alcance</span>
      </div>

      {/* Navegação */}
      <nav className="flex-1 overflow-y-auto p-4">
        <ul className="space-y-1">
          {itensVisiveis.map((item) => {
            const Icone = item.icone
            const ativo = caminho === item.href || (item.href !== '/dashboard' && caminho.startsWith(item.href))

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                    ativo
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
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
      <div className="border-t border-gray-200 p-4">
        <button
          onClick={sair}
          className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50 hover:text-gray-900"
        >
          <LogOut className="h-5 w-5" />
          Sair
        </button>
      </div>
    </aside>
  )
}
