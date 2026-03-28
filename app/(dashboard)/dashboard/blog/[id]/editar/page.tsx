import { criarClienteServidor } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { FormularioEditarPost } from './formulario'
import type { PapelUsuario } from '@/types/supabase'

interface Props {
  params: Promise<{ id: string }>
}

export default async function PaginaEditarPost({ params }: Props) {
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
  if (papel === 'membro') redirect('/dashboard')

  const { data: post } = await supabase
    .from('posts')
    .select('*')
    .eq('id', id)
    .single()

  if (!post) notFound()

  return <FormularioEditarPost post={post} />
}
