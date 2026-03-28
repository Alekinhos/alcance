'use server'

import { criarClienteServidor } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

export async function criarEvento(formData: FormData) {
  const supabase = await criarClienteServidor()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const recorrente = formData.get('recorrente') === 'true'

  const { error } = await supabase.from('eventos').insert({
    titulo: formData.get('titulo') as string,
    descricao: (formData.get('descricao') as string) || null,
    data: formData.get('data') as string,
    hora: (formData.get('hora') as string) || null,
    local: (formData.get('local') as string) || null,
    tipo: (formData.get('tipo') as 'culto' | 'reuniao' | 'retiro' | 'outro'),
    recorrente,
    frequencia: recorrente ? (formData.get('frequencia') as string) || null : null,
    data_fim_recorrencia: recorrente ? (formData.get('data_fim_recorrencia') as string) || null : null,
    criado_por: user.id,
  })

  if (error) return { erro: error.message }

  revalidatePath('/dashboard/eventos')
  revalidatePath('/eventos')
  redirect('/dashboard/eventos')
}

export async function atualizarEvento(id: string, formData: FormData) {
  const supabase = await criarClienteServidor()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const recorrente = formData.get('recorrente') === 'true'

  const { error } = await supabase
    .from('eventos')
    .update({
      titulo: formData.get('titulo') as string,
      descricao: (formData.get('descricao') as string) || null,
      data: formData.get('data') as string,
      hora: (formData.get('hora') as string) || null,
      local: (formData.get('local') as string) || null,
      tipo: (formData.get('tipo') as 'culto' | 'reuniao' | 'retiro' | 'outro'),
      recorrente,
      frequencia: recorrente ? (formData.get('frequencia') as string) || null : null,
      data_fim_recorrencia: recorrente ? (formData.get('data_fim_recorrencia') as string) || null : null,
    })
    .eq('id', id)

  if (error) return { erro: error.message }

  revalidatePath('/dashboard/eventos')
  revalidatePath('/eventos')
  redirect('/dashboard/eventos')
}

export async function excluirEvento(id: string) {
  const supabase = await criarClienteServidor()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  await supabase.from('eventos').delete().eq('id', id)
  revalidatePath('/dashboard/eventos')
  revalidatePath('/eventos')
}
