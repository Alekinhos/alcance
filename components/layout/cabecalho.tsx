import { criarClienteServidor } from '@/lib/supabase/server'
import { Bell } from 'lucide-react'

interface PropsCabecalho {
  titulo: string
}

export async function Cabecalho({ titulo }: PropsCabecalho) {
  const supabase = await criarClienteServidor()
  const { data: { user } } = await supabase.auth.getUser()

  let nomeUsuario = 'Usuário'
  if (user) {
    const { data: perfil } = await supabase
      .from('profiles')
      .select('nome')
      .eq('id', user.id)
      .single()
    if (perfil) nomeUsuario = perfil.nome
  }

  return (
    <header className="flex h-16 items-center justify-between border-b border-gray-200 bg-white px-6">
      <h1 className="text-xl font-semibold text-gray-900">{titulo}</h1>
      <div className="flex items-center gap-4">
        <button className="rounded-full p-2 text-gray-500 hover:bg-gray-100">
          <Bell className="h-5 w-5" />
        </button>
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-sm font-medium text-white">
            {nomeUsuario.charAt(0).toUpperCase()}
          </div>
          <span className="text-sm text-gray-700">{nomeUsuario}</span>
        </div>
      </div>
    </header>
  )
}
