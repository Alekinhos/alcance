import { criarClienteServidor } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { FormularioEditarEvento } from './formulario'
import type { PapelUsuario } from '@/types/supabase'

interface Props {
  params: Promise<{ id: string }>
}

export default async function PaginaEditarEvento({ params }: Props) {
  const { id } = await params
  const supabase = await criarClienteServidor()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: perfil } = await supabase
    .from('profiles')
    .select('papel')
    .eq('id', user.id)
    .single()

  const papel = perfil?.papel as PapelUsuario
  const podeEditar = papel === 'admin' || papel === 'pastor' || papel === 'lider'
  if (!podeEditar) redirect('/dashboard/eventos')

  const { data: evento } = await supabase
    .from('eventos')
    .select('*')
    .eq('id', id)
    .single()

  if (!evento) notFound()

  return <FormularioEditarEvento evento={evento} />
}
