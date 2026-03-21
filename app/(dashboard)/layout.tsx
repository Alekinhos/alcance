import { redirect } from 'next/navigation'
import { criarClienteServidor } from '@/lib/supabase/server'
import { BarraLateral } from '@/components/layout/barra-lateral'
import type { PapelUsuario } from '@/types/supabase'

export default async function LayoutDashboard({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await criarClienteServidor()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login')

  const { data: perfil } = await supabase
    .from('profiles')
    .select('papel')
    .eq('id', user.id)
    .single()

  const papelUsuario: PapelUsuario = perfil?.papel ?? 'membro'

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <BarraLateral papelUsuario={papelUsuario} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  )
}
