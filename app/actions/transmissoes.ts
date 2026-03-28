'use server'

import { criarClienteServidor } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

export async function criarTransmissao(formData: FormData) {
  const supabase = await criarClienteServidor()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const aoVivo = formData.get('ao_vivo') === 'true'

  // Se marcar como ao vivo, desmarca as outras
  if (aoVivo) {
    await supabase.from('transmissoes').update({ ao_vivo: false }).eq('ao_vivo', true)
  }

  const { error } = await supabase.from('transmissoes').insert({
    titulo: formData.get('titulo') as string,
    descricao: (formData.get('descricao') as string) || null,
    youtube_url: formData.get('youtube_url') as string,
    ao_vivo: aoVivo,
    data: formData.get('data') as string,
    criado_por: user.id,
  })

  if (error) return { erro: error.message }

  revalidatePath('/dashboard/transmissoes')
  revalidatePath('/ao-vivo')
  revalidatePath('/')
  redirect('/dashboard/transmissoes')
}

export async function atualizarTransmissao(id: string, formData: FormData) {
  const supabase = await criarClienteServidor()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const aoVivo = formData.get('ao_vivo') === 'true'

  // Se marcar como ao vivo, desmarca as outras
  if (aoVivo) {
    await supabase.from('transmissoes').update({ ao_vivo: false }).neq('id', id)
  }

  const { error } = await supabase
    .from('transmissoes')
    .update({
      titulo: formData.get('titulo') as string,
      descricao: (formData.get('descricao') as string) || null,
      youtube_url: formData.get('youtube_url') as string,
      ao_vivo: aoVivo,
      data: formData.get('data') as string,
    })
    .eq('id', id)

  if (error) return { erro: error.message }

  revalidatePath('/dashboard/transmissoes')
  revalidatePath('/ao-vivo')
  revalidatePath('/')
  redirect('/dashboard/transmissoes')
}

export async function excluirTransmissao(id: string) {
  const supabase = await criarClienteServidor()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  await supabase.from('transmissoes').delete().eq('id', id)
  revalidatePath('/dashboard/transmissoes')
  revalidatePath('/ao-vivo')
  revalidatePath('/')
}
