import { criarClienteServidor } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { FormularioNovaTransacao } from './formulario'
import type { PapelUsuario } from '@/types/supabase'

export default async function PaginaNovaTransacao() {
  const supabase = await criarClienteServidor()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: perfil } = await supabase
    .from('profiles')
    .select('papel')
    .eq('id', user.id)
    .single()

  const papel = perfil?.papel as PapelUsuario
  if (!['admin', 'pastor'].includes(papel)) redirect('/dashboard')

  const { data: membros } = await supabase
    .from('profiles')
    .select('id, nome')
    .order('nome')

  return <FormularioNovaTransacao membros={membros ?? []} />
}
